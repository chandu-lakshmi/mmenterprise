(function () {
"use strict";

angular.module('app.edit.company', [])


.controller('editCompanyProfileController', ['$http', 'CONFIG', function($http, CONFIG){

	var scope = this,$banner_logo_wrap_el,bol = 1;
    var image_path = '',image_name = '',mul_image_path = [];


    var $company_logo = $('#company-logo');


	$('.edit-company').addClass('text-selection');
	$('form').css('pointer-events','none');


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


	// view company details function
	function getCompanyDetails(){
		var view_company_details = $http({
	        headers: {
	           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	        },
	        method: 'POST',
	        url: CONFIG.APP_DOMAIN+'view_company_details'
	    })

	    view_company_details.success(function(response){
    		scope.errCond = false;
    		$('form').css('pointer-events','none');
    		if(response.data.length != 0){
    			bol = 1;
	       		scope.company_details = response.data.companyDetails;
	       		if(scope.company_details.company_logo.length != 0){
	       			$company_logo.find('.drag_txt').hide();
            		$company_logo.find('.qq-upload-list').show();
	       			$company_logo.find('.qq-upload-success').hide();
	    			$company_logo.find('.qq-upload-drop-area').css('display','block');
	    			$company_logo.find('.qq-upload-drop-area').html('<div class="drag_img"><img src="'+scope.company_details.company_logo+'" class="img-thumbnail"/></div>');
	    			$company_logo.find('.qq-upload-list li').remove();
	    			$company_logo.find('.qq-upload-list').append("<li><input type='hidden' name='org_name' value='" + scope.company_details.company_logo.split('/').pop() + "' /><input type='hidden' value='" + scope.company_details.company_logo + "' name='logo_image'/></li>").show();
	    			$company_logo.find('.drag_img').append('<div class="overlay"></div><i class="fa fa-trash-o icon-trash" onclick="angular.element(this).scope().editCompCtrl.trash(-1)"></i>');
	       		}
	       		if(scope.company_details.images.length > 0){
	       			initialCallback(scope.company_details.images.length)
	       		} 
    		}
    		else{
    			bol = 0;
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
		eval("$mul_images_"+i).find('.qq-upload-list').append("<li><input type='hidden' name='org_name["+i+"]' value='" + scope.company_details.images[i].split('/').pop() + "' /><input type='hidden' value='" + scope.company_details.images[i] + "' name='photos["+i+"]'/></li>").show();
		eval("$mul_images_"+i).find('.drag_img').append("<div class='overlay'></div><i class='fa fa-trash-o icon-trash' onclick='angular.element(this).scope().editCompCtrl.trash("+i+")'></i>");
	}

	scope.trash = function(value){
		if(value == '-1'){
			$company_logo.find('.drag_img').find('img').removeAttr('src');
			$company_logo.find('.qq-upload-list li').css('display','none');
			$company_logo.find('.qq-upload-list li').find('input[type=hidden]').eq(0).attr('value','');
			$company_logo.find('.qq-upload-list li').find('input[type=hidden]').eq(1).attr('value','');
			$company_logo.find('.qq-upload-drop-area').css('display','none');
			$company_logo.find('.qq-upload-drop-area .drag_img').remove();
		}
		else{
			eval("$mul_images_"+value).find('.drag_img').find('img').removeAttr('src');
			eval("$mul_images_"+value).find('.qq-upload-list li').css("display","none");
			eval("$mul_images_"+value).find('.qq-upload-list li').find('input[type=hidden]').eq(0).attr('value','');
			eval("$mul_images_"+value).find('.qq-upload-list li').find('input[type=hidden]').eq(1).attr('value','');
			eval("$mul_images_"+value).find('.qq-upload-drop-area').css('display','none');
			eval("$mul_images_"+value).find('.qq-upload-drop-area .drag_img').remove();
		}
	}


	// button conditions(edit,update,cancel)
	this.update = false;
	this.edit = function(text){
		if(text == 'write'){
			$('.edit-company').removeClass('text-selection');
			scope.errCond = false;
			scope.update = true;
			$('form').css('pointer-events','auto');
			if(bol == 1){
				$('form:first input:first').attr('readonly','readonly');
			}
			$('form:first input:first').focus();
		}
		else{
			$('.edit-company').addClass('text-selection');
			scope.update = false;
			scope.errCond = false;
			$('form').css('pointer-events','none');
		}
	}

	scope.errCond = false;
	scope.updateLoader = false;
	this.update_company = function(isValid){

		if(!isValid){
			scope.errCond = true;
		}
		else{

			var param = $(' form[name="edit_company_form"]').serialize();

			scope.errCond = false;
			scope.updateLoader = true;
			
			var update_company = $http({
	            headers: {
	                "content-type": 'application/x-www-form-urlencoded'
	            },
	            method : 'POST',
	            url : CONFIG.APP_DOMAIN+'update_company',
	            data : param
	        });

	        update_company.success(function(response){
	        	scope.update = false;
	        	scope.updateLoader = false;
	        	getCompanyDetails();
	        })
	        update_company.error(function(response){
	        	console.log(response)
	        })
		}
    }


    // Company logo
	var uploader = new qq.FileUploader({
	    element: document.getElementById('company-logo'),
	    dragText: "",
		uploadButtonText: "",
		multiple : false,
		size: (1*1024*1024),
		allowedExtensions: ["jpg", "jpeg", "png"],
	    action: CONFIG.APP_DOMAIN+'file_upload',

	    onSubmit: function(id, name){
	    	$company_logo.find('.drag_txt').hide();
            // $company_logo.find('.qq-upload-button').hide();
            $company_logo.find('.qq-upload-list').show();
	    },
	    onComplete: function(id, name, response){
	    	if(response.success){
	    		image_path = CONFIG.APP_API_DOMAIN+response.filename;
	    		$company_logo.find('.qq-upload-success').hide();
	    		$company_logo.find('.qq-upload-drop-area').css('display','block');
	    		$company_logo.find('.qq-upload-drop-area').html('<div class="drag_img"><img src="'+image_path+'" class="img-thumbnail"/></div>');
	    		$company_logo.find('.qq-upload-list').append("<li><input type='hidden' name='org_name' value='" + response.org_name + "' /><input type='hidden' value='" + response.filename + "' name='logo_image'/></li>").show();
	    		$company_logo.find('.drag_img').append('<div class="overlay"></div><i class="fa fa-trash-o icon-trash" onclick="angular.element(this).scope().editCompCtrl.trash(-1)"></i>');
	    	}
	    },
	    showMessage: function(msg){
	    	console.log(msg)
	    }
	});

	// Multiple image upload
	setTimeout(function(){
		for(var i = 0; i < 4; i++){
			window["$mul_images_"+i] = $('.multiple-images').eq(i);
			calBack(i);
		}
	},100);

	function calBack(index){
		var uploader = new qq.FileUploader({
		    element: document.getElementsByClassName('multiple-images')[index],
			dragText: "",
			uploadButtonText: "",
		    multiple : false,
			size: (1*1024*1024),
			allowedExtensions: ["jpg", "jpeg", "png"],
		    action: CONFIG.APP_DOMAIN+'file_upload',

		    onSubmit: function(id, name){
		    	eval("$mul_images_"+index).find('.drag_txt').hide();
	            eval("$mul_images_"+index).find('.qq-upload-list').show();
		    },
		    onComplete: function(id, name, response){
		    	if(response.success){
		    		console.log(index)
		    		mul_image_path[index] = CONFIG.APP_API_DOMAIN+response.filename;
		    		eval("$mul_images_"+index).find('.qq-upload-success').hide();
		    		eval("$mul_images_"+index).find('.qq-upload-drop-area').css('display','block');
		    		eval("$mul_images_"+index).find('.qq-upload-drop-area').html('<div class="drag_img"><img src="'+mul_image_path[index]+'" class="img-thumbnail"/></div>');
		    		eval("$mul_images_"+index).find('.qq-upload-list').append("<li><input type='hidden' name='org_name["+index+"]' value='" + response.org_name + "' /><input type='hidden' value='" + response.filename + "' name='photos["+index+"]'/></li>").show();
		    		eval("$mul_images_"+index).find('.drag_img').append("<div class='overlay'></div><i class='fa fa-trash-o icon-trash' onclick='angular.element(this).scope().editCompCtrl.trash("+index+")'></i>");

		    	}
		    }

		});
	}

	// Referral Bonus upload
	var uploader = new qq.FileUploader({
	    element: document.getElementById('referral-bonus'),
	    action: '/server/upload'
	});

	

}])



}());