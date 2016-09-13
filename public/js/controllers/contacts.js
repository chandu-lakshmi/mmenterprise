(function () {
"use strict";

angular.module('app.contact', ['ui.grid', 'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav', 'ui.grid.selection', 'ui.grid.validate'])

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
                        if(bkNames[i].bucket_name == attr.bucketName){
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

.controller('ContactsController',['$scope', '$http', '$q', '$interval', 'buckets', 'uiGridValidateService', '$uibModal', 'CONFIG', function($scope, $http, $q, $interval, buckets, uiGridValidateService, $uibModal, CONFIG){
	

	var scope = this;
	this.loaderImg = false;
	this.loaderNoContacts = false;

    //get bucketNames
    var get_buckets = $http({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        method: 'POST',
        url: CONFIG.APP_DOMAIN + 'buckets_list'
    })
    get_buckets.success(function(response) {
        if (response.status_code == 200) {
            scope.bucketNames = response.data;
            buckets.setData(scope.bucketNames);
        }
        // Session Destroy
        else if (response.status_code == 400) {
            $window.location = CONFIG.APP_DOMAIN+'logout';
        }
    })
    get_buckets.error(function(response){
        console.log(response);
    })

    //pagenation prevent pre/post btns
    var rightLimit = 100;
    var rightDyn = 0;
    this.getPage = function(bol) {

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

    this.selectedContacts = [];
    this.gridOptions = {
    	rowHeight : 70,
    	selectionRowHeaderWidth : 56,
    	enableHorizontalScrollbar: 0,
    	rowEditWaitInterval: -1,
    	columnDefs : [
	        { name: 'other_id', displayName: 'Emp ID/Other ID', width: '12%', validators: { charOtherId:''}, cellTemplate: 'ui-grid/cellTitleValidator' },
	        { name: 'firstname', displayName: 'First Name' ,width: '19%', validators: {charValidation:''}, cellTemplate: 'ui-grid/cellTitleValidator' },
	        { name: 'lastname', displayName: 'Last Name', width : '19%', validators: {charValidation:''}, cellTemplate: 'ui-grid/cellTitleValidator' },
	        { name: 'contact_number', displayName: 'Mobile' ,width: '14%', validators: {numValidation:''}, cellTemplate: 'ui-grid/cellTitleValidator' },
	        { name: 'emailid', displayName: 'Email', enableCellEdit: false ,width:'18%'},
	        { name: 'status',
	        	displayName: 'Status',
	          	editableCellTemplate: 'select-drop.html', 
	          	cellEditableCondition:true, 
	          	handleClick: scope.myFun, 
	          	cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
	        		var text = grid.getCellValue(row ,col).toLowerCase();
	        		return (text == 'separated') ?  'separated-s' : ((text == 'active') ? 'active-s' :'inactive-s');
      		  	}, 
      		  	validators: {required: true, statusValidation:''}, 
      		  	cellTemplate: 'ui-grid/cellTitleValidator' 
      		}
	    ]   
    }

    this.myFun = function(){
    	alert();
    }
    // function validtionCell(newVal, oldVal, rowEntity){
    // 	if(newVal != oldVal){
    // 		var regName = /^[a-zA-Z0-9'-]{2,30}$/,
    // 			bolFname = regName.test(rowEntity.firstname),
    // 			bolLname = regName.test(rowEntity.lastname),
    // 			bolId = regName.test(rowEntity.other_id),
    // 			bolNum =  (/^[-0-9]{3,25}$/).test(rowEntity.contact_number);
	   //  	if(bolFname && bolLname && bolId && bolNum){	
	   //  		return true;
	   //  	}else{
	   //  		return false;
		  //  	}
    // 	}
    // }
  	uiGridValidateService.setValidator('charValidation',
	    function(argument) {
	      	return function(oldValue, newValue, rowEntity, colDef) {
	      		if (newValue.length >= 1 && newValue.length <= 50) {
	      			rowUpdate(oldValue, newValue, rowEntity, colDef.name);
	      			return true;
	      		}
	      		else{
	      			setTimeout(function() {
	      				rowEntity[colDef.name] = oldValue;
	      				uiGridValidateService.setValid(rowEntity, colDef);
	      			}, 500)
	      			return false;	
	      		}
	      	};
	    },
	    function(argument) {
	      return 'You can only insert names starting with: "' + argument + '"';
	    }
  	);
  	uiGridValidateService.setValidator('charOtherId',
	    function(argument) {
	      	return function(oldValue, newValue, rowEntity, colDef) {
	      		var regex = /^[a-zA-Z0-9-]{1,50}$/;
	      		if (regex.test(newValue)) {
	      			rowUpdate(oldValue, newValue, rowEntity, colDef.name);
	      			return true;
	      		}
	      		else{
	      			setTimeout(function() {
	      				rowEntity[colDef.name] = oldValue;
	      				uiGridValidateService.setValid(rowEntity, colDef);
	      			}, 500)
	      			return false;	
	      		}
	      	};
	    },
	    function(argument) {
	      return 'You can only insert names starting with: "' + argument + '"';
	    }
  	);
  	uiGridValidateService.setValidator('numValidation',
	    function(argument) {
	      	return function(oldValue, newValue, rowEntity, colDef) {
	      		var regex = /^[-0-9]{3,25}$/;
	      		if (regex.test(newValue)) {
	      			rowUpdate(oldValue, newValue, rowEntity, colDef.name);
       				return true;
    			}
    			else{
	      			setTimeout(function() {
	      				rowEntity[colDef.name] = oldValue;
	      				uiGridValidateService.setValid(rowEntity, colDef);
	      			}, 500)
	      			return false;	
	      		}
	      	};
	    },
	    function(argument) {
	      return 'You can only insert names starting with: "' + argument + '"';
	    }
  	);
	uiGridValidateService.setValidator('statusValidation',
	    function(argument) {
	      	return function(newValue, oldValue, rowEntity, colDef) {
	      		if(newValue != oldValue){
	      			rowUpdate(oldValue, newValue, rowEntity, colDef.name);
	      			return true;
	      		}
	      	};
	    },
	    function(argument) {
	      return 'You can only insert names starting with: "' + argument + '"';
	    }
  	);

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

        // gridApi.edit.on.afterCellEdit(null,function(rowEntity, colDef, newValue, oldValue){
        // })
    };

    this.updateLoader = false;
    function rowUpdate(oldValue, newValue, rowEntity, colDefName){
    	if (newValue != oldValue) {
    		$('.zeroRecords').hide();
    		scope.loaderImg = true;
    		scope.hideLoader = true;
    		scope.updateLoader = true;

			var list = $.param({
				record_id : rowEntity.record_id,
				other_id : rowEntity.other_id,
				firstname : rowEntity.firstname,
	            lastname : rowEntity.lastname,
	            contact_number : rowEntity.contact_number,
	            emailid : rowEntity.emailid,
	            status : rowEntity.status
	            //[colDefName] : newValue
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
		        if (response.status_code == 200) {
		        	if (response.message.msg[0] == 'successfully updated') {
		        		
		        		scope.updateLoader = false;
		        		scope.hideLoader = false;
		        		scope.loaderImg = false;
		        		$('.updateSuccess').show();
		        		$('.updateSuccess').fadeOut(3000);

		        	}
		        	else if (response.message.msg[0] == 'failed to update') {	
		        		$('.updatefailure').show();
		        		$('.updatefailure').fadeOut('slow');
		        	}
		        }
		        // Session Destroy
		        else if (response.status_code == 400) {
		        	//promise.reject();
		            $window.location = CONFIG.APP_DOMAIN + 'logout';
		        }
	    	});

		    get_buckets.error(function(response) {
		        //console.log(response);
		    })
		}
    }

    // search filter
    var time;
    this.srcSearch = 'search.svg';
    this.searchLoader = false;
   	this.searchRecords = function(arg) {
   		$('.zeroRecords').hide();
   		if (arg == undefined || arg.length == 0) {
   			scope.srcSearch = 'search.svg';
   			scope.searchVal = '';
   		}
   		else{
   			scope.srcSearch = 'cross.svg';	
   		}
   		scope.searchLoader = true;
   		
   		if (time != null) {
            clearInterval(time);
        }
   		time = setTimeout(function() {
            scope.getGridData('', '', '', arg);
        },500);
   	}

	//get gridData
    var canceller,
    	bucketId = 0;
    this.activeBucket = 'ALL CONTACTS';
    this.currentPage = 1;
    this.getGridData = function(bktName, bktID, pageNo, searchVal) {
    	$('.zeroRecords').hide();
    	scope.loaderImg = true;
    	scope.loaderNoContacts = false;

    	bucketId = bktID || bucketId;
    	scope.activeBucket = bktName || scope.activeBucket;
    	scope.currentPage = pageNo || 1;

    	if (searchVal == 'undefined' || searchVal == '') {
   			scope.srcSearch = 'search.svg';
   			scope.searchVal = scope.searchVal > 0 ? scope.searchVal : ''; 
   		}


    	if (canceller) {
            canceller.resolve();
        }

        canceller = $q.defer();

    	var list = $.param({
            bucket_id: bucketId,
            page_no: scope.currentPage,
            search: scope.searchVal
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
	        if (response.status_code == 200) {

	            scope.gridOptions.data = response.data.Contacts_list;

	            scope.gridOptions.data.length == 0 ? (scope.loaderNoContacts = true) : '';
	            
	            scope.gridApi.selection.clearSelectedRows();

	            var totRec = response.data.total_records[0].total_count;
   				var pageNos = Math.ceil(Number(totRec) / 50);

   				rightLimit = (pageNos - 4) * -34;
	            scope.generatePageNo = new Array(pageNos);

	            var width = pageNos < 4 ? pageNos * 34 : '136';
                $(".pages-container").css("width", width + "px");
                
                scope.allRecCount = ( scope.activeBucket == 'ALL CONTACTS' ) ? totRec : scope.allRecCount; 

	            scope.searchLoader = false;
	            scope.loaderImg = false;

	        }
	        // Session Destroy
	        else if (response.status_code == 400) {
	            $window.location = CONFIG.APP_DOMAIN + 'logout';
	        }
    	});

	    get_buckets.error(function(response){
	        //console.log(response);
	    })
    }

    this.getGridData();

    var cancellerStat;
    //statusUpdate & delete row
    this.updateStatusAndDeleteRow = function(state, status) {
    	
    	if (scope.selectedContacts.length == 0) {
    		$('.zeroRecords').show();
    		return;
    	}
    		$('.zeroRecords').hide();
    		scope.loaderImg = true;
    		scope.hideLoader = true;
    		scope.updateLoader = true;

    	if (cancellerStat) {
            cancellerStat.resolve();
        }
        cancellerStat = $q.defer();

		var list = $.param({
			action: state,
            record_id: scope.selectedContacts.toString(),
            status: status		
		});

        var get_buckets = $http({
	        headers: {
	          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	        },
	        method: 'POST',
	        data:list,
	        url: CONFIG.APP_DOMAIN + 'other_edits_in_contact_list',
	        timeout : canceller.cancellerStat
    	})

    	get_buckets.success(function(response) {
	        if (response.status_code == 200) {
	        	if (response.message.msg[0] == 'status changed successfully') {
	    
	        		for (var i = 0; i < scope.gridOptions.data.length; i++) {
	        			for (var j = 0; j < scope.selectedContacts.length; j++) {
	        				if (Number(scope.gridOptions.data[i].record_id) == Number(scope.selectedContacts[j])) {
	        					scope.gridOptions.data[i].status = status;
	        					break;
	        				}
	        			}
	        		}
	        		scope.gridApi.selection.clearSelectedRows();
	        		scope.updateLoader = false;
		        	scope.hideLoader = false;
		        	scope.loaderImg = false;
	        		$('.updateSuccess').show();
		        	$('.updateSuccess').fadeOut(3000);
		        	scope.gridOptions.data = angular.copy(scope.gridOptions.data);
	        	}
	        	else if (response.message.msg[0] == 'failed to update') {	
	        		$('.updatefailure').show();
		        	$('.updatefailure').fadeOut('slow');
	        	}
	        	$('.zeroRecords').fadeOut();
	        }
	        // Session Destroy
	        else if (response.status_code == 400) {
	        	//promise.reject();
	            $window.location = CONFIG.APP_DOMAIN + 'logout';
	        }
    	});

	    get_buckets.error(function(response){
	        //console.log(response);
	    })
    }


	// modal
   	this.bucketsModal = function(){

       	$uibModal.open({
           animation: false,
           backdrop: 'static',
           keyboard: false,
           templateUrl: 'templates/dialogs/new-file-upload.phtml',
           openedClass: "bucket-modal",
           controller: 'UploadContactsController',
           controllerAs: "UploadContCtrl"
      	 });
   	}

   	// new contact modal
   this.contactModal = function(){

       $uibModal.open({
          animation: false,
          backdrop: 'static',
          keyboard: false,
          templateUrl: 'templates/dialogs/new-contact-upload.phtml',
          openedClass: "contact-modal",
          controller: 'UploadSingleContactController',
          controllerAs: "SingleContCtrl"
        });
   } 

}])


.controller('UploadContactsController',['$scope', '$uibModalInstance', '$state', '$http', '$uibModal', 'buckets', 'CONFIG', function($scope, $uibModalInstance, $state, $http, $uibModal, buckets, CONFIG){
    
    var scope = this;

    // download sample template
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


    // qq uploader
    function dynamicUploader(length){
        for(var i = 0; i < length; i++){
            uploader(i,false);
        }
    }

    var uploadData = [];
    function uploader(index,status){
        window["$contacts_upload_"+index] = $('.upload-bucket').eq(index);
        var uploader = new qq.FileUploader({
            element: document.getElementsByClassName('upload-bucket')[index],
            dragText: "",
            uploadButtonText: "<span class='align-title'><p>"+scope.bucketsList[index].bucket_name+"</p></span>",
            multiple : false,
            sizeLimit: (25*1024*1024),
            allowedExtensions: ["XLSX", "CSV", "XLS"],
            action: CONFIG.APP_DOMAIN+'contacts_file_upload',

            onSubmit: function(id, name){
                scope.errorUpload = false;
                $scope.$apply();
                eval("$contacts_upload_"+index).find('.drag_txt').hide();
                eval("$contacts_upload_"+index).find('.qq-upload-list').show();
            },
            onComplete: function(id, name, response){
                if(response.success){
                    uploadData.push({
                        ind : index,
                        org_name : response.org_name,
                        filename : response.filename
                    })
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

        if(status){
            successBucket(index,org_name,filename);
        }
    }


    // new mock functionality
    scope.newBucketModal = false;
    this.newBucket = function(){
        scope.newBucketModal = true;
        newBucketUpload();
    }

    /* New bucket qq-uploader */
    var $new_bucket,org_name,filename; 
    scope.new_bucket = {};
    function newBucketUpload(){
        setTimeout(function(){
            $new_bucket = $('#new-bucket');
            var uploader = new qq.FileUploader({
                element: document.getElementById('new-bucket'),
                dragText: "",
                uploadButtonText: "<span class='name'>Browse File</span>",
                multiple : false,
                sizeLimit: (25*1024*1024),
                allowedExtensions: ["XLSX", "CSV", "XLS"],
                action: CONFIG.APP_DOMAIN+'contacts_file_upload',

                onSubmit: function(id, name){
                    scope.new_bucket.fileError = false;
                    scope.errorUpload = false;
                    $scope.$apply();
                    $new_bucket.find('.drag_txt').hide();
                    $new_bucket.find('.qq-upload-button').hide();
                    $new_bucket.find('.qq-upload-list').css('z-index','0');
                    $new_bucket.find('.qq-upload-list').show();
                },
                onComplete: function(id, name, response){
                    if(response.success){
                        scope.new_bucket.fileError = false;
                        org_name = response.org_name;
                        filename = response.filename;
                        $new_bucket.find('.qq-upload-fail').remove();
                        $new_bucket.find('.qq-upload-success').hide();
                        $new_bucket.find('.qq-upload-list').css('z-index','-1');
                        $new_bucket.find('.qq-upload-drop-area').css('display','block');
                        $new_bucket.find('.qq-upload-drop-area').append('<div class="file-name"><img src="public/images/Applied.svg" alt="file"><p class="name">'+response.org_name+'</p><img src="public/images/close-popup-grey.svg" alt="cancel" onclick="angular.element(this).scope().UploadContCtrl.delete()"></div>');
                    }
                    else{
                        scope.new_bucket.fileError = false;
                        $scope.$apply();
                        $new_bucket.find('.qq-upload-button').show();
                        $new_bucket.find('.qq-upload-list').css('z-index','-1');
                        $new_bucket.find('.qq-upload-fail').remove();
                        $new_bucket.append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>"+response.msg+"</span></div>");
                    }
                },
                showMessage: function(msg){
                    scope.new_bucket.fileError = false;
                    $scope.$apply();
                    $new_bucket.find('.qq-upload-fail').remove();
                    $new_bucket.append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>"+msg+"</span></div>");
                }
            })
        },100)
    }
    
    // create new bucket and upload file
    scope.new_bucket.fileError = false;
    scope.new_bucket.succesLoader = false;
    this.new_bucket.upload = function(isValid){
        //console.log($new_bucket.find('.qq-upload-list li').hasClass('qq-upload-success'));
        if(!isValid || !($new_bucket.find('.qq-upload-list li').hasClass('qq-upload-success'))){
            isValid == false ? (scope.new_bucket.errorFromData = true) : (scope.new_bucket.errorFromData = false);
            $new_bucket.find('.qq-upload-list li').hasClass('qq-upload-success') == false ? (scope.new_bucket.fileError = true) : (scope.new_bucket.fileError = false); 
        }
        else{
            scope.new_bucket.errorFromData = false;
            scope.new_bucket.fileError = false;
            scope.new_bucket.succesLoader = true;

            var params = $.param({
               bucket_name : scope.new_bucket.bucketName 
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
                scope.new_bucket.succesLoader = false;
                if(response.status_code == 200){
                    buckets.addProperty(response.data);
                    scope.newBucketModal = false;
                    //scope.bucketsList.push(response.data);
                    setTimeout(function(){
                        dynamicUploader(scope.bucketsList.length);
                        uploader(scope.bucketsList.length-1,true);
                    },100);
                }
            })
            createBucket.error(function(response){
                console.log(response)
            })
        }
    }
     

    this.back = function(){
        scope.newBucketModal = false;
        scope.errorUpload = false;
        setTimeout(function(){
            dynamicUploader(scope.bucketsList.length);

            for(var i = 0; i < uploadData.length; i++){
                successBucket(uploadData[i].ind,uploadData[i].org_name,uploadData[i].filename);
            }
        },100);
    }

    // trash function
    this.trash = function(index){
        eval("$contacts_upload_"+index).find('.qq-upload-drop-area').css('display','none');
        eval("$contacts_upload_"+index).find('.qq-upload-drop-area .file-name').remove();
        eval("$contacts_upload_"+index).find('.qq-upload-list li').remove();
        eval("$contacts_upload_"+index).find('.qq-upload-list').css('z-index','0');
    }
    // delete new bucket file
    this.delete = function(){
        $new_bucket.find('.file-name').remove();
        $new_bucket.find('.qq-upload-list li').remove();
        $new_bucket.find('.qq-upload-list').css('z-index','-1');
        $new_bucket.find('.qq-upload-drop-area').css('display','none');
        $new_bucket.find('.qq-upload-button').show();
    }

    // new bucket after success
    function successBucket(index,name,file){
        //console.log(index,name,file)
        window["$contacts_upload_"+index] = $('.upload-bucket').eq(index);
        eval("$contacts_upload_"+index).find('.qq-upload-fail').remove();
        eval("$contacts_upload_"+index).find('.qq-upload-success').hide();
        eval("$contacts_upload_"+index).find('.qq-upload-drop-area').css({
            'display':'block',
            'background':'transparent'
        });
        eval("$contacts_upload_"+index).find('.qq-upload-list').css('z-index','-1');
        eval("$contacts_upload_"+index).find('.qq-upload-drop-area').append('<div class="file-name"><p class="name">'+name+'</p></div>');
        eval("$contacts_upload_"+index).find('.qq-upload-drop-area .file-name').append('<div class="overlay"></div><i class="fa fa-trash-o icon-trash" onclick="angular.element(this).scope().UploadContCtrl.trash('+index+')"></i>');
        eval("$contacts_upload_"+index).find('.qq-upload-list li.qq-upload-success').hide();
        eval("$contacts_upload_"+index).find('.qq-upload-list').append("<li><input type='hidden' name='contacts["+scope.bucketsList[index].bucket_id+"]' value='" + file + "' /></li>").show();
    }

    // upload to db
    scope.uploadLoader = false;
    scope.errorUpload = false;
    this.uploadContacts = function(){
        scope.uploadLoader = true;
        var param = $(' form[name="buckets_form"]').serialize();

        var upload_contacts = $http({
            headers: {
                "content-type": 'application/x-www-form-urlencoded'
            },
            method : 'POST',
            url : CONFIG.APP_DOMAIN+'upload_contacts',
            data : param
        });

        upload_contacts.success(function(response){
            if(response.status_code == 200){
                scope.uploadLoader = false;
                scope.errorUpload = false;
                //$state.go('app.contact');
                $uibModalInstance.dismiss('cancel');
            }
            else if(response.status_code == 403){
                scope.uploadLoader = false;
                scope.errorUpload = true;
            }
            else if(response.status_code == 400){
                $window.location = CONFIG.APP_DOMAIN+'logout';
            }
        })
        upload_contacts.error(function(response){
            console.log(response)
            scope.uploadLoader = false;
            scope.errorUpload = false;
        })
    }


    // on state change modal close
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        $uibModalInstance.dismiss('cancel');
    })
    


}])

.controller('UploadSingleContactController',['$scope', '$uibModalInstance', 'buckets', function($scope, $uibModalInstance, buckets){

    var scope = this;

    scope.bucketList = buckets.getData();

    scope.statusText = ["Active","Inactive","Seperated"];

    scope.errCond = false;
    scope.add = function(isValid){
        console.log(isValid)
        if(!isValid){
            scope.errCond = true;
        }
        else{

        }
    }


    // on state change modal close
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        $uibModalInstance.dismiss('cancel');
    })

}])




}());