(function () {
"use strict";

angular.module('app.job.details', [])

.controller('JobDetailsController', ['$http', '$stateParams', 'jobDetails', 'CONFIG', function($http,$stateParams,jobDetails,CONFIG){
	var scope = this;

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
		jobDetails.job_title = scope.post_data.job_title;
	})
	post_details.error(function(response){
		console.log(response);	
	})


 }]);


}());