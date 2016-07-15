(function () {
"use strict";

angular.module('app.rewards', [])

.controller('RewardsController', [ '$http', function($http){
	
	var scope = this;
	
	$http({
		method:'get',
		url:'public/new-referrals.json'
	}).then(function(response){
		scope.rewards = response.data;
		console.log(scope.contacts);
	});

}]);



}());