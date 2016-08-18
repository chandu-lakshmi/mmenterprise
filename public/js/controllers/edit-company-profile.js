(function () {
"use strict";

angular.module('app.edit.company', [])


.controller('editCompanyProfileController', ['$http', 'CONFIG', function($http, CONFIG){

	var scope = this,$company_logo;

	$('form input').attr('readonly', 'readonly');

	this.update = false;
	this.edit = function(text){
		if(text == 'write'){
			scope.update = true;
			scope.errCond = false;
			$('form input').removeAttr('readonly');
			$('form:first input:first').attr('readonly','readonly');
			$('form:first input:first').focus();
		}
		else if(text == 'cancel'){
			scope.update = false;
			scope.errCond = false;
			$('form input').attr('readonly', 'readonly');
		}
	}

	scope.errCond = false;
	this.update_company = function(isValid){

		if(!isValid){
			scope.errCond = true;
		}
		else{
			scope.errCond = false;
			var formData = new FormData();
	        formData.append('company',scope.company_details.name);
	        formData.append('industry',scope.company_details.industry);
	        formData.append('description',scope.company_details.description);
	        formData.append('number_of_employees',scope.company_details.number_of_employees);
	        formData.append('website',scope.company_details.website);
			

			var update_company = $http({
	            headers: {
	                'Content-Type' : undefined
	            },
	            method : 'POST',
	            url : CONFIG.APP_DOMAIN+'update_company',
	            data : formData
	        });

	        update_company.success(function(response){
	        	scope.update = false;
	        	getCompanyDetails();
	        })
	        update_company.error(function(response){
	        	console.log(response)
	        })
		}
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


	var uploader = new qq.FileUploader({
	    // pass the dom node (ex. $(selector)[0] for jQuery users)
	    element: document.getElementById('company-logo'),
	    dragText: "",
		uploadButtonText: "",
		size: (1*1024*1024),
		allowedExtensions: ["jpg", "jpeg", "png"],
	    // path to server-side upload script
	    action: '/server/upload',

	    onSubmit: function(id, name){
	    	console.log(id,name);
	    },
	    onComplete: function(id, name, response){

	    }
	    /*showMessage: function(msg, obj){
            console.log(msg,obj)
        },*/
	});

	setTimeout(function(){
		for(var i = 0; i < 4; i++){
			var uploader = new qq.FileUploader({
			    // pass the dom node (ex. $(selector)[0] for jQuery users)
			    element: document.getElementsByClassName('multiple-images')[i],
	    		dragText: "",
        		uploadButtonText: "",
			    // path to server-side upload script
			    action: '/server/upload'
			});
		}
	},100);

	var uploader = new qq.FileUploader({
	    // pass the dom node (ex. $(selector)[0] for jQuery users)
	    element: document.getElementById('referral-bonus'),
	    // path to server-side upload script
	    action: '/server/upload'
	});



	// view company details
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
    		$('form input').attr('readonly', 'readonly');
	       	scope.company_details = response.data.companyDetails[0]; 
	        
	    })
	    view_company_details.error(function(response){
	        console.log(response)
	    })
	}
	getCompanyDetails();
	

}])



}());