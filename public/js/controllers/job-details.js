(function () {
"use strict";

angular.module('app.job.details', [])

.controller('JobDetailsController', ['$http', '$stateParams', 'CONFIG', function($http,$stateParams,CONFIG){
	var scope = this;

	var post_id = $stateParams.post_id;

	// Secific job details
	var post_details_params = $.param({
		id : post_id
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
		scope.post_data = response.data.posts[0];
	})
	post_details.error(function(response){
		console.log(response);	
	})


 }]);


}());