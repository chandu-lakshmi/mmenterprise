(function () {
"use strict";

	angular

		.module('app.edit.company', [])
		.controller('editCompanyProfileController', editCompanyProfileController)


	editCompanyProfileController.$inject = ['$scope', '$http', '$q', '$window', 'CompanyDetails', '$compile', 'App'];

	function editCompanyProfileController($scope, $http, $q, $window, CompanyDetails, $compile, App){

		var vm = this,dublicateData,canceller;
    	var image_path = '',mul_image_path = [],bonus_file_path = '';
    	
    	$("#company-logo .fancybox").fancybox({
    		helpers : {
		        title: {
		            type: 'inside'
		        }
		    },
		    maxWidth: 800
    	});
    	$(".image-group .fancybox").fancybox({
    		helpers : {
		        title: {
		            type: 'inside'
		        }
		    },
		    prevEffect	: 'none',
			nextEffect	: 'none',
		    maxWidth: 800
    	});

		vm.update = false;
		vm.errCond = false;
		vm.updateLoader = false;
		vm.industry_list = [];
    	vm.no_of_emp = ["10-50","50-100","100-500","500-1000","1000-5000","5000+"];


    	vm.update_company = update_company;
    	vm.cancel = cancel;
    	vm.trash = trash;
    
		// restricting spaces intially
		$("input, textarea").on("keypress", function(e) {
		    if (e.which === 32 && !this.value.length)
		        e.preventDefault();
		});

		$('form:first input:first').attr('readonly','readonly');


		// GetIndustries
	    var get_industries = $http({
	        headers: {
	           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	        },
	        method: 'GET',
	        url: App.base_url+'get_industries'
	    })
	    get_industries.success(function(response){
	       vm.industry_list = response.data.industries; 
	    })
	    get_industries.error(function(response){
	        vm.industry_list = [];
	    })



		// view company details API call
		function getCompanyDetails(status){

			var param = $.param({
				company_code : CompanyDetails.company_code
			})
			var view_company_details = $http({
		        headers: {
		           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		        },
		        method: 'POST',
		        data: param,
		        url: App.base_url+'view_company_details'
		    })

		    view_company_details.success(function(response){
	    		vm.errCond = false;
	    		if(response.status_code == 200){
		    		if(response.data.length != 0){
		    			vm.company_code = CompanyDetails.company_code;
			       		vm.company_details = response.data.companyDetails;
		       			dublicateData = angular.copy(vm.company_details);
		    			if(status != 'update'){
							$('form:first input[name=website]').focus();
		    			}
			       		if(vm.company_details.company_logo.length != 0){
			       			companyLogo();
			       		}
			       		else{
				   			App.Helpers.removeUploadedFiles({
				   				obj: $company_logo
				   			})
				   		}
			       		if(vm.company_details.images.length > 0){
			       			initialCallback(vm.company_details.images.length);
			       			for(var i = 3;i >= vm.company_details.images.length; i--){
				   				App.Helpers.removeUploadedFiles({
					   				obj: eval("$mul_images_"+i)
					   			})
				   			}
				   		}
				   		else{
				   			for(var i = 0; i < 4; i++){
				   				App.Helpers.removeUploadedFiles({
					   				obj: eval("$mul_images_"+i)
					   			})
				   			}
				   		}
			       		if(vm.company_details.referral_bonus_file.length != 0){
			       			referralBonusFile();
			       		}
			       		else{
				   			vm.trash(false);
				   		}
		    		}
		    	}
		    	else if(response.status_code == 400){
	                $window.location = App.base_url+'logout';
	            }
		        
		    })
		    view_company_details.error(function(response){
		        console.log(response)
		    })
		}
		getCompanyDetails();

		// initial company logo qq-uploader
		function companyLogo(){
			$company_logo.find('.qq-upload-drop-area').show();
			$company_logo.find('.qq-upload-list').html('');
			App.Helpers.loadImage({
	            target: $company_logo.find('.drag_img'),
	            css: 'img-thumbnail',
	            remove: true,
	            url_prefix: false,
	            view : true,
	            url: vm.company_details.company_logo,
	            onComplete: function(){
	            	$company_logo.find('.qq-upload-list').append("<li><input type='hidden' name='org_name_s3' value='" + vm.company_details.company_logo.split('/').pop() + "' /><input type='hidden' value='" + vm.company_details.company_logo + "' name='logo_image_s3'/></li>").show();
	            },
	            onError: function() {
	            	$company_logo.find('.qq-upload-drop-area').hide();
	                $company_logo.find('.qq-upload-button').show();
	            }
	        });
		}

		function initialCallback(length){
			for(var i = 0; i < length; i++){
				init_cal_back(i)
			}
		}
		function init_cal_back(i){
			eval("$mul_images_"+i).find('.qq-upload-drop-area').show();
			eval("$mul_images_"+i).find('.qq-upload-list').html('');
			App.Helpers.loadImage({
	            target: eval("$mul_images_"+i).find('.drag_img'),
	            css: 'img-thumbnail',
	            remove: true,
	            view: true,
	            url_prefix: false,
	            url: vm.company_details.images[i],
	            onComplete: function(){
	            	eval("$mul_images_"+i).find('.qq-upload-list').append("<li><input type='hidden' name='org_name_s3[]' value='" + vm.company_details.images[i].split('/').pop() + "' /><input type='hidden' value='" + vm.company_details.images[i] + "' name='photos_s3[]'/></li>").show();
	            },
	            onError: function() {
	            	eval("$mul_images_"+i).find('.qq-upload-drop-area').hide();
	                $company_logo.find('.qq-upload-button').show();
	            }
	        });
		}

		// initial referral bonus file qq-uploader
		function referralBonusFile(){
			$referral_bonus.find('.qq-upload-button').hide();
			$referral_bonus.find('.qq-upload-drop-area').css('display','block');
			$referral_bonus.find('.drag_img').css('background','transparent');
			$referral_bonus.find('.qq-upload-list').html('');
			$referral_bonus.find('.qq-upload-list').css('z-index','-1');
			$referral_bonus.find('.qq-upload-list').append("<li><input type='hidden' name='referral_org_name_s3' value='" + vm.company_details.referral_org_name + "' /><input type='hidden' value='" + vm.company_details.referral_bonus_file + "' name='referral_bonus_file_s3'/></li>").show();
			$referral_bonus.find('.qq-upload-list li').css('background', 'transparent');
			$referral_bonus.find('.qq-upload-drop-area .drag_img').html('<a href="'+App.base_url+'viewer?url='+vm.company_details.referral_bonus_file+'" class="view" target="_blank"><img src="public/images/Applied.svg" alt="view"><p title="'+vm.company_details.referral_org_name+'">'+vm.company_details.referral_org_name+'&nbsp;</p></a>');
			$referral_bonus.find('.drag_img').append('<a href="'+vm.company_details.referral_bonus_file+'" download class="download"><img src="public/images/material_icons/download.svg"></a><img src="public/images/material_icons/circle-close.svg" onclick="angular.element(this).scope().editCompCtrl.trash(true)"/>');
		}


		function trash(reset){
			if(reset){
				vm.update = true;
				$scope.$apply();
			}
			$referral_bonus.find('.drag_img').html('');
			$referral_bonus.find('.qq-upload-list').html('');
			$referral_bonus.find('.qq-upload-list').css('z-index','-1');
			$referral_bonus.find('.qq-upload-drop-area').css('display','none');
			$referral_bonus.find('.qq-upload-button').show();
		}


	
		function update_company(isValid){

			if(!isValid || vm.company_details.industry == '' || vm.company_details.industry == null){
				vm.errCond = true;
			}
			else{

				var param = $(' form[name="edit_company_form"]').serialize();

				vm.errCond = false;
				vm.updateLoader = true;
				
				if(canceller){
		            canceller.resolve();
		        }

		        canceller = $q.defer();

				var update_company = $http({
		            headers: {
		                "content-type": 'application/x-www-form-urlencoded'
		            },
		            method : 'POST',
		            url : App.base_url+'update_company',
		            data : param,
		            timeout : canceller.promise
		        });

		        update_company.success(function(response){
		        	if(response.status_code == 200){
		        		vm.update = false;
			        	vm.updateLoader = false;
		        		$scope.edit_company_form.$setPristine();

		        		if(response.data.hasOwnProperty('company_logo')){
		        			$('.user_dp img').attr({
		        				'src':response.data.company_logo
		        			});
		        			$('.user_dp img').css({
		        				'border':'1px solid #ccc !important',
		        				'border-radius':'50%'
		        			})
		        		}
		        		else{
		        			$('.user_dp img').attr({
		        				'src':'public/images/avatar.png'
		        			});
		        		}

			        	getCompanyDetails('update');
			        }
			        else if(response.status_code == 400){
		                $window.location = App.base_url+'logout';
		            }
		        })
		        update_company.error(function(response){
					vm.updateLoader = false;
		        	console.log(response);
		        })
			}
	    }


	    // Company logo qq-uploader
	    var $company_logo = $('#company-logo');
	    App.Helpers.initUploader({
	        id: "company-logo",
	        dragText: "",
	        uploadButtonText: "",
	        size: (1 * 1024 * 1024),
	        allowedExtensions: ["jpg", "jpeg", "png"],
	        action: App.base_url + "file_upload",
	        showFileInfo: false,
	        shortMessages: true,
	        remove: true,
	        file_name : 'logo_org_name',
		    path_name : 'logo_image',
	        onSubmit: function(id, name) {
	            $company_logo.find('.qq-upload-list').css('z-index','0');
	        },
	        onComplete: function(id, name, response) {
	            if (response.success) {
	                $company_logo.find('.qq-upload-list').css('z-index','-1');
		    		$company_logo.find('.qq-upload-drop-area').css('display','block');
		    		vm.update = true;
		    		$scope.$apply();
	                App.Helpers.loadImage({
	                    target: $company_logo.find('.drag_img'),
	                    css: 'img-thumbnail',
	                    remove: true,
	                    view : true,
	                    url_prefix: App.API_DOMAIN,
	                    url: response.filename,
	                    onComplete: App.Helpers.setImagePosition,
	                    onError: function() {
	                        $company_logo.find('.qq-upload-button').show();
	                    }
	                });
	            }
	        },
	        showMessage: function(msg, obj) {
	            $company_logo.closest('.form-group').find('div.error').hide();
	            $company_logo.find('.qq-upload-list').css('z-index','0');
	            $(obj._listElement).fadeIn();
	        },
	        onRemove: function() {
	        	vm.update = true;
	            $scope.$apply();
	        },
	        onRemoveComplete: function() {
	        	$company_logo.find('.qq-upload-list').css('z-index','-1');
	        }
	    });

		// Multiple image upload
		for(var i = 0; i < 4; i++){
			window["$mul_images_"+i] = $('#multiple-images-'+i);
			calBack(i);
		}

		function calBack(index){

			 App.Helpers.initUploader({
	            id: "multiple-images-"+index,
	            dragText: "",
	            uploadButtonText: "",
	            size: (1 * 1024 * 1024),
	            allowedExtensions: ["jpg", "jpeg", "png"],
	            action: App.base_url + "file_upload",
	            showFileInfo: false,
	            shortMessages: true,
	            remove: true,
	            file_name : 'org_name[]',
			    path_name : 'photos[]',

	            onSubmit: function(id, name) {
	                eval("$mul_images_"+index).find('.qq-upload-list').css('z-index','0');
	            },
	            onComplete: function(id, name, response) {
	                if (response.success) {
	                    eval("$mul_images_"+index).find('.qq-upload-list').css('z-index','-1');
			    		eval("$mul_images_"+index).find('.qq-upload-drop-area').css('display','block');
			    		vm.update = true;
			    		$scope.$apply();
	                    App.Helpers.loadImage({
	                        target: eval("$mul_images_"+index).find('.drag_img'),
	                        css: 'img-thumbnail',
	                        remove: true,
	                        view: true,
	                        url_prefix: App.API_DOMAIN,
	                        url: response.filename,
	                        onComplete: App.Helpers.setImagePosition,
	                        onError: function() {
	                            eval("$mul_images_"+index).find('.qq-upload-button').show();
	                        }
	                    });
	                }
	            },
	            showMessage: function(msg, obj) {
	                eval("$mul_images_"+index).closest('.form-group').find('div.error').hide();
	                eval("$mul_images_"+index).find('.qq-upload-list').css('z-index','0');
	                $(obj._listElement).fadeIn();
	            },
	            onRemove: function() {
	            	vm.update = true;
	                $scope.$apply();
	            },
	            onRemoveComplete: function() {
	            	eval("$mul_images_"+index).find('.qq-upload-list').css('z-index','-1');
	            }
	        });
		}

		// Referral Bonus upload
		var $referral_bonus = $('#referral-bonus');
		App.Helpers.initUploader({
	        id: "referral-bonus",
	        dragText: "",
	        uploadButtonText: "Upload a file",
	        size: (10 * 1024 * 1024),
	        allowedExtensions: ['csv','pdf','doc','docx'],
	        action: App.base_url + "file_upload",
	        showFileInfo: false,
	        shortMessages: true,
	        remove: true,
	        file_name : 'referral_org_name',
		    path_name : 'referral_bonus_file',

	        onSubmit: function(id, name) {
	            $referral_bonus.find('.qq-upload-list').css('z-index','0');
	        },
	        onComplete: function(id, name, response){
		    	if(response.success){
		    		vm.update = true;
		    		$scope.$apply();
		    		bonus_file_path = App.API_DOMAIN+response.filename;
		    		$referral_bonus.find('.qq-upload-list').css('z-index','-1');
		    		$referral_bonus.find('.qq-upload-list .qq-upload-success').css('background', 'transparent');
		    		$referral_bonus.find('.qq-upload-list .upload-success').hide();
		    		$referral_bonus.find('.qq-upload-button').hide();
		    		$referral_bonus.find('.drag_img').css('background','transparent');
		    		$referral_bonus.find('.qq-upload-drop-area').css('display','block');
		    		$referral_bonus.find('.qq-upload-drop-area .drag_img').html('<a href="'+App.base_url+'viewer?url='+bonus_file_path+'" class="view" target="_blank"><img src="public/images/Applied.svg"><p class="ellipsis" title="'+response.org_name+'">'+response.org_name+'&nbsp;</p></a>');
		    		$referral_bonus.find('.drag_img').append('<a href="'+bonus_file_path+'" download class="download"><img src="public/images/material_icons/download.svg"></a><img src="public/images/material_icons/circle-close.svg" onclick="angular.element(this).scope().editCompCtrl.trash(true)" style="margin-top:-4px">');
		    	}
		    	else{
		    		$referral_bonus.find('.qq-upload-button').show();
		    		$referral_bonus.find('.qq-upload-fail').remove();
		    		$referral_bonus.append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>"+response.msg+"</span></div>");
		    	}
		    },
		    showMessage: function(msg, obj) {
	            $referral_bonus.closest('.form-group').find('div.error').hide();
	            $referral_bonus.find('.qq-upload-list').css('z-index','0');
	            $(obj._listElement).fadeIn();
	        },
	        onRemove: function() {
	        	vm.update = true;
	            $scope.$apply();
	        },
	        onRemoveComplete: function() {
	        	$referral_bonus.find('.qq-upload-list').css('z-index','-1');
	        }
	    })

		
		// on cancel qq uploader
		function reset(){
			vm.company_details = angular.copy(dublicateData);
			if(vm.company_details.company_logo.length != 0){
	   			companyLogo();
	   		}
	   		else{
	   			App.Helpers.removeUploadedFiles({
	   				obj: $company_logo
	   			})
	   		}
	   		if(vm.company_details.images.length > 0){
	   			initialCallback(vm.company_details.images.length);
	   			for(var i = 3;i >= vm.company_details.images.length; i--){
	   				App.Helpers.removeUploadedFiles({
		   				obj: eval("$mul_images_"+i)
		   			})
	   			}
	   		}
	   		else{
	   			for(var i = 0; i < 4; i++){
	   				App.Helpers.removeUploadedFiles({
		   				obj: eval("$mul_images_"+i)
		   			})
	   			}
	   		}
	   		if(vm.company_details.referral_bonus_file.length != 0){
	   			referralBonusFile();
	   		}
	   		else{
	   			vm.trash(false);
	   		}
		}
	
		// cancel button
		function cancel(){
			reset();
			if(canceller){
	            canceller.resolve();
	        }
			vm.update = false;
			vm.errCond = false;
		}

	}



}());