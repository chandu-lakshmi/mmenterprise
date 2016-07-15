(function () {
"use strict";

angular.module('app.dashboard', [])


.controller('DashboardController', [ '$http', '$state', function($http,$state){
	this.username = "Jennifer";
	
	var scope = this;

	$http({
		method:'get',
		url:'public/new-referrals.json'
	}).then(function(response){
		scope.dashboard_JSON = response.data;
	});


	$('.circlestat').circliful();

}])

.controller('HeaderController',[function(){

}])


.controller('FooterController',[function(){

}])







}());