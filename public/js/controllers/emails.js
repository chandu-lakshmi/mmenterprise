(function () {
"use strict";

angular.module('app.emails', [])

.controller('EmailVerificationController', ['$state','$stateParams','$http','CONFIG','$rootScope', function ($state,$stateParams,$http,CONFIG,$rootScope) {
 	/*this.continue = function(){
 		$state.go('companyProfile');
 	}*/
        this.loadCond = true;

 		var scope = this;
 		var tokenid = $stateParams.token;
 		var data = $.param({
            token: tokenid
        });

        var request = $http({
            headers: {
               'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            method: 'POST',
            url: CONFIG.APP_API_DOMAIN+CONFIG.APP_API_VERSION+'/enterprise/verify_email',                               
            data: data
        })

        setTimeout(function(){
            request.success(function(response){
            	if(response.status == 1){
                    scope.loadCond = false;
                    scope.continue = function(){
                        $state.go('companyProfile');
                    }
                    $rootScope.user_id = response.id;
                }    
            })
            request.error(function(response){
                console.log(response)
            })
        },2000);
}])
    
}());