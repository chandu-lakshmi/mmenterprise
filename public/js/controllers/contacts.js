(function () {
"use strict";

angular.module('app.contact', ['ui.grid', 'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav', 'ui.grid.selection'])

// already existing bucket name
.directive('checkBucket', [function() {
    return {
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {
            elem.add(attr.id).on('blur', function() {
                scope.$apply(function() {
                    var bkNames = scope.$eval(attr.arrayBucket);
                    var bol = false;
                    for(var i in bkNames){
                        if(bkNames[i].bucket_name==attr.bucketName){
                            ctrl.$setValidity('bucketmatch', false);
                            bol=true;
                        }
                    }
                    if(!bol){
                         ctrl.$setValidity('bucketmatch', true);
                    }
                });
            });
        }
    }
}])

// bucket names service
.service('buckets',function(){
    var bucket_names = {}

    this.setData = function(obj){
        bucket_names = obj;
    }

    this.getData = function(){
        return bucket_names;
    }

    this.addProperty = function(obj){
        bucket_names.push(obj)
    }
})

.controller('ContactsController',['$scope', '$http', '$q', '$interval', 'buckets', 'CONFIG', function($scope, $http, $q, $interval, buckets, CONFIG){
	
	var scope = this;

    //get bucketNames
    var get_buckets = $http({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        method: 'POST',
        url: CONFIG.APP_DOMAIN+'buckets_list'
    })
    get_buckets.success(function(response){
        if(response.status_code == 200){
            scope.bucketNames = response.data;
            buckets.setData(scope.bucketNames);
        }
        // Session Destroy
        else if(response.status_code == 400){
            $window.location = CONFIG.APP_DOMAIN+'logout';
        }
    });
    get_buckets.error(function(response){
        console.log(response);
    })

    
    var rightLimit = 100;
    var rightDyn = 0;

    this.getPage = function(bol){

        var valueInc = bol ? -34 : +34 ;
        var  btnDis = bol ? rightLimit : 0;
        if(rightDyn == btnDis){
            return;
        }
        rightDyn = rightDyn + valueInc;
        if (rightDyn >= rightLimit) {
            $(".pages").css("left", rightDyn + "px");
        }   
    }

    this.selectedContacts =[];
    this.gridOptions = {
    	rowHeight : 70,
    	selectionRowHeaderWidth : 56,
    	rowEditWaitInterval: -1,
    	columnDefs : [
	        { name: 'other_id', displayName: 'Emp ID/Other ID'},
	        { name: 'firstname', displayName: 'First Name' },
	        { name: 'lastname', displayName: 'Last Name'},
	        { name: 'contact_number', displayName: 'Mobile' },
	        { name: 'emailid', displayName: 'Email', enableCellEdit: false },
	        { name: 'status', displayName: 'Status', cellClass:'select-box'}
	    ]   
    }



    this.gridOptions.onRegisterApi = function(gridApi){
        //set gridApi on scope
        scope.gridApi = gridApi;
        gridApi.rowEdit.on.saveRow(null, scope.saveRow);

        gridApi.selection.on.rowSelectionChanged(null, function(row) {
            updateRowSelection(row);
       	});
        gridApi.selection.on.rowSelectionChangedBatch(null, function(rows) {
            for (var i = 0; i < rows.length; i++) {
                updateRowSelection(rows[i]);
            }
        });

        function updateRowSelection(row) {
	        if (row.isSelected) {
	            if (scope.selectedContacts.indexOf(row.entity.record_id) == -1) {
	                scope.selectedContacts.push(row.entity.record_id);
	            }
	        } else {
	            var index = scope.selectedContacts.indexOf(row.entity.record_id);
	            if (index > -1) {
	                scope.selectedContacts.splice(index, 1);
	            }
	        }
		}

        gridApi.edit.on.afterCellEdit(null,function(rowEntity, colDef, newValue, oldValue){
        	if(newValue != oldValue){
        		console.log(newValue,oldValue)
        		var list = $.param({
		            record_id : rowEntity.record_id,
					other_id : rowEntity.other_id,
					lastname : rowEntity.lastname,
					status : rowEntity.status,
					firstname : rowEntity.firstname,
					contact_number : rowEntity.contact_number
        		});

		        var get_buckets = $http({
			        headers: {
			          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			        },
			        method: 'POST',
			        data:list,
			        url: CONFIG.APP_DOMAIN + 'update_contacts_list'
		    	})

		    	get_buckets.success(function(response){
			        if(response.status_code == 200){
			        	if(response.message.msg[0] == 'successfully updated'){
			        		//promise.resolve();	
			        	}
			        	else if(response.message.msg[0] == 'failed to update'){	
			        		//promise.reject();
			        	}
			        }
			        // Session Destroy
			        else if(response.status_code == 400){
			        	//promise.reject();
			            $window.location = CONFIG.APP_DOMAIN + 'logout';
			        }
		    	});

			    get_buckets.error(function(response){
			        //console.log(response);
			    })
        	}
        })
    };

    // search filter
    var time;
    this.srcSearch = 'search.svg';
    this.searchLoader = false;
   	this.searchRecords = function(arg){

   		if(arg == undefined || arg.length == 0){
   			scope.srcSearch = 'search.svg';
   			scope.searchVal = '';
   		}
   		else{
   			scope.srcSearch = 'cross.svg';	
   		}
   		scope.searchLoader = true;
   		
   		if(time != null){
            clearInterval(time);
        }
   		time = setTimeout(function(){
            scope.getGridData('', '', '', arg);
        },500);
   	}

	//get gridData
    var canceller,
    	bucketId = 0;
    this.activeBucket = 'ALL CONTACTS';
    this.currentPage = 1;
    this.getGridData = function(bktName, bktID, pageNo, searchVal){

    	bucketId = bktID || bucketId;
    	scope.activeBucket = bktName || scope.activeBucket;
    	scope.currentPage = pageNo || 1;

    	if(searchVal == 'undefined' || searchVal == ''){
   			scope.srcSearch = 'search.svg';
   			scope.searchVal = '';
   		}

    	if (canceller) {
            canceller.resolve();
        }

        canceller = $q.defer();

    	var list = $.param({
            bucket_id: bucketId,
            page_no: scope.currentPage,
            search: searchVal || ''
        });

    	var get_buckets = $http({
	        headers: {
	          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	        },
	        method: 'POST',
	        data: list,
	        url: CONFIG.APP_DOMAIN + 'contact_list',
	        timeout : canceller.promise
    	})
    	get_buckets.success(function(response){
	        if(response.status_code == 200){

	            scope.gridOptions.data = response.data.Contacts_list;
	            
	            var totRec = response.data.total_records[0].total_count;
   				var pageNos = Math.ceil(Number(totRec) / 50);

   				rightLimit = (pageNos - 4) * -34;
	            scope.generatePageNo = new Array(pageNos);

	            scope.searchLoader = false;
	        }
	        // Session Destroy
	        else if(response.status_code == 400){
	            $window.location = CONFIG.APP_DOMAIN + 'logout';
	        }
    	});

	    get_buckets.error(function(response){
	        //console.log(response);
	    })
    }

    this.getGridData(); 

}])


.controller('UploadContactsController',['$scope', '$http', '$uibModal', 'buckets', 'CONFIG', function($scope, $http, $uibModal, buckets, CONFIG){
	
	var scope = this;

	this.downloadSample = function(){
        window.location.href = CONFIG.APP_DOMAIN+'downloadcsv';
    }

    // color picker
    var bucketColor = ["#229A77", "#21A4AC", "#EE8F3B", "#2A99E0", "#154c50", "#103954", "#342158", "#5B5B29", "#004D40", "#6f2b25"];
    
    this.colorPicker = function(ind) {
        return bucketColor[String(ind).slice(-1)];
    }

    // get bucket names
    scope.bucketsList = buckets.getData();
    setTimeout(function(){dynamicUploader(scope.bucketsList.length)},100);
    /*var get_buckets = $http({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        method: 'POST',
        url: CONFIG.APP_DOMAIN+'buckets_list'
    })
    get_buckets.success(function(response){
        if(response.status_code == 200){
            scope.bucketsList = response.data;
            setTimeout(function(){dynamicUploader(scope.bucketsList.length)},100);
        }
        else if(response.status_code == 400){
            $window.location = CONFIG.APP_DOMAIN+'logout';
        }
    });
    get_buckets.error(function(response){
        console.log(response);
    })*/


    // qq uploader
    function dynamicUploader(length){
        for(var i = 0; i < length; i++){
            uploader(i);
        }
    }

    function uploader(index){
        window["$contacts_upload_"+index] = $('.upload-bucket').eq(index);
        var uploader = new qq.FileUploader({
            element: document.getElementsByClassName('upload-bucket')[index],
            dragText: "",
            uploadButtonText: "<span class='align-title'><img src='public/images/upload.svg' alt='upload'><p>"+scope.bucketsList[index].bucket_name+"</p></span>",
            multiple : false,
            sizeLimit: (25*1024*1024),
            allowedExtensions: ["XLSX", "CSV", "XLS"],
            action: CONFIG.APP_DOMAIN+'file_upload',
            params: {
                file_type: 'EXCEL'
            },

            onSubmit: function(id, name){
                eval("$contacts_upload_"+index).find('.drag_txt').hide();
                eval("$contacts_upload_"+index).find('.qq-upload-list').show();
            },
            onComplete: function(id, name, response){
                if(response.success){
                    eval("$contacts_upload_"+index).find('.qq-upload-fail').remove();
                    eval("$contacts_upload_"+index).find('.qq-upload-success').hide();
                    eval("$contacts_upload_"+index).find('.qq-upload-drop-area').css({
                        'display':'block',
                        'background':'transparent'
                    });
                    eval("$contacts_upload_"+index).find('.qq-upload-list').css('z-index','-1');
                    eval("$contacts_upload_"+index).find('.qq-upload-drop-area').append('<div class="file-name"><p class="name">'+response.org_name+'</p></div>');
                    eval("$contacts_upload_"+index).find('.qq-upload-drop-area .file-name').append('<div class="overlay"></div><i class="fa fa-trash-o icon-trash" onclick="angular.element(this).scope().UploadContCtrl.trash('+index+')"></i>');
                    eval("$contacts_upload_"+index).find('.qq-upload-list li.qq-upload-success').hide();
                    eval("$contacts_upload_"+index).find('.qq-upload-list').append("<li><input type='hidden' name='contacts["+scope.bucketsList[index].bucket_id+"]' value='" + response.filename + "' /></li>").show();
                }
                else{
                    for(var i = 0; i < scope.bucketsList.length; i++){
                        eval("$contacts_upload_"+i).find('.qq-upload-fail').remove();
                    }
                    eval("$contacts_upload_"+index).append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>"+response.msg+"</span></div>");
                }
            },
            showMessage: function(msg){
                for(var i = 0; i < scope.bucketsList.length; i++){
                    eval("$contacts_upload_"+i).find('.qq-upload-fail').remove();
                }
                eval("$contacts_upload_"+index).append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>"+msg+"</span></div>");
            }

        })
    }

    // new bucket
    scope.modal = {};

    this.uploadModal = function(){
        scope.errorFromData = false;
        scope.modal.successCond = false;
        scope.modal.bucketName = '';

        $uibModal.open({
            animation: false,
            backdrop: 'static',
            keyboard: false,
            templateUrl: 'templates/dialogs/new-file-upload.phtml',
            openedClass: "bucket-modal",
            scope: $scope
        });

        /* New bucket qq-uploader */
        setTimeout(function(){
            var uploader = new qq.FileUploader({
                element: document.getElementById('new-bucket'),
                dragText: "",
                uploadButtonText: "<span class='name'>Browse File</span>",
                multiple : false,
                sizeLimit: (25*1024*1024),
                allowedExtensions: ["XLSX", "CSV", "XLS"],
                action: CONFIG.APP_DOMAIN+'file_upload',
                params: {
                    file_type: 'xlsx'
                }
            })
        },100)
    }

    // trash function
    this.trash = function(index){
        eval("$contacts_upload_"+index).find('.qq-upload-drop-area').css('display','none');
        eval("$contacts_upload_"+index).find('.qq-upload-drop-area .file-name').remove();
        eval("$contacts_upload_"+index).find('.qq-upload-list li').remove();
    }

    // new bucket validation
    scope.errorFromData = false;
    scope.modal.successCond = false;
    this.uploadFile = function(isValid){
        if(!isValid){
            scope.errorFromData = true;
        }
        else{
            var params = $.param({
               bucket_name : scope.modal.bucketName 
            })

            var createBucket = $http({
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: CONFIG.APP_DOMAIN+'create_bucket',
                data: params
            })
            createBucket.success(function(response){
                if(response.status_code == 200){
                    scope.modal.successCond = true;
                    buckets.addProperty(response.data);
                    //scope.bucketsList.push(response.data);
                    setTimeout(function(){uploader(scope.bucketsList.length-1)},100);
                }
            })
            createBucket.error(function(response){
                console.log(response)
            })
        }
    }
    


}])




}());