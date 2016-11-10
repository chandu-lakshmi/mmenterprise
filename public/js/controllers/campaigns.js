(function () {
	"use strict";

	angular
		.module('app.campaigns', ['ui.grid', 'ui.grid.infiniteScroll', 'ui.grid.selection', 'mdPickers', 'ngMessages'])
		.controller('CampaignsController', CampaignsController)
		.controller('NewCampaignController', NewCampaignController)
		.controller('AllCampaignsController', AllCampaignsController)
		.controller('MyCampaignsController', MyCampaignsController)
		.controller('EditCampaignsController', EditCampaignsController)
		.service('CampaignsData', CampaignsData)
		.service('contactBuckets', contactBuckets)
		.service('jobListData', jobListData)
		.directive('bucketsView', bucketsView)

		CampaignsController.$inject = ['$http', 'CONFIG', 'contactBuckets', '$uibModal', 'jobListData'];
		NewCampaignController.$inject = ['$scope','$state', 'contactBuckets', 'jobListData', 'CampaignsData', '$uibModalInstance', '$http', 'CompanyDetails', 'CONFIG'];
		AllCampaignsController.$inject = ['$state', '$http', '$q', '$timeout', 'uiGridConstants', 'CampaignsData', 'userPermissions', '$stateParams', 'CONFIG'];
		MyCampaignsController.$inject = [];
		EditCampaignsController.$inject = ['$state', 'CompanyDetails', 'CampaignsData', 'contactBuckets', 'jobListData', 'rippleService', '$window', '$http', 'CONFIG'];


		function contactBuckets(){
			var buckets = {};

			this.setBucket = function(data){
				buckets = data;
			}

			this.getBucket = function(){
				return buckets
			}

			this.addBucket = function(prop, val){
				buckets[prop] = val;
			}
		}

		function jobListData(){
			var jobList = {};

			this.setJobListData = function(data){
				jobList = data;
			}

			this.getJobListData = function(){
				return jobList;
			}
		}

		function CampaignsData(){
			var campaigns = {};

			var bol = false;

			this.setCampaigns = function(data){
				campaigns = data;
			}

			this.getCampaigns = function(){
				return campaigns
			}

			this.addCampaigns = function(prop, val){
				campaigns[prop] = val;
			}
		
		}

		function bucketsView(){
			return{
				restrict:'AE',
				scope:{
					buckets:'=',
					checkIds:'=',
					setFn: '&'
				},
				templateUrl:'templates/campaigns/template-bucket.phtml',
				link:function(scope, element, attr){

					
		   			var bucketColor = ["#229A77", "#21A4AC", "#EE8F3B", "#2A99E0", "#154c50", "#103954", "#342158", "#5B5B29", "#004D40", "#6f2b25"];
				    scope.getColor = function(ind) {
				        return bucketColor[String(ind).slice(-1)];
				    }

				    scope.selectedBktsString;
				    scope.selectedBkts = [];

				    var copy = angular.copy(scope.buckets);
				    scope.addBucketContact = function(src, ind, bucketId){
				        if(src == "public/images/add.svg"){
				          scope.selectedBkts.push(bucketId);
				          scope.buckets[ind].src = "public/images/select.svg";
				        }
				        else{
				          var index = scope.selectedBkts.indexOf(bucketId);
				          scope.selectedBkts.splice(index, 1);
				          scope.buckets[ind].src="public/images/add.svg";
				        }
				        scope.selectedBktsString = scope.selectedBkts.toString();
		    		}
		    		scope.initFn = function(src, bktId){
		    			if(src == 'public/images/select.svg'){
		    				scope.selectedBkts.push(bktId);
		    				scope.selectedBktsString = scope.selectedBkts.toString();
		    			}
		    		}
		    		scope.reset = function(){
		    			scope.buckets  = angular.copy(copy);  			
		    			scope.selectedBkts = [];
		    			scope.selectedBktsString = scope.selectedBkts.toString();
		    		}
		    		scope.setFn({dirFn:scope.reset});
				}
			}
		}


		function CampaignsController($http, CONFIG, contactBuckets, $uibModal, jobListData){

			var vm = this;

			function bucketsList(){
		        var get_buckets = $http({
		            headers: {
		              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		            },
		            method: 'POST',
		            url: CONFIG.APP_DOMAIN + 'buckets_list'
		        })
		        get_buckets.success(function(response) {
		            if (response.status_code == 200) {
		                contactBuckets.setBucket(response.data.buckets_list);
		                vm.bucketListApi = true;
		            }
		            // Session Destroy
		            else if (response.status_code == 400) {
		                $window.location = CONFIG.APP_DOMAIN + 'logout';
		            }
		        })
		        get_buckets.error(function(response){
		            console.log(response);
		        })
		    }
		    bucketsList();

		    function getJobLists(){
				var request_type = 'request_type:"s"';
				var jobLists = $http({
			        headers: {
			           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			        },
			        method: 'POST',
			        data:$.param({request_type : '2'}),
			        url: CONFIG.APP_DOMAIN + 'jobs_list'
			    })
			    jobLists.success(function(response){
		    		if(response.status_code == 200){
		    			var activeJobs = [];
		    			if(response.data.hasOwnProperty('posts')){
			    			for(var i = 0; i < response.data.posts.length; i++){
			    				if (response.data.posts[i].status == 'ACTIVE') {
			    					activeJobs.push(response.data.posts[i]);
			    				}
			    			}
			    		}
			    		jobListData.setJobListData(activeJobs);
			    		vm.jobListApi = true;
			    	}
			    	else if(response.status_code == 400){
		                $window.location = CONFIG.APP_DOMAIN + 'logout';
		            }
			    })
			    jobLists.error(function(response){
			        console.log(response)
			    })
			}
			getJobLists();	


		    this.createNewCampaign = createNewCampaign;
		
			function createNewCampaign(){
				$uibModal.open({
		            animation: false,
		            backdrop: 'static',
		            keyboard: false,
		            templateUrl: 'templates/campaigns/new-campaign-dialog.phtml',
		            openedClass: "new-campaign",
		            controller:'NewCampaignController',
		     		controllerAs: 'NewCampaignCtrl'
		        });
			};
		}

		function NewCampaignController($scope, $state, contactBuckets, jobListData, CampaignsData, $uibModalInstance, $http, CompanyDetails, CONFIG){

			var vm = this;
			vm.company_name = CompanyDetails.name;
			this.bucketsNamedata = contactBuckets.getBucket();
			this.jobLists = jobListData.getJobListData();
			setTimeout(function(){$('#selectJob').chosen()}, 0);
			$('html').addClass('remove-scroll');
			this.currentDate = new Date();
			this.bucketsName = this.bucketsNamedata;


			this.switchSteps = switchSteps;
			this.addTimeSheet = addTimeSheet;
			this.closeTimeSheet = closeTimeSheet;
			this.postNewCampaign = postNewCampaign;
			this.closeModal = closeModal;
			this.trash = trash;


			var formName = 'frm1';
			this.currentStep = 1;
			this.step1 = true;

			function switchSteps(step){
				if(step == "next"){
					if($scope[formName].$invalid){
						vm['errCond' + formName]= true;
						return;
					}	
					vm["step" + vm.currentStep] = false;
					vm.currentStep++;
					vm.listSteps[vm.currentStep - 1].status = true;
				}
				else{
					vm["step" + vm.currentStep] = false;
					vm.currentStep--;
					
					vm.listSteps[vm.currentStep].status = false;
				}
				formName = 'frm'+ vm.currentStep;
				vm["step" + vm.currentStep] = true;
			}


			this.setDirectiveFn = function(dirFn) {
        		vm.resetBuckets = dirFn;
    		};

			this.reset = function(){
				vm[formName] = {};
				vm['errCond' + formName]= false;
				if(formName == 'frm1'){
					vm.frm1.location = {};
					vm.frm1.location.location_type = 'online';
				}
				if(formName == 'frm2'){
					vm.timeSheetGroups = [1];
					$('#selectJob').val('').trigger('chosen:updated');
				}
				else if(formName == 'frm3'){
					vm.resetBuckets();
					trash(0);
					trash(1);
				}
			}

			this.timeSheetGroups = [1];
			this.currentTimeSheet = 1;

			function addTimeSheet(){
				vm.currentTimeSheet++
				vm.timeSheetGroups.push(vm.currentTimeSheet);
			}

			function closeTimeSheet(groupId){
				var index = vm.timeSheetGroups.indexOf(groupId);
				vm.timeSheetGroups.splice(index, 1);
			}


			function postNewCampaign(){
				vm.postPointer = true;
				vm.postLoader = true;
				var frmData = $('#frm1, #frm2, #frm3').serialize();

				var newCampaign = $http({
			        headers: {
			           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			        },
			        method: 'POST',
			        data: frmData+ '&' + $.param({
			        	request_type : 'add'
			        }),
			        url: CONFIG.APP_DOMAIN + 'add_campaign'
			    })
			    newCampaign.success(function(response){
			    	vm.postLoader = false;
			    	vm.message = true;

		    		if(response.status_code == 200){
		    			vm.successMsg = response.message.msg[0];
		    			CampaignsData.bol = true;
			    		closeModal();
			    		if($state.current.name == 'app.campaigns.editCampaigns'){
                            $state.go('app.campaigns.allCampaigns');
                        }
                        else{
                            setTimeout(function (){$state.reload()}, 100);
                        }
			    	}
			    	else if(response.status_code == 400){
		                $window.location = CONFIG.APP_DOMAIN + 'logout';
		            }
			    })
			    newCampaign.error(function(response){
			        console.log(response)
			    })
			}
			
			setTimeout(function(){uploader()}, 1000);;
			function uploader(){
				for(var i = 0; i < 2; i++){
					window["$upload_pitch"+i] = $('.upload-pitch').eq(i);
					pitchUpload(i);
				}
			}

			var uploadTemplate = '<div class="upload-box">'+
									'<div class="file">'+
										'<div class="progress-bar"></div>'+
										'<div class="filename"></div>'+
									'</div>'+
								'</div>'

			var param = '';
		    function pitchUpload(index){
		    	var uploader = new qq.FileUploader({
		            element: document.getElementsByClassName('upload-pitch')[index],
		            dragText: "",
		            uploadButtonText: "Browse File",
		            multiple : false,
		            sizeLimit: (25*1024*1024),
		            allowedExtensions: ["MP4", "AMV", "MPG", "AVI", "MKV"],
		            action: CONFIG.APP_DOMAIN+'file_upload',

		            onSubmit: function(id, name){
		            	eval("$upload_pitch"+index).next('.upload-box').remove();
		            	eval("$upload_pitch"+index).after(uploadTemplate);
		            	eval("$upload_pitch"+index).find('.qq-upload-list').remove();
		            	eval("$upload_pitch"+index).find('.qq-upload-fail').remove();
		            },
		            onComplete: function(id, name, response){
		                if(response.success){
		         			if(index == 0){
					    		param = 'ceos_pitch';
					    	}
					    	else{
					    		param = 'employees_pitch';
					    	}
		                	$('.progress-bar').hide();
		                	eval("$upload_pitch"+index).find('.qq-upload-fail').remove();
		                	eval("$upload_pitch"+index).find('.qq-upload-success').hide();
		                    eval("$upload_pitch"+index).find('.qq-upload-list').css('z-index','-1');
		                	eval("$upload_pitch"+index).next('.upload-box').find('.filename').append('<img src="public/images/video.png">')
		                	eval("$upload_pitch"+index).next('.upload-box').find('.filename').append('<p class="name ellipsis">'+response.org_name+'</p>');
		                	eval("$upload_pitch"+index).next('.upload-box').find('.filename').append('<img src="public/images/material_icons/circle-close.svg" onclick="angular.element(this).scope().NewCampaignCtrl.trash('+index+')">');
		                    eval("$upload_pitch"+index).next('.upload-box').append("<input type='hidden' name='"+ param +"_file' value='" + response.filename + "' />").show();
		                    eval("$upload_pitch"+index).next('.upload-box').append("<input type='hidden' name='"+ param +"_name' value='" + response.org_name + "' />").show();
		                }
		                else{
		                    for(var i = 0; i < 2; i++){
			                    eval("$upload_pitch"+i).find('.qq-upload-fail').remove();
			                }
		                    eval("$upload_pitch"+index).append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>"+response.msg+"</span></div>");
		                }
		            },
		            onProgress: function(id, fileName, loaded, total){
		            	var percent = Math.round((loaded / total) * 100);
		            	$('.progress-bar').eq(index).progressbar({
					      	value: percent
					    });
		            },
		            showMessage: function(msg){
		            	for(var i = 0; i < 2; i++){
		                    eval("$upload_pitch"+i).find('.qq-upload-fail').remove();
		                }
		                eval("$upload_pitch"+index).append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>"+msg+"</span></div>");
		            }
		        });
		    }

		    function trash(index){
		    	eval("$upload_pitch"+index).next('.upload-box').remove();
		    }
			
			function closeModal(){
				$('html').removeClass('remove-scroll');
				$uibModalInstance.dismiss('cancel');
			}


			this.listSteps = [
				{ label:'CAMPAIGN DETAILS', status: true},
				{ label:'SCHEDULE CAMPAIGN', status: false},
				{ label:'PREPARE CONTACTS' , status: false},
				{ label:'PUBLISH CAMPAIGN', status: false}
			];

			this.campaign = ['Mass Recruitment', 'Military Veterans', 'Campus Hires'];

			this.closeDropdown = function(){
       			$('body').find('.md-select-menu-container').removeClass('md-leave');
       			if($('body').find('.md-select-menu-container').hasClass('md-active')){
	          		$('body').find('.md-select-menu-container').removeClass('md-active md-clickable');
	           		$('body').find('.md-select-menu-container').addClass('md-leave');
       			}
   			}




		}


		function AllCampaignsController($state, $http, $q, $timeout, uiGridConstants, CampaignsData, userPermissions, $stateParams, CONFIG){

			var vm = this,canceler,
			gridApiCall = CONFIG.APP_DOMAIN + 'campaigns_list';

			vm.all_campaigns = $stateParams.all_campaigns;

			vm.loader = false;
			vm.searchLoader = false;
			vm.noCampaigns = false;

			CampaignsData.bol = true;

			// checkboxes
			vm.selectedType = [];
			vm.selectedStatus = [];
			vm.type = [
				{id: 1, label: 'Mass Recruitment', name: 'mass_recruitment'},
				{id: 2, label: 'Military Veterans', name: 'militery_veterans'},
				{id: 3, label: 'Campus Hires', name: 'campus_hires'}
			]
			vm.status = [
				{id: 1, label: 'Open', name: 'open'},
				{id: 2, label: 'Close', name: 'close'}
			]
			vm.toggle = toggle;
			vm.exists = exists;
			vm.isChecked = isChecked;
			vm.toggleAll = toggleAll;

			function toggle(item, list){
				var idx = list.indexOf(item);
			    if (idx > -1) {
			      	list.splice(idx, 1);
			    }
			    else {
			      	list.push(item);
			    }
			}
			function exists(item, list) {
    			return list.indexOf(item) > -1;
  			};
  			function isChecked(obj, arr){
				return vm[arr].length === vm[obj].length;
			}
			function toggleAll(obj, arr){
				if (vm[arr].length === vm[obj].length) {
			      	vm[arr] = [];
			    }
			    else if (vm[arr].length === 0 || vm[arr].length > 0) {
			      	vm[arr] = vm[obj].slice(0);
			    }
			}
			

			vm.clear = clear;
			vm.applyFilter = applyFilter;
			vm.searchFilter = searchFilter;
			vm.editCampaigns = editCampaigns;

			vm.editCampaignTemplate = 'templates/campaigns/edit-campaigns.phtml'


			// modern select
			$('#mul_select').chosen();

			// google api for location field
			vm.geo_location = '';
		  	vm.geo_options = null;
		  	vm.geo_details = '';


		  	// grid function
			vm.gridOptions = {
				rowHeight:70,
				enableSorting:true,
				enableColumnMenus:false,
				enableRowSelection: true,
				enableRowHeaderSelection: false,
				multiSelect: false,
				modifierKeysToMultiSelect: false,
				noUnselect: true,
				infiniteScrollRowsFromEnd: 8,
				infiniteScrollUp:true,
				infiniteScrollDown:true,
				data: 'data'
			};

			vm.gridOptions.columnDefs = [
				{ field: 'campaign_name', displayName:'CAMPAIGN NAME', cellClass: 'first-col', width: '20%', enableSorting: false },
			    { field: 'campaign_type', displayName:'CAMPAIGN TYPE', width: '25%', enableSorting: true, sortDirectionCycle: ['asc', 'desc', ''] },
			    { field: 'total_vacancies', displayName:'#JOB VACANCIES', width: '20%', enableSorting: false },
			    { field: 'start_on_date', displayName:'START & END DATES', width: '25%', enableSorting: false, cellTemplate: '<span>{{row.entity.start_on_date | date: "MMM dd"}} - {{row.entity.end_on_date | date: "MMM dd, yyyy "}}</span>' },
			    { field : 'status', displayName:'STATUS', width: '15%', enableSorting: false,
			    	cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
			    		var text = grid.getCellValue(row ,col).toLowerCase();
			    		return text == 'open' ? 'open' : 'closed'
			    	}
			    }
			]


			vm.gridOptions.onRegisterApi = function(gridApi){
		      	gridApi.infiniteScroll.on.needLoadMoreData(null, vm.getDataDown);
		      	gridApi.infiniteScroll.on.needLoadMoreDataTop(null, vm.getDataUp);
		      	if(userPermissions.run_campaign == 1){
		      		gridApi.selection.on.rowSelectionChanged(null, vm.editCampaigns);
		      	}
		      	vm.gridApi = gridApi;
		    }


    		vm.data = [];
		    vm.gridOptions.data = vm.data;
 
  			function resetGrid(){
  				vm.firstPage = 0;
	  			vm.lastPage = 0;
			  	vm.pageNo = 1;
			  	vm.totalPages = 1;
		    	vm.noCampaigns = false;
  			}
 
			vm.getFirstData = function(search, searchLoader) {
  				resetGrid();
				if(searchLoader){
		    		vm.searchLoader = true;
		    	}
		    	else{
		    		vm.searchLoader = false;
		    		vm.loader = true;
		    	}

		    	if(canceler){
		    		canceler.resolve();
		    	}

		    	canceler = $q.defer();

			    var data = $("form[name='filter_form']").serialize();
			    return $http({
	                headers: {
	                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	                },
	                method: 'POST',
	                url: gridApiCall,
	                data: data + '&' + $.param({
	                	search : vm.search,
	                	page_no : vm.pageNo,
	                	all_campaigns: vm.all_campaigns
	                }),
	                timeout: canceler.promise
	            })
                .then(function(response){
                	vm.loader = false;
			    	vm.searchLoader = false;
                	if(response.data.status_code == 200){
			    		if(response.data.data.length == 0){
			    			vm.noCampaigns = true;
			    			vm.gridOptions.data = [];
			    		}
				    	else{
				    		vm.gridOptions.data = response.data.data.campaigns;
		                	vm.totalRecords = response.data.data.total_count;
		            		vm.totalPages = Math.ceil(vm.totalRecords / 10);
				    	}
			    	}
			    	else if(response.data.status_code == 403){
			    		vm.noCampaigns = true;
		    			vm.gridOptions.data = [];
			    	}
			    	else if(response.data.status_code == 400) {
		                $window.location = CONFIG.APP_DOMAIN + 'logout';
		            }
                })
			};
 
		  	vm.getDataDown = function() {
			    vm.pageNo++;
			    var data = $("form[name='filter_form']").serialize();
			    vm.loader = true;
			    return $http({
	                headers: {
	                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	                },
	                method: 'POST',
	                url: gridApiCall,
	                data: data + '&' + $.param({
	                	search : vm.search,
	                	page_no : vm.pageNo,
	                	all_campaigns: vm.all_campaigns
	                })
	            })
                .then(function(response){
                	vm.loader = false;
                	if(response.data.status_code == 200){
                		vm.lastPage++;
	                	vm.gridApi.infiniteScroll.saveScrollPercentage();
	                	vm.gridOptions.data = vm.gridOptions.data.concat(response.data.data.campaigns);
	                	return vm.gridApi.infiniteScroll.dataLoaded(vm.firstPage > 0, vm.lastPage < vm.totalPages - 1).then(function() {
	                		//vm.checkDataLength('up');
	                	});
                	}
                	else if(response.data.status_code == 400) {
		                $window.location = CONFIG.APP_DOMAIN + 'logout';
		            }
                })
                .catch(function(error) {
			      	return vm.gridApi.infiniteScroll.dataLoaded();
			    })
		  	};

		  	/*vm.getDataUp = function() {
			    vm.pageNo--;
			    var data = $("form[name='filter_form']").serialize();
			    return $http({
	                headers: {
	                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	                },
	                method: 'POST',
	                url: gridApiCall,
	                data: data + '&' + $.param({
	                	search : vm.search,
	                	page_no : vm.pageNo
	                })
	            })
                .then(function(response){
                	if(response.data.status_code == 200){
                		vm.firstPage--;
	                	vm.gridApi.infiniteScroll.saveScrollPercentage();
	                	vm.gridOptions.data = vm.gridOptions.data.concat(response.data.data.campaigns);
	                	return vm.gridApi.infiniteScroll.dataLoaded(vm.firstPage > 0, vm.lastPage < vm.totalPages).then(function() {
	                		//vm.checkDataLength('down');
	                	});
                	}
                	else if(response.data.status_code == 400) {
		                $window.location = CONFIG.APP_DOMAIN + 'logout';
		            }
                })
                .catch(function(error) {
			      	return vm.gridApi.infiniteScroll.dataLoaded();
			    })
		  	};*/


	  		/*vm.checkDataLength = function( discardDirection) {
			    // work out whether we need to discard a page, if so discard from the direction passed in
			    if( vm.lastPage - vm.firstPage > vm.totalPages - 1 ){
			      	// we want to remove a page
			      	vm.gridApi.infiniteScroll.saveScrollPercentage();
			 
			      	if( discardDirection === 'up' ){
			        	vm.data = vm.data.slice(50);
			        	vm.data.firstPage++;
			        	$timeout(function() {
			          		// wait for grid to ingest data changes
			         		 vm.gridApi.infiniteScroll.dataRemovedTop(vm.firstPage > 0, vm.pageNo < vm.totalPages);
			        	});
			      	}
		      		else {
				        vm.data = vm.data.slice(0, vm.totalRecords - 50);
				        vm.lastPage--;
				        $timeout(function() {
				          // wait for grid to ingest data changes
				          vm.gridApi.infiniteScroll.dataRemovedBottom(vm.firstPage > 0, vm.lastPage < vm.totalPages - 1);
				        });
			      	}
			    }
			  };*/

		  	function init(search, searchLoader){
		  		vm.getFirstData(search, searchLoader).then(function(){
	    			$timeout(function() {
				      	// timeout needed to allow digest cycle to complete,and grid to finish ingesting the data
				      	// you need to call resetData once you've loaded your data if you want to enable scroll up,
				      	// it adjusts the scroll position down one pixel so that we can generate scroll up events
	      				vm.gridApi.infiniteScroll.resetScroll( vm.firstPage > 0, vm.lastPage < vm.totalPages - 1 );
	    			});
	    		})
		  	}

		  	if(CampaignsData.bol){
			  	$timeout(function(){
			  		init('', false);
			  	})
		  	}

		  	var clearFilterBol = false,
		  	applyFilterBol = false;
		    function applyFilter(search, searchLoader){
		    	if(!searchLoader){
		    		if(vm.selectedType.length || vm.selectedStatus.length || vm.locationCheck || applyFilterBol){
				    	init(search, searchLoader);
				    	clearFilterBol = true;
				    	applyFilterBol = false;	
			    	}
		    	}
		    	else{
		    		init(search, searchLoader);
		    	}
		    }

		    function searchFilter(val){
		    	if(val.length >= 2){
		    		applyFilter(val, true);
		    	}
		    	else if(val.length == 0){
		    		applyFilter('', true)
		    	}
		    }

		    function clear(val, searchLoader){
		    	vm.selectedType = [];
				vm.selectedStatus = [];
				vm.locationCheck = false;
		    	if(clearFilterBol){
		    		applyFilterBol = true;
		    		setTimeout(function(){applyFilter(val, searchLoader);clearFilterBol = false;},100);
		    	}	
		    }

		    function editCampaigns(row){
		    	$http({
	                headers: {
	                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	                },
	                method: 'POST',
	                url: CONFIG.APP_DOMAIN + 'view_campaign',
	                data: $.param({
	                	campaign_id: row.entity.id
	                }),
	            })
                .then(function(response){
                	if(response.data.status_code == 200){
                		CampaignsData.setCampaigns(response.data.data);
                		CampaignsData.addCampaigns('id', row.entity.id);
                		$state.go('app.campaigns.editCampaigns');
                	}
                	else if(response.data.status_code == 400) {
		                $window.location = CONFIG.APP_DOMAIN + 'logout';
		            }
		    	})
		    }

		}


		function MyCampaignsController(){

		}

		function EditCampaignsController($state, CompanyDetails, CampaignsData, contactBuckets, jobListData, rippleService, $window, $http, CONFIG){
		
			var vm = this;

			vm.company_name = CompanyDetails.name;

			vm.errCond = false;
			vm.loader = false;
			vm.campaignDetails = {};
			vm.bucketsName = {};
			vm.radioButtons = {};
			vm.checkBox = {};
			vm.campaign = ['Mass Recruitment', 'Military Veterans', 'Campus Hires'];

			vm.updateCampaign = updateCampaign;
			vm.resetCampaign = resetCampaign;
			vm.trash = trash;

			vm.campaignDetails = CampaignsData.getCampaigns();
			vm.cacheData = angular.copy(vm.campaignDetails);
			
		    vm.bucketsName = contactBuckets.getBucket();
	    	vm.checkedBuckets = vm.campaignDetails.bucket_ids || [];

		    vm.jobsList = jobListData.getJobListData();
		    function resetJobs(){
		    	if(vm.campaignDetails.job_ids.length > 0){
					var arr = [];
					for(var i = 0; i < vm.campaignDetails.job_ids.length; i++){
						arr.push(vm.campaignDetails.job_ids[i].toString())
					}
					vm.campaignDetails.job_ids = arr;
					$('#mul_select').trigger('chosen:updated');
				}
		    }
		    resetJobs();

			// modern select
			setTimeout(function(){$('#mul_select').chosen()},1);


		    function radioButton(){
		    	vm.radioButtons = {
					address : vm.campaignDetails.location_type || 'online'
				}
		    }
		    radioButton();

			vm.checkBox = {
				schedule : 'false',
				socialNetworks : 'false',
				myNetworks : 'false',
				ceoPitch : 'false',
				employeePitch : 'false'
			}
			

		    // ripple effect
		    rippleService.wave();

		    // uploader
		    for(var i = 0; i < 2; i++){
				window["$upload_pitch"+i] = $('.upload-pitch').eq(i);
				pitchUpload(i);
			}


			vm.currentDate = new Date();
			function schedule(){
				vm.scheduleTime = [0];
				vm.currentTimeLength = 0;
				if(vm.campaignDetails.schedule.length > 1){
					for(var i = 1; i < vm.campaignDetails.schedule.length; i++){
						vm.currentTimeLength++;
						vm.scheduleTime.push(vm.currentTimeLength);
					}
				}
				vm.campaignDetails.date = [];
				if(vm.campaignDetails.schedule.length > 0){
					for(var i = 0; i < vm.scheduleTime.length; i++){
						var obj = {};
						obj.start_on_date = new Date(vm.campaignDetails.schedule[i].start_on_date);
						obj.end_on_date = new Date(vm.campaignDetails.schedule[i].end_on_date);
						obj.start_on_time = new Date(vm.campaignDetails.schedule[i].start_on_date+' '+vm.campaignDetails.schedule[i].start_on_time);
						obj.end_on_time = new Date(vm.campaignDetails.schedule[i].end_on_date+' '+vm.campaignDetails.schedule[i].end_on_time);
						obj.schedule_id = vm.campaignDetails.schedule[i].schedule_id;
						vm.campaignDetails.date.push(obj);
					}
				}
			}
			schedule();
			vm.addSchedule = function(){
				vm.currentTimeLength++;
				vm.scheduleTime.push(vm.currentTimeLength);
			}
			vm.closeSchedule = function(val){
				var indx = vm.scheduleTime.indexOf(val);
				vm.scheduleTime.splice(indx, 1)
			}
	
			
			if(vm.campaignDetails.hasOwnProperty('files')){
				for(var i = 0; i < vm.campaignDetails.files.length; i++){
					if(i == 0){
						vm.checkBox.ceoPitch = true;
			    		param = 'ceos_pitch_s3';
			    		hasFile(param, vm.campaignDetails.files[i], i, false);
			    	}
			    	else{
			    		vm.checkBox.employeePitch = true;
			    		param = 'employees_pitch_s3';
			    		hasFile(param, vm.campaignDetails.files[i], i, false);
			    	}
				}
			}

			var resetFilesArray = [];
			function filesReset(){
				if(resetFilesArray){
					for(var i = 0; i < resetFilesArray.length; i++){
						var indx = resetFilesArray[i];
						if(indx == 0){
							vm.checkBox.ceoPitch = true;
				    		param = 'ceos_pitch_s3';
				    		hasFile(param, vm.campaignDetails.files[indx], indx, false);
				    	}
				    	else{
				    		vm.checkBox.employeePitch = true;
				    		param = 'employees_pitch_s3';
				    		hasFile(param, vm.campaignDetails.files[indx], indx, false);
				    	}
					}
				}
				resetFilesArray = [];
			}

			vm.directiveCall = function(dirFn) {
               	vm.resetBuckects = dirFn;
           	};


			var uploadTemplate = '<div class="upload-box">'+
									'<div class="file">'+
										'<div class="progress-bar"></div>'+
										'<div class="filename"></div>'+
									'</div>'+
								'</div>'

			var param = '';
		    function pitchUpload(index){
		    	var uploader = new qq.FileUploader({
		            element: document.getElementsByClassName('upload-pitch')[index],
		            dragText: "",
		            uploadButtonText: "Browse File",
		            multiple : false,
		            sizeLimit: (25*1024*1024),
		            allowedExtensions: ["MP4", "AMV", "MPG", "AVI", "MKV"],
		            action: CONFIG.APP_DOMAIN+'file_upload',

		            onSubmit: function(id, name){
		            	eval("$upload_pitch"+index).next('.upload-box').remove();
		            	eval("$upload_pitch"+index).after(uploadTemplate);
		            },
		            onComplete: function(id, name, response){
		                if(response.success){
		         			if(index == 0){
					    		param = 'ceos_pitch';
					    	}
					    	else{
					    		param = 'employees_pitch'
					    	}
		                	$('.progress-bar').hide();
		                	hasFile(param, response, index, true);
		                }
		                else{
		                    for(var i = 0; i < 2; i++){
			                    eval("$upload_pitch"+i).find('.qq-upload-fail').remove();
			                }
			                eval("$upload_pitch"+index).next('.upload-box').remove();
		                    eval("$upload_pitch"+index).append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>"+response.msg+"</span></div>");
		                }
		            },
		            onProgress: function(id, fileName, loaded, total){
		            	var percent = Math.round((loaded / total) * 100);
		            	$('.progress-bar').progressbar({
					      	value: percent
					    });
		            },
		            showMessage: function(msg){
		                for(var i = 0; i < 2; i++){
		                    eval("$upload_pitch"+i).find('.qq-upload-fail').remove();
		                }
		                eval("$upload_pitch"+index).append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>"+msg+"</span></div>");
		            }
		        });
		    }

		    function trash(index){
		    	resetFilesArray.push(index);
		    	eval("$upload_pitch"+index).next('.upload-box').remove();
		    }

		    function hasFile(name, response, index, cond){
                if(cond){
			    	$('.progress-bar').eq(index).hide();
					eval("$upload_pitch"+index).find('.qq-upload-fail').remove();
	            	eval("$upload_pitch"+index).find('.qq-upload-success').hide();
	                eval("$upload_pitch"+index).find('.qq-upload-list').css('z-index','-1');
                	eval("$upload_pitch"+index).next('.upload-box').find('.filename').append('<img src="public/images/video.png">');
            		eval("$upload_pitch"+index).next('.upload-box').find('.filename').append('<p class="name ellipsis">'+response.org_name+'</p>');
            		eval("$upload_pitch"+index).next('.upload-box').find('.filename').append('<img src="public/images/material_icons/circle-close.svg" onclick="angular.element(this).scope().EditCampaignsCtrl.trash('+index+')">');
                	eval("$upload_pitch"+index).next('.upload-box').append("<input type='hidden' name='"+ name +"_file' value='" + response.filename + "' />").show();
                	eval("$upload_pitch"+index).next('.upload-box').append("<input type='hidden' name='"+ name +"_name' value='" + response.org_name + "' />").show();
                }
                else{
                	setTimeout(function(){
                		var org_name = response.split('/').pop();
	                	eval("$upload_pitch"+index).after(uploadTemplate);
	                	eval("$upload_pitch"+index).next('.upload-box').find('.progress-bar').hide();
	                	eval("$upload_pitch"+index).next('.upload-box').find('.filename').append('<img src="public/images/video.png">');
	            		eval("$upload_pitch"+index).next('.upload-box').find('.filename').append('<p class="name ellipsis">'+org_name+'</p>');
	            		eval("$upload_pitch"+index).next('.upload-box').find('.filename').append('<img src="public/images/material_icons/circle-close.svg" onclick="angular.element(this).scope().EditCampaignsCtrl.trash('+index+')">');
	                	eval("$upload_pitch"+index).next('.upload-box').append("<input type='hidden' name='"+ name +"' value='" + response + "' />").show();
                	},100)
                }
			}

		    function updateCampaign(isValid){
		    	//console.log(isValid)
		    	if(!isValid){
		    		vm.errCond = true;
		    	}
		    	else{
		    		vm.errCond = false;
		    		vm.loader = true;
		    		var data = $('form[name="edit_campaigns_form"]').serialize();
		    		return $http({
		                headers: {
		                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		                },
		                method: 'POST',
		                url: CONFIG.APP_DOMAIN + 'add_campaign',
		                data: data + '&' + $.param({
		                	request_type: 'edit'
		                }),
		            })
	                .then(function(response){
	                	vm.loader = false;
	                	if(response.data.status_code == 200){
	                		$state.go('app.campaigns.allCampaigns');
	                	}
	                	else if(response.data.status_code == 400) {
			                $window.location = CONFIG.APP_DOMAIN + 'logout';
			            }

			    	})
	            }
		    }

		    function resetCampaign(){
		    	vm.campaignDetails = angular.copy(vm.cacheData);
		    	schedule();
		    	radioButton();
		    	vm.resetBuckects();
		    	filesReset();
		    	resetJobs();
		    }
		}




}());