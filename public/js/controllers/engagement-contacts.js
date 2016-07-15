(function () {
"use strict";

angular.module('app.engagement.contacts', [])

.controller('EngagementContactsController', [ '$http', function($http){

	this.fun_click = function(){
		if(this.referrals_show == true){
			this.referrals_show = false;
		}
		else{
			this.referrals_show = true;
		}
	}

	var scope = this;

	$http({
		method:'get',
		url:'public/new-referrals.json'
	}).then(function(response){
		scope.contacts = response.data;
		// console.log(scope.contacts);
	});

}]);








}());