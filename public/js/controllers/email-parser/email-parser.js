(function () {
	"use strict";

	angular
		.module('app.email.parser', ['infinite-scroll'])
		.controller('modalController', modalController)
		.controller('AllJobsController', AllJobsController)
		.controller('JobDetailsController', JobDetailsController)
		.controller('ApplyJobController', ApplyJobController)
		.controller('AllCampaignsController', AllCampaignsController)

		modalController.$injext = ['$state', 'App'];
		AllJobsController.$inject = ['$http', '$q', '$location', 'App'];
		JobDetailsController.$inject = ['$http', '$stateParams', '$window', '$location', 'App'];
		ApplyJobController.$inject = ['$scope', '$state', '$stateParams', '$location', '$window', '$http', '$uibModal', 'App', 'ReferralDetails', 'CampaignDetails'];
		AllCampaignsController.$inject = ['$location', '$http', '$window', '$q', 'App', 'CampaignDetails'];


		function modalController($state, App){

			var vm = this;

			vm.jump = jump;

			function jump(){
				$state.go('allJobs', {ref: App.ref})
			}
		}

		function AllJobsController($http, $q, $location, App){

			var vm = this, canceler;

			vm.bol = true;
			vm.copyUrl = $location.$$absUrl;

			var page_no = 1,total_pages = 1;
			
			vm.search_val = '';
			vm.loader = false;
			vm.noJobs = false;

			vm.infiniteScroll = {
				busy : false,
				list : [],
				url : App.base_url + 'apply_jobs_list',
				nextPage : function(){},
				loadApi : function(){},
				onComplete : function(obj){
					vm.infiniteScroll.busy = false;
					for(var i = 0; i < obj.jobs_list.length; i++){
						vm.infiniteScroll.list.push(obj.jobs_list[i]);
					}
					vm.infiniteScroll.companyName = obj.company_name;
					vm.infiniteScroll.company_logo = obj.company_logo || '';
					sharing();
					if(vm.infiniteScroll.company_logo != ''){
						$('header img').on('load', function(){
							this.className = '';
						})
					}
					else{
						$('header img').remove();
					}
				},
				onError : function(){
					$window.location = App.base_url + 'logout';
				}
			}

			vm.infiniteScroll.nextPage = function(){
		        if(total_pages >= page_no && total_pages != 0){
		            if(vm.infiniteScroll.busy){
		                return;
		            }

		            vm.infiniteScroll.busy = true;

		            vm.infiniteScroll.loadApi(page_no, vm.search_val);
		        }
		    }

		    vm.infiniteScroll.loadApi = function(pageNo, searchVal, callBack){

		    	if(canceler){
		    		canceler.resolve();
		    	}

		    	canceler = $q.defer();

		    	$http({
	                headers: {
	                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	                },
	                method: 'POST',
	                url: vm.infiniteScroll.url,
	                data: $.param({
	                	reference_id : App.ref,
	                	page_no : pageNo,
	                	search : searchVal
	                }),
	                timeout: canceler.promise
	            })
	            .then(function(response){
	            	vm.loader = false;
	            	if(response.data.status_code == 200){
	            		if(callBack != undefined){
			    			callBack();
			    			vm.infiniteScroll.list = [];
			    		}
	            		if(page_no == 1){
	            			vm.infiniteScroll.total_count = response.data.data.count;
	                        total_pages = Math.ceil(vm.infiniteScroll.total_count / 10);
	                    }
	                    page_no++;
	            		vm.infiniteScroll.onComplete(response.data.data)
	            	}
	            	else if(response.data.status_code == 403){
	            		vm.infiniteScroll.list = [];
	            		vm.noJobs = true;
	            		vm.infiniteScroll.total_count = 0;
	            		total_pages = 0;
	            		if(callBack != undefined){
	            			callBack();
	            		}
	            	}
	            	else if(response.data.status_code == 400) {
		               vm.infiniteScroll.onError();
		            }
	            })
		    }

		    // epi search directive
			vm.search_opts= {
				delay: 500,
                progress: false,
                complete: false,
                placeholder:'Search Job Title/location',
                onSearch: function (val) {
                    vm.search_val = val;
                    page_no = 1;
	            	vm.noJobs = false;
                    vm.loader = true;
                    if (vm.search_opts.progress) {
                        if (vm.search_opts.value) {
                        	vm.infiniteScroll.loadApi(page_no, vm.search_val, function(){
                        		vm.search_opts.progress = false;
		                        vm.search_opts.complete = true;
                        	});
                        }
                    }
                },
                onClear: function () {
                    vm.search_val = "";
                    page_no = 1;
                    vm.noJobs = false;
                    vm.loader = true;
                    vm.infiniteScroll.loadApi(page_no, vm.search_val);
                }
			}

			// social sharing directive
			function sharing(){
				vm.socialMedia = {
					socialIcons: ['facebook', 'twitter', 'linkedin', 'googlePlus'],
					url: vm.copyUrl,
					facebook: {
						post_title: 'List of Jobs',
						post_url: vm.copyUrl,
						post_img: vm.infiniteScroll.company_logo || '',
						post_msg: ''
					},
					twitter : {
						text: 'List of Jobs',
						url: vm.copyUrl,
						hashtags: '',
						via: vm.infiniteScroll.companyName,
						related: ''
					},
					linkedin : {
						url: vm.copyUrl,
						title: 'List of Jobs',
						summary: vm.infiniteScroll.total_count + ' jobs',
						source: vm.infiniteScroll.companyName
					},
					googlePlus : {
						url: vm.copyUrl
					}
				}
			}
			
		}

		function JobDetailsController($http, $stateParams, $window, $location, App){

			var vm = this;

			var ref = $stateParams.ref;
			vm.copyUrl = $location.$$absUrl;

			vm.job_details = {
				list : [],
				loader : false,
				url : App.base_url + 'apply_job_details',
				onload : function(){},
				onComplete : function(obj){
					vm.job_details.list = obj.job_details;
					vm.job_details.companyName = obj.company_name;
					vm.job_details.company_logo = obj.company_logo || '';
					sharing();
					if(vm.job_details.company_logo != ''){
						$('header img').on('load', function(){
							this.className = '';
						})
					}
					else{
						$('header img').remove();
					}
				},
				onError : function(){
					$window.location = App.base_url + 'logout';
				}
			}

			vm.job_details.onload = function(){
				vm.job_details.loader = true;
				$http({
	                headers: {
	                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	                },
	                method: 'POST',
	                url: vm.job_details.url,
	                data: $.param({
	                	reference_id : ref
	                })
	            })
	            .then(function(response){
	            	vm.job_details.loader = false;
	            	if(response.data.status_code == 200){
	            		vm.job_details.onComplete(response.data.data)
	            	}
	            	else if(response.data.status_code == 400) {
		               vm.job_details.onError();
		            }
	            })
			}

			vm.job_details.onload();

			function sharing(){
				vm.socialMedia = {
					socialIcons: ['facebook', 'twitter', 'linkedin', 'googlePlus'],
					url: vm.copyUrl,
					facebook: {
						post_title: vm.job_details.list[0].job_name,
						post_url: vm.copyUrl,
						post_img: vm.job_details.company_logo || '',
						post_msg: ''
					},
					twitter : {
						text: vm.job_details.list[0].job_name,
						url: vm.copyUrl,
						hashtags: '',
						via: vm.job_details.companyName,
						related: ''
					},
					linkedin : {
						url: vm.copyUrl,
						title: vm.job_details.list[0].job_name,
						summary: vm.job_details.list[0].job_description,
						source: vm.job_details.companyName
					},
					googlePlus : {
						url: vm.copyUrl
					}
				}
			}

		}

		function ApplyJobController($scope, $state, $stateParams, $location, $window, $http, $uibModal, App, ReferralDetails, CampaignDetails){

			var vm = this;

			vm.status = $location.search().flag;
			vm.backendError = '';
			vm.loader = false;
			vm.backendMsg = '';

			// pagetitle
			if($stateParams.flag == 1){
				$state.current.data.pageTitle = 'Mintmesh ( Drop CV )';
			}
			else{
				$state.current.data.pageTitle = 'Mintmesh ( Refer )';
			}

			vm.referralDetails = ReferralDetails;
			if(Object.keys(CampaignDetails).length){
				ReferralDetails.emailid = CampaignDetails.emailid;
				ReferralDetails.company_logo = CampaignDetails.company_logo;
				ReferralDetails.company_name = CampaignDetails.company_name;
			}

			var ref = $stateParams.ref;
			var apiCall = App.base_url + 'apply_job';
			
			this.fileName = 'Select a file to upload...';

			$("#can-mobile").intlTelInput({
				preferredCountries: ['in', 'us', 'gb'],
				nationalMode: false,
				initialCountry: "in",
				separateDialCode: true

			});

			if($stateParams.status == 'CLOSED'){
				$uibModal.open({
		            animation: true,
		            backdrop: 'static',
		            keyboard: false,
		            templateUrl: '../templates/email-parser/dialog-post-experied.phtml',
		            controller : 'modalController',
		            controllerAs : 'modalCtrl'
		        });
			}

			vm.postFormData = postFormData;

			vm.chkFile = true;
			function postFormData(formValid, flag){
				vm.backendError = '';
				if(formValid || vm.chkFile){
					vm.errorRequired = true;
					return;
				}
				else{
					vm.loader = true;
					angular.element('.footer .disabled').css('pointer-events','none');
					var data = $('form[name="'+flag+'_form"]').serialize();

					$http({
		                headers: {
		                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		                },
		                method: 'POST',
		                url: apiCall,
		                data: data + '&' + $.param({
		                	ref : ref,
		                	flag : vm.status
		                })
		            })
	                .then(function(response){
	                	vm.loader = false;
	                	angular.element('.footer .disabled').css('pointer-events','auto');
	                	if(response.data.status_code == 200){
	                		vm.backendMsg = response.data.message.msg[0];
	                		if($state.current.name == 'candidateDetails' || $stateParams.jc == 0){
	                			setTimeout(function(){$state.go('allJobs', {ref: ref})},1000);
	                		}
	                		else{
	                			setTimeout(function(){$state.go('allCampaigns', {ref: App.camp_ref})},1000);
	                		}
	                	}
	                	else if(response.data.status_code == 403){
	                		vm.backendError = response.data.message.msg[0];
	                	}
	                	else if (response.data.status_code == 400) {
			                $window.location = App.base_url + 'logout';
			            }
	                });
				}
			}

			var bonus_file_path;
			var $upload_resume = $('#upload-resume');
		    App.Helpers.initUploader({
		        id: "upload-resume",
		        dragText: "",
		        uploadButtonText: "SELECT FILE",
		        size: (1 * 1024 * 1024),
		        allowedExtensions: ["DOC", "PDF", "RTF", "DOCX"],
		        action: App.base_url + "resumes_upload",
		        showFileInfo: false,
		        shortMessages: true,
		        remove: false,
		        file_name : 'resume_original_name',
			    path_name : 'cv',
		        onSubmit: function(id, name) {
		        	$('.file-check').text('');
		            $upload_resume.find('.qq-upload-list').css('z-index','0');
		            $upload_resume.find('.qq-upload-fail').remove();
		        },
		        onComplete: function(id, name, response) {
		            if (response.success) {
		            	bonus_file_path = App.API_DOMAIN+response.filename;
		                $upload_resume.find('.qq-upload-list').css('z-index','-1');
			    		$upload_resume.find('.qq-upload-button').hide();
			    		$upload_resume.find('.drag_img').css('background','transparent');
			    		$upload_resume.find('.qq-upload-drop-area').css('display','block');
			    		$upload_resume.find('.qq-upload-drop-area .drag_img').html('<a href="'+App.base_url+'viewer?url='+bonus_file_path+'" class="view" target="_blank"><img src="../public/images/Applied.svg"><p class="ellipsis">'+response.org_name+'&nbsp;</p></a>');
			    		$upload_resume.find('.drag_img').append('<a href="'+bonus_file_path+'" download class="download"><img src="../public/images/material_icons/download.svg"></a><img src="../public/images/material_icons/circle-close.svg" onclick="angular.element(this).scope().ApplyJobCtrl.trash(true)" style="margin-top:-4px">');
			    		vm.chkFile = false;
			    		$scope.$apply();
		            }
		            else{
			    		$upload_resume.find('.qq-upload-button').show();
			    		$upload_resume.find('.qq-upload-fail').remove();
			    		$upload_resume.append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>"+response.msg+"</span></div>");
		    		}
		        },
		        showMessage: function(msg, obj) {
		        	$('.file-check').text('');
		        	$upload_resume.find('.qq-uploader + .qq-upload-fail').remove();
		            $upload_resume.closest('.form-group').find('div.error').hide();
		            $upload_resume.find('.qq-upload-list').css('z-index','0');
		            $(obj._listElement).fadeIn();
		        },
		        onRemove: function() {

		        },
		        onRemoveComplete: function() {
		        	$upload_resume.find('.qq-upload-list').css('z-index','-1');
		        }
		    });


		    this.trash = function(){
		    	$('.file-check').text('Please Select File');
				$upload_resume.find('.drag_img').html('');
				$upload_resume.find('.qq-upload-list').html('');
				$upload_resume.find('.qq-upload-list').css('z-index','-1');
				$upload_resume.find('.qq-upload-drop-area').css('display','none');
				$upload_resume.find('.qq-upload-button').show();
				vm.chkFile = true;
				$scope.$apply();
			}
			
		}

		function AllCampaignsController($location, $http, $window, $q, App, CampaignDetails){

			var vm = this,
						canceler;

			vm.bol = true;
			vm.copyUrl = $location.$$absUrl;

			var page_no = 1,total_pages = 1;

			// social sharing directive
			function sharing(){
				vm.socialMedia = {
					socialIcons: ['facebook', 'twitter', 'linkedin', 'googlePlus'],
					url: vm.copyUrl,
					facebook: {
						post_title: vm.infiniteScroll.headerDetails.campaign_name,
						post_url: vm.copyUrl,
						post_img: CampaignDetails.company_logo || '',
						post_msg: ''
					},
					twitter : {
						text: vm.infiniteScroll.headerDetails.campaign_name.toUpperCase(),
						url: vm.copyUrl,
						hashtags: vm.infiniteScroll.headerDetails.campaign_type,
						via: CampaignDetails.company_name,
						related: ''
					},
					linkedin : {
						url: vm.copyUrl,
						title: vm.infiniteScroll.headerDetails.campaign_name + ',' + vm.infiniteScroll.headerDetails.campaign_type,
						summary: 'Starts on: ' + vm.infiniteScroll.headerDetails.campaign_start_date,
						source: CampaignDetails.company_name
					},
					googlePlus : {
						url: vm.copyUrl
					}
				}
			}

			vm.infiniteScroll = {
				busy : false,
				list : [],
				headerDetails : {},
				url : App.base_url + 'campaign_jobs_list',
				nextPage : function(){},
				loadApi : function(){},
				onComplete : function(obj){
					vm.infiniteScroll.busy = false;
					for(var i = 0; i < obj.campaign_jobs_list.length; i++){
						vm.infiniteScroll.list.push(obj.campaign_jobs_list[i]);
					}
					vm.infiniteScroll.headerDetails = obj;
					sharing();
					vm.bol = false;
					if(vm.infiniteScroll.headerDetails.company_logo != ''){
						$('header img').on('load', function(){
							this.className = '';
						})
					}
					else{
						$('header img').remove();
					}
				},
				onError : function(){
					$window.location = App.base_url + 'logout';
				}
			}

			vm.infiniteScroll.nextPage = function(){
		        if(total_pages >= page_no && total_pages != 0){
		            if(vm.infiniteScroll.busy){
		                return;
		            }

		            vm.infiniteScroll.busy = true;

		            vm.infiniteScroll.loadApi(page_no, vm.search_val);
		        }
		    }

		    vm.infiniteScroll.loadApi = function(pageNo, searchVal, callBack){

		    	if(canceler){
		    		canceler.resolve();
		    	}

		    	canceler = $q.defer();

		    	$http({
	                headers: {
	                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	                },
	                method: 'POST',
	                url: vm.infiniteScroll.url,
	                data: $.param({
                		time_zone : new Date().getTimezoneOffset()
	                }),
	                timeout: canceler.promise
	            })
	            .then(function(response){
	            	if(response.data.status_code == 200){
	            		if(callBack != undefined){
			    			callBack();
			    			vm.infiniteScroll.list = [];
			    		}
	            		if(page_no == 1){
	            			vm.infiniteScroll.total_count = response.data.data.count;
	                        total_pages = Math.ceil(vm.infiniteScroll.total_count / 10);
	                    }
	                    page_no++;
	            		vm.infiniteScroll.onComplete(response.data.data)
	            	}
	            	else if(response.data.status_code == 403){
	            		vm.infiniteScroll.list = [];
	            		vm.noJobs = true;
	            		vm.infiniteScroll.total_count = 0;
	            		total_pages = 0;
	            		if(callBack != undefined){
	            			callBack();
	            		}
	            	}
	            	else if(response.data.status_code == 400) {
		               vm.infiniteScroll.onError();
		            }
	            })
		    }
		}
		
}());