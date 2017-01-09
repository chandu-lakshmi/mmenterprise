(function () {
	"use strict";

	angular
		.module('app.campaigns', ['app.components', 'ui.grid', 'ui.grid.infiniteScroll', 'ui.grid.selection', 'mdPickers', 'ngMessages', 'ngAutocomplete'])
		.controller('CampaignsController', CampaignsController)
		.controller('NewCampaignController', NewCampaignController)
		.controller('AllCampaignsController', AllCampaignsController)
		.controller('MyCampaignsController', MyCampaignsController)
		.controller('EditCampaignsController', EditCampaignsController)
		.service('CampaignsData', CampaignsData)
		.service('contactBuckets', contactBuckets)
		.service('createJobData', createJobData)
		.directive('createJob', createJob)


		CampaignsController.$inject = ['$http', '$window', 'contactBuckets', '$uibModal', 'App'];
		NewCampaignController.$inject = ['$scope', '$state', '$timeout', '$window', 'contactBuckets', 'CampaignsData', '$uibModalInstance', '$http', 'CompanyDetails', 'createCampaign', 'createJobData', 'App'];
		AllCampaignsController.$inject = ['$state', '$http', '$q', '$timeout', '$window', 'uiGridConstants', 'CampaignsData', 'userPermissions', '$stateParams', 'App'];
		MyCampaignsController.$inject = [];
		EditCampaignsController.$inject = ['$scope', '$state', 'CompanyDetails', 'CampaignsData', 'contactBuckets', 'rippleService', '$window', '$http', 'App'];
		createJobData.$inject = ['$rootScope'];
		createJob.$inject = ['App', '$http', '$window', '$timeout', 'createJobData'];

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

		function createJobData($rootScope){
			this.UpdateDataInCtrl = function(data){
				if(data.editCampagin){
					$rootScope.$broadcast('newJobDataEditCmp', data);
				}
				else{
					$rootScope.$broadcast('newJobData', data);
				}
			}
		}

		function CampaignsController($http, $window, contactBuckets, $uibModal, App){

			var vm = this;

			function bucketsList(){
		        var get_buckets = $http({
		            headers: {
		              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		            },
		            method: 'POST',
		            url: App.base_url + 'buckets_list'
		        })
		        get_buckets.success(function(response) {
		            if (response.status_code == 200) {
		                contactBuckets.setBucket(response.data.buckets_list);
		                vm.bucketListApi = true;
		            }
		            else if (response.status_code == 400) {
		                $window.location = App.base_url + 'logout';
		            }
		        })
		        get_buckets.error(function(response){
		            console.log(response);
		        })
		    }
		    bucketsList();

		    this.createNewCampaign = createNewCampaign;
		
			function createNewCampaign(boolCreatNewCamp){
				$uibModal.open({
		            animation: false,
		            backdrop: 'static',
		            keyboard: false,
		            templateUrl: 'templates/campaigns/new-campaign-dialog.phtml',
		            openedClass: "new-campaign",
		            resolve : { 
					    createCampaign : function() {
					       return boolCreatNewCamp;
					    }
  					},
		            controller:'NewCampaignController',
		     		controllerAs: 'NewCampaignCtrl'
		        });
			};
		}

		function createJob(App, $http, $window, $timeout, createJobData){
			return{
				restrict:'AE',
				scope:{
					setFn: '&',
					closeTemplate : '&',
					closeModals : '&',
					editCampagin : '=' 
				},
				templateUrl:'templates/campaigns/template-create-job.phtml',
				link : function(scope){
					//google api location
					scope.geo_location = '';
  					scope.geo_options = '';
  					scope.geo_details = '';
  					scope.$watch(function() {
					    return scope.geo_details;
					  }, function(location) {
			    	});

					scope.postJob = function(invalid){
						if(invalid || scope.jobData.jobDescription.trim().length == 0){
							scope.errCond = true;
							return;
						}
						scope.apiCallStart = true;
						$http({
							headers: {
					          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					        },
					        method: 'post',
					        data: $('form[name="create_job"').serialize()+ '&' + $.param({
			        			job_period:'immediate',
								job_type:'global'
			        		}),
					        url: App.base_url + 'job_post_from_campaigns'
						}).success(function(response){
							if(response.status_code == 200){
								scope.apiCallStart = false;
								scope.apiSuccessMsg = response.message.msg[0];
								response.data['editCampagin'] = scope.editCampagin.bol
								$timeout(function(){ scope.editCampagin.bol ? scope.closeDismiss() : scope.close()}, 800);
								createJobData.UpdateDataInCtrl(response.data);
								$timeout(function(){scope.apiSuccessMsg = ""}, 900);
			    			}
					    	else if(response.status_code == 400){
				                $window.location = App.base_url + 'logout';
				            }
						});
					}

					scope.close = function(){
						scope.closeTemplate();
						scope.errCond = false;
						scope.jobData = {};
					}
					
					function getData(){
						var apiCall = ['get_job_functions', 'get_industries', 'get_employment_types', 'get_experiences'];

						for(var i = 0; i < apiCall.length; i++){
							$http({
								headers: {
						          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
						        },
						        method: 'GET',
						        url: App.base_url + apiCall[i]
							}).success(function(response){
								if(response.status_code == 200){
									var label = Object.keys(response.data)[0];
			    					scope[label] = response.data[label]; 

				    			}
						    	else if(response.status_code == 400){
					                $window.location = App.base_url + 'logout';
					            }
							});
						}
					}

					if(scope.editCampagin.bol){
						getData();
					}
					scope.setFn({dirFn:getData});
					scope.closeDismiss = function(){
						scope.closeModals();
					}
				}
			}
		}

		function NewCampaignController($scope, $state, $timeout, $window, contactBuckets, CampaignsData, $uibModalInstance, $http, CompanyDetails, createCampaign, createJobData, App){

			var vm = this;

			this.company_name = CompanyDetails.name;
			this.jobLists = [];
			this.frm2 = {};
			this.frm2.job_ids = [];
			$scope.$watch(contactBuckets.getBucket, function(newValue, oldValue) {
				vm.bucketsName = angular.copy(contactBuckets.getBucket());
    		})
			setTimeout(function(){$('#selectJob').chosen()}, 0);
			$('html').addClass('remove-scroll');
			this.currentDate = new Date();

			this.geo_location = '';
  			this.geo_options = {types:'(cities)'};
  			this.geo_details = '';
  			
  			
			this.switchSteps = switchSteps;
			this.addTimeSheet = addTimeSheet;
			this.closeTimeSheet = closeTimeSheet;
			this.postNewCampaign = postNewCampaign;
			this.closeModal = closeModal;
			this.trash = trash;
			this.showJobTemplate = false;
  			this.jobTemplate = jobTemplate;
  			this.createJobData = createJobData;

  			// NewCampaign or Create Job based on Boolean
  			this.createJobEditCampagin =  !createCampaign;
  			this.campState = {
  				bol : vm.createJobEditCampagin
  			} 
			if(vm.createJobEditCampagin){
				jobTemplate();
			}

			var formName = 'frm1';
			this.currentStep = 1;
			this.step1 = true;
			
			function switchSteps(step){

				if(step == "next"){
					if(vm.currentStep == 2){
						if($scope[formName].$invalid  ||  vm.frm2.job_ids.length == 0){
							vm['errCond' + formName]= true;
							return;
						}
					}else{
						if($scope[formName].$invalid){
							vm['errCond' + formName]= true;
							return;
						}	
					}
					vm['errCond' + formName]= false;
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

			this.timeSheetGroups = [1];
			this.currentTimeSheet = 1;

			function addTimeSheet(){
				if(vm.timeSheetGroups.length == 5){
					vm.frm2.checkbox = false;
					return;
				}
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
			        url: App.base_url + 'add_campaign'
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
		                $window.location = App.base_url + 'logout';
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
		            action: App.base_url+'file_upload',

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
			                eval("$upload_pitch"+index).next('.upload-box').remove();
		                    eval("$upload_pitch"+index).append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>"+response.msg+"</span></div>");
		                }
		                $('.progress-bar').hide();
		            },
		            onProgress: function(id, fileName, loaded, total){
		            	var percent = Math.round((loaded / total) * 100);
		            	eval("$upload_pitch"+index).next().find('.progress-bar').progressbar({
					      	value: percent
					    });
		            },
		            showMessage: function(msg){
		            	eval("$upload_pitch"+index).find('.qq-upload-fail').remove();
		                eval("$upload_pitch"+index).append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>"+msg+"</span></div>");
		            }
		        });
		    }

		    function trash(index){
		    	eval("$upload_pitch"+index).next('.upload-box').remove();
		    	eval("$upload_pitch"+index).find('.qq-upload-fail').remove();
		    }
			
			function closeModal(){
				$('html').removeClass('remove-scroll');
				$uibModalInstance.dismiss('cancel');
			}

			function createJobData(dirFn){
				vm.createJobApi = dirFn;
			}

			var triggerCreateJobCalls = true;
			
			function jobTemplate(){				
				vm.showJobTemplate = !vm.showJobTemplate;
				if(triggerCreateJobCalls){
					vm.createJobApi();
					triggerCreateJobCalls = false;		
				}
			}

			var componentForm = {
		        locality: 'long_name',
		        administrative_area_level_1: 'long_name',
		        country: 'long_name',
		        postal_code: 'short_name'
      		};

      		var locationModalName = {
      			locality: 'city',
		        administrative_area_level_1: 'state',
		        country: 'country',
		        postal_code: 'zip_code'	
      		}

			$scope.$watch(function() {
			    return vm.geo_details;
			  }, function(location) {
			    if (location) {
			      if(location.hasOwnProperty('address_components')){
			      	vm.frm1.location.zip_code = '';
			      	for (var i = 0; i < location.address_components.length; i++) {
			         	var addressType = location.address_components[i].types[0];
			          	if (componentForm[addressType]) {
			            	var val = location.address_components[i][componentForm[addressType]];
			           		vm.frm1.location[locationModalName[addressType]] = val;
			          	}
			        }
			        vm.lat = location.geometry.location.lat();
			        vm.lng = location.geometry.location.lng();
			      }
			    }
			});


			this.resetLocation = function(city){
				if(city == undefined){
					vm.frm1.location.zip_code = "";
					vm.frm1.location.state = "";
					vm.frm1.location.country = "";
				}
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

   			$scope.$on('newJobData', function(event, data) {
   				
   				var obj = {
   					no_of_vacancies : data.no_of_vacancies,
   					id : data.post_id,
   					job_title : data.name
   				}
        		vm.jobLists.push(obj);
        		var id = data.post_id.toString();
          		vm.frm2.job_ids.push(id);
  				$timeout(function(){$('#selectJob').trigger('chosen:updated')}, 100);
    		})

   			$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
       		 	$uibModalInstance.dismiss('cancel');
    		});
		}


		function AllCampaignsController($state, $http, $q, $timeout, $window, uiGridConstants, CampaignsData, userPermissions, $stateParams, App){

			var vm = this,canceler,
			gridApiCall = App.base_url + 'campaigns_list';

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


			vm.searchResults = [];
			function location(search){
            	
				if(canceler){
					canceler.resolve()
				}

				canceler = $q.defer();

				return $http({
	                headers: {
	                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	                },
	                method: 'GET',
	                url: '//restcountries.eu/rest/v1/name/'+search,
	                timeout: canceler.promise
	            })
                .then(function(response){
                	var filterCountries = [];
                	for(var i = 0; i < response.data.length; i++){
                		filterCountries.unshift(response.data[i].name);
                	}

                	if(vm.selectedCountries){
                		for(var j = 0; j < vm.selectedCountries.length; j++){
                			if(filterCountries.indexOf(vm.selectedCountries[j]) == -1){
                				filterCountries.push(vm.selectedCountries[j]);
                			}
                		}
                	}
                	vm.searchResults = [];
                	vm.searchResults = filterCountries;
                	var searchData = $('.search-field input').val();
            		setTimeout(function(){
            			$('#mul_select').trigger('chosen:updated');
            			$('.search-field input').val(searchData).focus();
            		},0);
		    	})
			}
			/*function location(search){

            	console.log(vm.selectedCountries);
            	
				if(canceler){
					canceler.resolve()
				}
				else{
					if(vm.selectedCountries){
	            		for(var i = 0; i < vm.selectedCountries.length; i++){
	            			console.log(vm.searchResults.indexof(vm.selectedCountries[i]))
	            			if(vm.searchResults.indexof(vm.selectedCountries[i]) == -1){
	            				vm.searchResults.push(vm.selectedCountries[i])
	            			}
	            		}
	            	}
				}

				canceler = $q.defer();

				return $http({
	                headers: {
	                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	                },
	                method: 'GET',
	                url: '//restcountries.eu/rest/v1/name/'+search,
	                timeout: canceler.promise
	            })
                .then(function(response){
                	for(var i = 0; i < response.data.length; i++){
                		vm.searchResults.push(response.data[i].name);
                		// $('.chosen-drop').find('.chosen-results').append('<li class="active-result" data-option-array-index="'+i+'">'+ response.data[i].name +'</li>')
                	}
            		setTimeout(function(){$('#mul_select').trigger('chosen:updated')},100);
		    	})
			}*/
			

			vm.clear = clear;
			vm.applyFilter = applyFilter;
			vm.searchFilter = searchFilter;
			vm.editCampaigns = editCampaigns;

			vm.editCampaignTemplate = 'templates/campaigns/edit-campaigns.phtml'


			// modern select
			$('#mul_select').chosen();
			$('.chosen-container').bind('keypress', function(e){
				var val = $(this).find('input').val();
				if(val.length >= 2){
					location(val)
				}
			})

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
				noUnselect: true, // need to look after
				infiniteScrollRowsFromEnd: 8,
				infiniteScrollUp:true,
				infiniteScrollDown:true,
				data: 'data'
			};

			vm.gridOptions.columnDefs = [
				{ field: 'campaign_name', displayName:'CAMPAIGN NAME', cellClass: 'first-col', width: '20%', enableSorting: false },
			    { field: 'campaign_type', displayName:'CAMPAIGN TYPE', width: '25%', enableSorting: true, sortDirectionCycle: ['asc', 'desc', ''] },
			    { field: 'total_vacancies', displayName:'#VACANCIES', width: '20%', enableSorting: false },
			    { field: 'start_on_date', displayName:'START & END DATES', width: '25%', enableSorting: false, cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.start_on_date | date: "MMM dd"}} - {{row.entity.end_on_date | date: "MMM dd, yyyy "}}</div>' },
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
		                $window.location = App.base_url + 'logout';
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
		                $window.location = App.base_url + 'logout';
		            }
                })
                .catch(function(error) {
			      	return vm.gridApi.infiniteScroll.dataLoaded();
			    })
		  	};

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
		    		if(vm.selectedType.length || vm.selectedStatus.length || applyFilterBol || vm.searchResults.length){
				    	init(search, searchLoader);
				    	clearFilterBol = true;
				    	applyFilterBol = false;	
			    	}
		    	}
		    	else{
		    		init(search, searchLoader);
		    	}
		    }

		    var inputPrev = "";
		    function searchFilter(val, event){

		    	val = val || '';
		        if(event.keyCode === 32 && val.length === 0 || inputPrev == val){
		            return false;
		        }
		        inputPrev = val;

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
				vm.searchResults = [];
				setTimeout(function(){$('#mul_select').val('').trigger('chosen:updated');}, 1);
		    	if(clearFilterBol){
		    		applyFilterBol = true;
		    		setTimeout(function(){applyFilter(val, searchLoader);clearFilterBol = false;},100);
		    	}	
		    }

		    function editCampaigns(row){
		    	vm.loader = true;

		    	$http({
	                headers: {
	                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	                },
	                method: 'POST',
	                url: App.base_url + 'view_campaign',
	                data: $.param({
	                	campaign_id: row.entity.id
	                }),
	                // timeout: canceler.promise
	            })
                .then(function(response){
                	if(response.data.status_code == 200){
                		CampaignsData.setCampaigns(response.data.data);
                		CampaignsData.addCampaigns('id', row.entity.id);
                		$state.go('app.campaigns.editCampaigns');
                	}
                	else if(response.data.status_code == 400) {
		                $window.location = App.base_url + 'logout';
		            }
		    	})
		    }

		}


		function MyCampaignsController(){

		}

		function EditCampaignsController($scope, $state, CompanyDetails, CampaignsData, contactBuckets, rippleService, $window, $http, App){
		
			var vm = this,
						link = App.base_url + 'email-parser/all-campaigns?ref=';

			vm.company_name = CompanyDetails.name;

			vm.errCond = false;
			vm.loader = false;
			vm.bktView = true;
			vm.campaignDetails = {};
			vm.bucketsName = {};
			vm.radioButtons = {};
			vm.checkBox = {};
			vm.campaign = ['Mass Recruitment', 'Military Veterans', 'Campus Hires'];

			//location
			vm.geo_location = '';
  			vm.geo_options = {types:'(cities)'};
  			vm.geo_details = '';

  			var componentForm = {
		        locality: 'long_name',
		        administrative_area_level_1: 'long_name',
		        country: 'long_name',
		        postal_code: 'short_name'
      		};

      		var locationModalName = {
      			locality: 'city',
		        administrative_area_level_1: 'state',
		        country: 'country',
		        postal_code: 'zip_code'	
      		}

			$scope.$watch(function() {
			    return vm.geo_details;
			  }, function(location) {
			    if (location) {
			      if(location.hasOwnProperty('address_components')){
			      	vm.campaignDetails.location.zip_code = '';
			      	for (var i = 0; i < location.address_components.length; i++) {
			         	var addressType = location.address_components[i].types[0];
			          	if (componentForm[addressType]) {
			            	var val = location.address_components[i][componentForm[addressType]];
			            	vm.campaignDetails.location[locationModalName[addressType]] = val;
			          	}
			        }
			        vm.lat = location.geometry.location.lat();
			        vm.lng = location.geometry.location.lng();
			      }
			    }
			});

			vm.updateCampaign = updateCampaign;
			vm.trash = trash;
			vm.resetLocation = resetLocation;
			vm.campaignDetails = CampaignsData.getCampaigns();
			vm.prevSelectedJobIds = [];
			vm.cacheData = angular.copy(vm.campaignDetails);
			
		    vm.bucketsName = angular.copy(contactBuckets.getBucket());
	    	vm.checkedBuckets = vm.campaignDetails.bucket_ids || [];

		    vm.jobsList = vm.campaignDetails.job_details;
		    function resetJobs(){
				var arr = [];
				for(var j = 0; j < vm.jobsList.length; j++){
					arr.push(vm.jobsList[j].post_id.toString());			
				}
				vm.campaignDetails.job_ids = arr;
				$('#mul_select').trigger('chosen:updated');
				setTimeout(function(){
					for(var i = 0; i < vm.jobsList.length; i++){
						vm.prevSelectedJobIds.push($('.chosen-choices li.search-choice').eq(i).find('a').attr('data-option-array-index'));
						$('.chosen-choices li').eq(i).find('a').remove();
					}
				},200)
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

			function resetErrors(){
				vm.errCond = false;
				for(var i = 0; i < 2; i++){
                    eval("$upload_pitch"+i).find('.qq-upload-fail').remove();
                }
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
					
					var campaginOpen = vm.campaignDetails.status == 'OPEN' ? false : true;

					for(var i = 0; i < vm.scheduleTime.length; i++){
						var obj = {};
						obj.start_on_date = campaginOpen ? new Date(vm.campaignDetails.schedule[i].start_on_date) : '';
						obj.end_on_date = campaginOpen ? new Date(vm.campaignDetails.schedule[i].end_on_date) : '';
						obj.start_on_time = campaginOpen ? (new Date(vm.campaignDetails.schedule[i].start_on_date+' '+vm.campaignDetails.schedule[i].start_on_time)) : '';
						obj.end_on_time = campaginOpen ? new Date(vm.campaignDetails.schedule[i].end_on_date+' '+vm.campaignDetails.schedule[i].end_on_time) : '';
						obj.schedule_id = vm.campaignDetails.schedule[i].schedule_id;
						vm.campaignDetails.date.push(obj);
					}
				}
			}
			schedule();
			vm.addSchedule = function(){
				if(vm.scheduleTime.length == 5){
					vm.checkbox.schedule = false;
					return;
				}
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
							trash(indx, false);
							vm.checkBox.ceoPitch = true;
				    		param = 'ceos_pitch_s3';
				    		hasFile(param, vm.campaignDetails.files[indx], indx, false);
				    	}
				    	else if(indx == 1){
							trash(indx, false);
				    		vm.checkBox.employeePitch = true;
				    		param = 'employees_pitch_s3';
				    		hasFile(param, vm.campaignDetails.files[indx], indx, false);
				    	}
					}
				}
				else{
					for(var i = 0; i < 2; i++){
						trash(i, false);
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
		            action: App.base_url+'file_upload',

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
		                	$('.progress-bar').eq(index).hide();
		                	eval("$upload_pitch"+index).find('.qq-upload-fail').remove();
			                eval("$upload_pitch"+index).next('.upload-box').remove();
		                    eval("$upload_pitch"+index).append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>"+response.msg+"</span></div>");
		                }
		            },
		            onProgress: function(id, fileName, loaded, total){
		            	var percent = Math.round((loaded / total) * 100);
		            	eval("$upload_pitch"+index).next().find('.progress-bar').progressbar({
					      	value: percent
					    });
		            },
		            showMessage: function(msg){
		                eval("$upload_pitch"+index).find('.qq-upload-fail').remove();
		                eval("$upload_pitch"+index).append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>"+msg+"</span></div>");
		            }
		        });
		    }

		    function trash(index, cond){
		    	if(cond){
		    		if(resetFilesArray.indexOf(index) == -1){
                		resetFilesArray.push(index);
                	}
		    	}
		    	eval("$upload_pitch"+index).next('.upload-box').remove();
		    }

		    function hasFile(name, response, index, cond){
                if(cond){
                	if(resetFilesArray.indexOf(index) == -1){
                		resetFilesArray.push(index);
                	}
			    	$('.progress-bar').eq(index).hide();
					eval("$upload_pitch"+index).find('.qq-upload-fail').remove();
	            	eval("$upload_pitch"+index).find('.qq-upload-success').hide();
	                eval("$upload_pitch"+index).find('.qq-upload-list').css('z-index','-1');
                	eval("$upload_pitch"+index).next('.upload-box').find('.filename').append('<img src="public/images/video.png">');
            		eval("$upload_pitch"+index).next('.upload-box').find('.filename').append('<p class="name ellipsis">'+response.org_name+'</p>');
            		eval("$upload_pitch"+index).next('.upload-box').find('.filename').append('<img src="public/images/material_icons/circle-close.svg" onclick="angular.element(this).scope().EditCampaignsCtrl.trash('+index+', true)">');
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
	            		eval("$upload_pitch"+index).next('.upload-box').find('.filename').append('<img src="public/images/material_icons/circle-close.svg" onclick="angular.element(this).scope().EditCampaignsCtrl.trash('+index+', true)">');
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
		                url: App.base_url + 'add_campaign',
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
			                $window.location = App.base_url + 'logout';
			            }

			    	})
	            }
		    }

		    function resetLocation(city){
		    	if(city == undefined){
		    		vm.campaignDetails.location.zip_code = "";
		    		vm.campaignDetails.location.state = "";
		    		vm.campaignDetails.location.country = "";
		    	}
		    }
		    $scope.$on('newJobDataEditCmp', function(event, data) {
   				vm.jobsList.push(data);
   				var id = data.post_id.toString();
   				vm.campaignDetails.job_ids.push(id)
		    	vm.campaignDetails.job_ids = angular.copy(vm.campaignDetails.job_ids);
   				setTimeout(function(){$('#mul_select').trigger('chosen:updated')}, 100);
   				setTimeout(function(){
   					for(var j = 0;j < vm.prevSelectedJobIds.length; j++){
   						for(var i = 0; i < $('.chosen-choices li.search-choice').length - 1; i++){
							if($('.chosen-choices li a').eq(i).attr('data-option-array-index') == vm.prevSelectedJobIds[j]){
								$('.chosen-choices li a').eq(i).remove();
								break;
							}
						}
   					}

				},200);
    		});


    		// Social Sharing
    		vm.facebook = facebook;
    		vm.twitter = twitter;
    		vm.googlePlus = googlePlus;
    		vm.linkedin = linkedin;

    		function facebook(){
    			var share_object = {
                    method: "feed",
                    name: vm.campaignDetails.campaign_name,
                    link: link + vm.campaignDetails.camp_ref,
                    picture: CompanyDetails.company_logo || '',
                    /*caption: (post.post_title < 100 ? post.post_title : ''),
                    description: $('<div />').html(post.post_msg).text()*/
                };
                
                FB.ui(share_object, function (response) {
                    if (response && !response.error_code) {
                        console.log(response)
                    }
                });
    		}

    		function twitter(){
                var twitter_window = window.open('', "Twitter", "status = 1, left = 430, top = 170, height = 500, width = 420, resizable = 0")
                var share_object = {
                	text : vm.campaignDetails.campaign_name.toUpperCase(),
                	url : link + vm.campaignDetails.camp_ref,
                	hashtags : vm.campaignDetails.campaign_type,
                	via : CompanyDetails.name,
                	related : ''
                }
                twitter_window.location.href = "https://twitter.com/intent/tweet?text=" + share_object.text + "&url=" + share_object.url + "&hashtags=" + share_object.hashtags + "&via=" + share_object.via + "&related=" + share_object.related; 
            }

            function linkedin(obj){
                var linkedin_window = window.open('', "Linkedin", "status = 1, left = 430, top = 170, height = 500, width = 420, resizable = 0");
                var share_object = {
                	mini : true,
                	url : link + vm.campaignDetails.camp_ref,
                	title : vm.campaignDetails.campaign_name + ',' + vm.campaignDetails.campaign_type,
                	summary : 'Starts on : ' + vm.campaignDetails.schedule[0].start_on_date,
                	source : CompanyDetails.name
                }
                linkedin_window.location.href = "https://www.linkedin.com/shareArticle?mini=" + share_object.mini + "&url=" + share_object.url + "&title=" + share_object.title + "&summary=" + share_object.summary + "&source=" + share_object.source;
            }

            function googlePlus(){
                var google_window = window.open('', "GooglePlus", "status = 1, left = 430, top = 170, height = 500, width = 420, resizable = 0");
                var url = link + vm.campaignDetails.camp_ref;
                google_window.location.href = "https://plus.google.com/share?url=" + url;
            }
		}




}());