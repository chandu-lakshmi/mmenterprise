(function () {
"use strict";

angular.module('app.rewards', [])

.controller('RewardsController', [ '$http', 'jobDetails', 'ajaxData', function($http,jobDetails,ajaxData){
	
	var scope = this;

	this.subHeaderCount = ajaxData.getData();
	
	this.post_id = jobDetails.id;
	this.job_title = jobDetails.job_title;

	$http({
		method:'get',
		url:'public/new-referrals.json'
	}).then(function(response){
		scope.rewards = response.data;
	});

}]);



}());