(function () {
"use strict";

angular.module('app.emails', [])

.controller('EmailVerificationController', ['$state',function ($state) {
 	this.continue = function(){
 		$state.go('companyProfile');
 	}
}])
    
}());