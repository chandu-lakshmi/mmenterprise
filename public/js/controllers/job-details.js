(function () {
"use strict";

angular.module('app.job.details', [])

.service('ajaxData',function(){
	var responseData = {};

	var bol = false;

	this.setData = function(data){
		responseData = data;
	}

	this.getData = function(){
		return responseData;
	}

	this.addProperty = function(prop,value){
		responseData[prop] = value;
	}
})

.controller('JobDetailsController', ['$window', '$http', '$stateParams', 'jobDetails', 'ajaxData', 'CONFIG', function($window,$http,$stateParams,jobDetails,ajaxData,CONFIG){
	
	$window.scrollTo(0,0);

	var scope = this;

	this.post_id = jobDetails.id;
	
	if(!ajaxData.bol){
		this.job_details_loader = true;
		this.post_id = jobDetails.id;

		// Secific job details
		var post_details_params = $.param({
			id : scope.post_id
		})
		var post_details = $http({
	        headers: {
	            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	        },
	        method : 'POST',
	        data : post_details_params,
	        url : CONFIG.APP_DOMAIN+'job_details',
	    })

		post_details.success(function(response){
			scope.job_details_loader = false;
			scope.post_data = response.data.posts[0];
			ajaxData.setData(scope.post_data);
			ajaxData.bol = true;
			jobDetails.job_title = scope.post_data.job_title;
		})
		post_details.error(function(response){
			console.log(response);	
		})
	}
	else{
		scope.post_data = ajaxData.getData();
	}


 }]);


}());