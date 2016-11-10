(function () {
"use strict";

angular.module('app.edit.company', [])


.controller('editCompanyProfileController', ['$scope', '$http', '$q', '$window', 'CompanyDetails', '$compile', 'CONFIG', function($scope, $http, $q, $window, CompanyDetails, $compile, CONFIG){

	var scope = this,dublicateData,canceller;
    var image_path = '',mul_image_path = [],bonus_file_path = '';

	scope.update = false;

    var $company_logo = $('#company-logo'),$referral_bonus = $('#referral-bonus');

    for(var i = 0; i < 4; i++){
		window["$mul_images_"+i] = $('.multiple-images').eq(i);
	}

	// restricting spaces intially
	$("input, textarea").on("keypress", function(e) {
	    if (e.which === 32 && !this.value.length)
	        e.preventDefault();
	});

	$('form:first input:first').attr('readonly','readonly');
	

	// cancel button
	this.cancel = function(){
		reset();
		canceller.resolve();
		scope.update = false;
		scope.errCond = false;
		$('.qq-upload-fail').remove();
	}

	// on cancel qq uploader
	function reset(){
		scope.company_details = angular.copy(dublicateData);
		if(scope.company_details.company_logo.length != 0){
   			companyLogo();
   		}
   		else{
   			scope.trash(-1,false);
   		}
   		if(scope.company_details.images.length > 0){
   			initialCallback(scope.company_details.images.length);
   			for(var i = 3;i >= scope.company_details.images.length; i--){
   				scope.trash(i,false);
   			}
   		}
   		else{
   			for(var i = 0; i < 4; i++){
   				scope.trash(i,false);
   			}
   		}
   		if(scope.company_details.referral_bonus_file.length != 0){
   			referralBonusFile();
   		}
   		else{
   			scope.trash(-2,false);
   		}
	}

	// initial company logo qq-uploader
	function companyLogo(){
		$company_logo.find('.drag_txt').hide();
		$company_logo.find('.qq-upload-list').show();
		$company_logo.find('.qq-upload-success').hide();
		$company_logo.find('.qq-upload-drop-area').css('display','block');
		$company_logo.find('.qq-upload-drop-area').html('<div class="drag_img"><img src="'+scope.company_details.company_logo+'" class="img-thumbnail"/></div>');
		$company_logo.find('.qq-upload-list li').remove();
		$company_logo.find('.qq-upload-list').append("<li><input type='hidden' name='org_name_s3' value='" + scope.company_details.company_logo.split('/').pop() + "' /><input type='hidden' value='" + scope.company_details.company_logo + "' name='logo_image_s3'/></li>").show();
		$company_logo.find('.drag_img').append('<div class="overlay"></div><i class="fa fa-trash-o icon-trash" onclick="angular.element(this).scope().editCompCtrl.trash(-1,true)"></i>');
	}

	// initial referral bonus file qq-uploader
	function referralBonusFile(){
		$referral_bonus.find('.qq-upload-button').hide();
		$referral_bonus.find('.qq-upload-success').hide();
		$referral_bonus.find('.qq-upload-drop-area').css('display','block');
		$referral_bonus.find('.qq-upload-list').css('z-index','-1');
		$referral_bonus.find('.qq-upload-list li').remove();
		$referral_bonus.find('.qq-upload-list').append("<li><input type='hidden' name='referral_org_name_s3' value='" + scope.company_details.referral_org_name + "' /><input type='hidden' value='" + scope.company_details.referral_bonus_file + "' name='referral_bonus_file_s3'/></li>").show();
		$referral_bonus.find('.qq-upload-drop-area').html('<div class="drag_img"><a href="'+scope.company_details.referral_bonus_file+'" class="view"><img src="public/images/Applied.svg" alt="view"><p title="'+scope.company_details.referral_org_name+'">'+scope.company_details.referral_org_name+'&nbsp;</p></a>');
		$referral_bonus.find('.drag_img').append('<a href="'+scope.company_details.referral_bonus_file+'" download class="download"><img src="public/images/material_icons/download.svg"></a><img src="public/images/material_icons/circle-close.svg" onclick="angular.element(this).scope().editCompCtrl.trash(-2,true)"/>');
	}


	// GetIndustries
    var get_industries = $http({
        headers: {
           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        method: 'GET',
        url: CONFIG.APP_DOMAIN+'get_industries'
    })

    get_industries.success(function(response){
       scope.industry_list = response.data.industries; 
    })
    get_industries.error(function(response){
        scope.industry_list = [];
    })

    // No of Employees
    this.no_of_emp = ["10-50","50-100","100-500","500-1000","1000-5000","5000+"];


	// view company details API call
	function getCompanyDetails(status){

		// for showing only available images from backend
		$('.qq-upload-fail').remove();
		$('.qq-upload-drop-area').css('display','none')
		$('.qq-upload-drop-area').find('.drag_img').remove();
		$('.qq-upload-list').find('li').remove();
		$('.qq-upload-button').show();

		var param = $.param({
			company_code : CompanyDetails.company_code
		})
		var view_company_details = $http({
	        headers: {
	           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	        },
	        method: 'POST',
	        data: param,
	        url: CONFIG.APP_DOMAIN+'view_company_details'
	    })

	    view_company_details.success(function(response){
    		scope.errCond = false;
    		if(response.status_code == 200){
	    		if(response.data.length != 0){
		       		scope.company_details = response.data.companyDetails;
	       			dublicateData = angular.copy(scope.company_details);
	    			if(status != 'cancel'){
						$('form:first input[name=website]').focus();
	    			}
		       		if(scope.company_details.company_logo.length != 0){
		       			companyLogo();
		       		}
		       		if(scope.company_details.images.length > 0){
		       			initialCallback(scope.company_details.images.length)
		       		}
		       		if(scope.company_details.referral_bonus_file.length != 0){
		       			referralBonusFile();
		       		}
	    		}
	    	}
	    	else if(response.status_code == 400){
                $window.location = CONFIG.APP_DOMAIN+'logout';
            }
	        
	    })
	    view_company_details.error(function(response){
	        console.log(response)
	    })
	}
	getCompanyDetails();


	function initialCallback(length){
		for(var i = 0; i < length; i++){
			init_cal_back(i)
		}
	}
	function init_cal_back(i){
		eval("$mul_images_"+i).find('.drag_txt').hide();
		eval("$mul_images_"+i).find('.qq-upload-list').show();
		eval("$mul_images_"+i).find('.qq-upload-success').hide();
		eval("$mul_images_"+i).find('.qq-upload-drop-area').css('display','block');
		eval("$mul_images_"+i).find('.qq-upload-drop-area').html('<div class="drag_img"><img src="'+scope.company_details.images[i]+'" class="img-thumbnail"/></div>');
		eval("$mul_images_"+i).find('.qq-upload-list li').remove();
		eval("$mul_images_"+i).find('.qq-upload-list').append("<li><input type='hidden' name='org_name_s3[]' value='" + scope.company_details.images[i].split('/').pop() + "' /><input type='hidden' value='" + scope.company_details.images[i] + "' name='photos_s3[]'/></li>").show();
		eval("$mul_images_"+i).find('.drag_img').append("<div class='overlay'></div><i class='fa fa-trash-o icon-trash' onclick='angular.element(this).scope().editCompCtrl.trash("+i+",true)'></i>");
	}

	this.trash = function(value,reset){
		if(reset){
			scope.update = true;
			$scope.$apply();
		}
		if(value == '-1'){
			$company_logo.find('.drag_img').find('img').removeAttr('src');
			$company_logo.find('.qq-upload-list li').remove();
			$company_logo.find('.qq-upload-drop-area').css('display','none');
			$company_logo.find('.qq-upload-drop-area .drag_img').remove();
		}
		else if(value == '-2'){
			$referral_bonus.find('.drag_img').remove();
			$referral_bonus.find('.qq-upload-list li').remove();
			$referral_bonus.find('.qq-upload-drop-area').css('display','none');
			$referral_bonus.find('.qq-upload-button').show();
		}
		else{
			eval("$mul_images_"+value).find('.drag_img').find('img').removeAttr('src');
			eval("$mul_images_"+value).find('.qq-upload-list li').remove();
			eval("$mul_images_"+value).find('.qq-upload-drop-area').css('display','none');
			eval("$mul_images_"+value).find('.qq-upload-drop-area .drag_img').remove();
		}
	}


	scope.errCond = false;
	scope.updateLoader = false;
	this.update_company = function(isValid){

		if(!isValid || scope.company_details.industry == '' || scope.company_details.industry == null){
			scope.errCond = true;
		}
		else{

			var param = $(' form[name="edit_company_form"]').serialize();

			scope.errCond = false;
			scope.updateLoader = true;
			
			if(canceller){
	            canceller.resolve();
	        }

	        canceller = $q.defer();

			var update_company = $http({
	            headers: {
	                "content-type": 'application/x-www-form-urlencoded'
	            },
	            method : 'POST',
	            url : CONFIG.APP_DOMAIN+'update_company',
	            data : param,
	            timeout : canceller.promise
	        });

	        update_company.success(function(response){
	        	if(response.status_code == 200){
	        		scope.update = false;
		        	scope.updateLoader = false;
	        		$scope.edit_company_form.$setPristine();
	        		//$('form').css('pointer-events','auto');
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
					$('.qq-upload-drop-area').css('display','none');
					$('.qq-upload-drop-area').find('.drag_img').remove();
					$('.qq-upload-list li').remove();
		        	getCompanyDetails('cancel');
		        }
		        else if(response.status_code == 400){
	                $window.location = CONFIG.APP_DOMAIN+'logout';
	            }
	        })
	        update_company.error(function(response){
	        	console.log(response);
	        	scope.updateLoader = false;
	        })
		}
    }


    // Company logo qq-uploader
	var uploader = new qq.FileUploader({
	    element: document.getElementById('company-logo'),
	    dragText: "",
		uploadButtonText: "",
		multiple : false,
		sizeLimit: (1*1024*1024),
		allowedExtensions: ["jpg", "jpeg", "png"],
	    action: CONFIG.APP_DOMAIN+'file_upload',

	    onSubmit: function(id, name){
	    	scope.update = true;
	    	$scope.$apply();
	    	$company_logo.find('.drag_txt').hide();
            // $company_logo.find('.qq-upload-button').hide();
            $company_logo.find('.qq-upload-list').css('z-index','0');
            $company_logo.find('.qq-upload-list').show();
	    },
	    onComplete: function(id, name, response){
	    	if(response.success){
	    		image_path = CONFIG.APP_API_DOMAIN+response.filename;
	    		$company_logo.find('.qq-upload-fail').remove();
	    		$company_logo.find('.qq-upload-success').hide();
	    		$company_logo.find('.qq-upload-drop-area').css('display','block');
	    		$company_logo.find('.qq-upload-drop-area').html('<div class="drag_img"><img src="'+image_path+'" class="img-thumbnail"/></div>');
	    		$company_logo.find('.qq-upload-list').append("<li><input type='hidden' name='logo_org_name' value='" + response.org_name + "' /><input type='hidden' value='" + response.filename + "' name='logo_image'/></li>").show();
	    		$company_logo.find('.drag_img').append('<div class="overlay"></div><i class="fa fa-trash-o icon-trash" onclick="angular.element(this).scope().editCompCtrl.trash(-1,true)"></i>');
	    	}
	    	else{
	    		$company_logo.find('.qq-upload-fail').remove();
	    		$company_logo.append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>"+response.msg+"</span></div>")
	    	}
	    },
	    showMessage: function(msg){
	    	$company_logo.find('.qq-upload-fail').remove();
	    	$company_logo.append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>"+msg+"</span></div>");
	    }
	});

	// Multiple image upload
	for(var i = 0; i < 4; i++){
		calBack(i);
	}

	function calBack(index){

		var uploader = new qq.FileUploader({
		    element: document.getElementsByClassName('multiple-images')[index],
			dragText: "",
			uploadButtonText: "",
		    multiple : false,
			sizeLimit: (1*1024*1024),
			allowedExtensions: ["jpg", "jpeg", "png"],
		    action: CONFIG.APP_DOMAIN+'file_upload',

		    onSubmit: function(id, name){
		    	scope.update = true;
		    	$scope.$apply();
		    	eval("$mul_images_"+index).find('.drag_txt').hide();
		    	eval("$mul_images_"+index).find('.qq-upload-list').css('z-index','0');
	            eval("$mul_images_"+index).find('.qq-upload-list').show();
		    },
		    onComplete: function(id, name, response){
		    	if(response.success){
		    		mul_image_path[index] = CONFIG.APP_API_DOMAIN+response.filename;
		    		eval("$mul_images_"+index).find('.qq-upload-fail').remove();
		    		eval("$mul_images_"+index).find('.qq-upload-success').hide();
		    		eval("$mul_images_"+index).find('.qq-upload-drop-area').css('display','block');
		    		eval("$mul_images_"+index).find('.qq-upload-drop-area').html('<div class="drag_img"><img src="'+mul_image_path[index]+'" class="img-thumbnail"/></div>');
		    		eval("$mul_images_"+index).find('.qq-upload-list').append("<li><input type='hidden' name='org_name[]' value='" + response.org_name + "' /><input type='hidden' value='" + response.filename + "' name='photos[]'/></li>").show();
		    		eval("$mul_images_"+index).find('.drag_img').append("<div class='overlay'></div><i class='fa fa-trash-o icon-trash' onclick='angular.element(this).scope().editCompCtrl.trash("+index+",true)'></i>");
		    	}
		    },
		    showMessage: function(msg){
		    	for(var i = 0; i < 4; i++){
		    		eval("$mul_images_"+i).find('.qq-upload-fail').remove();
		    	}
		    	eval("$mul_images_"+index).find('.qq-uploader').append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>"+msg+"</span></div>")
		    }

		});
	}

	// Referral Bonus upload
	var uploader = new qq.FileUploader({
	    element: document.getElementById('referral-bonus'),
	    dragText: "",
		uploadButtonText: "Upload a file",
	    multiple : false,
	    sizeLimit: (10*1024*1024),
		allowedExtensions: ['csv','pdf','doc','docx'],
	    action: CONFIG.APP_DOMAIN+'file_upload',

	    onSubmit: function(id, name){
	    	scope.update = true;
	    	$scope.$apply();
	    	$referral_bonus.find('.drag_txt').hide();
	    	$referral_bonus.find('.qq-upload-button').hide();
            $referral_bonus.find('.qq-upload-list').show();
            $referral_bonus.find('.qq-upload-list').css('z-index','0');
	    },
	    onComplete: function(id, name, response){
	    	if(response.success){
	    		bonus_file_path = CONFIG.APP_API_DOMAIN+response.filename;
	    		$referral_bonus.find('.qq-upload-fail').remove();
	    		$referral_bonus.find('.qq-upload-success').hide();
	    		$referral_bonus.find('.qq-upload-list').css('z-index','-1');
	    		$referral_bonus.find('.qq-upload-drop-area').css('display','block');
	    		$referral_bonus.find('.qq-upload-list').append("<li><input type='hidden' name='referral_org_name' value='" + response.org_name + "' /><input type='hidden' value='" + response.filename + "' name='referral_bonus_file'/></li>").show();
	    		$referral_bonus.find('.qq-upload-drop-area').html('<div class="drag_img"><a href="'+bonus_file_path+'" class="view"><img src="public/images/Applied.svg"><p>'+response.org_name+'&nbsp;</p></a>');
	    		$referral_bonus.find('.drag_img').append('<a href="'+bonus_file_path+'&embedded=true" download class="download"><img src="public/images/material_icons/download.svg"></a><img src="public/images/material_icons/circle-close.svg" onclick="angular.element(this).scope().editCompCtrl.trash(-2,true)" style="margin-top:-4px">');
	    	}
	    	else{
	    		$referral_bonus.find('.qq-upload-button').show();
	    		$referral_bonus.find('.qq-upload-fail').remove();
	    		$referral_bonus.append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>"+response.msg+"</span></div>");
	    	}
	    },
	    showMessage: function(msg){
	    	$referral_bonus.find('.qq-upload-fail').remove();
	    	$referral_bonus.append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>"+msg+"</span></div>");
	    }
	});

	

}])



}());