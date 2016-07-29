(function () {
"use strict";

angular.module('app.dashboard', [])


.controller('DashboardController', [ '$http', '$state', 'UserDetails', function($http,$state,UserDetails){
	this.username = UserDetails.user_name;
	var scope = this;

	$http({
		method:'get',
		url:'public/new-referrals.json'
	}).then(function(response){
		scope.dashboard_JSON = response.data;
	});


	$('.circlestat').circliful();

}])

.controller('HeaderController',['UserDetails', 'CompanyDetails', '$http', 'CONFIG', function(UserDetails,CompanyDetails,$http,CONFIG){
	this.user_name = UserDetails.user_name;
	this.logo = CompanyDetails.company_logo;

	this.logout = function(){
		window.location.href = CONFIG.APP_DOMAIN+'logout';
	}
}])


.controller('FooterController',[function(){

}])







}());