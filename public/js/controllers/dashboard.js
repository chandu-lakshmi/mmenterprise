(function () {
"use strict";

angular.module('app.dashboard', [])


.controller('DashboardController', [ '$http', '$state', '$rootScope', function($http,$state,$rootScope){
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

.controller('HeaderController',['$rootScope', function($rootScope){
	this.user_name = $rootScope.client_name;
	this.logo = $rootScope.company_logo;
}])


.controller('FooterController',[function(){

}])







}());