(function () {
"use strict";

angular.module('app.dashboard', [])


.controller('DashboardController', [ '$http', '$state', function($http,$state){
	this.username = "Jennifer";
	// $state.go('^.dashboard')
	var scope = this;

	$http({
			method:'get',
			url:'public/new-referrals.json'
		}).then(function(response){
			scope.dashboard_JSON = response.data;
		});


	$('.circlestat').circliful();

}])

.controller('HeaderController',['$location', '$rootScope', function($location,$rootScope){
	
	this.addClass = function(x){
		
		var current = 'actv_'+x;
		this[current] = true;

		if(x - 1 > 0)
			this['actv_' + ( x - 1 )] = false;
		if(x - 2 > 0)
			this['actv_' + ( x - 2 )] = false;
		if( x + 1 < 4)
			this['actv_' + ( x + 1 )] = false;
		if( x + 2 < 4)
			this['actv_' + ( x + 2 )] = false;
		// alert($location.path());
	}


}])


.controller('FooterController',[function(){

}])







}());