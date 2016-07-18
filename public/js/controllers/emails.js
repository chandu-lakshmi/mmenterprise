(function () {
"use strict";

angular.module('app.emails', [])

.controller('EmailVerificationController', ['$state','$stateParams','$http','CONFIG','$rootScope', '$window', function ($state,$stateParams,$http,CONFIG,$rootScope,$window) {

    this.loadCond = true;

		var scope = this;
		var tokenid = document.getElementById('token').value;        
		var data = $.param({
        token: tokenid
    });

    var email_verify = $http({
        headers: {
           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        method: 'POST',
        url: CONFIG.APP_DOMAIN+'verify_email',                               
        data: data
    })

    setTimeout(function(){
        
        email_verify.success(function(response){
            
        	if(response.status_code == 200){

                scope.loadCond = false;
                scope.already_verified = false;
                scope.verified = true;
                $rootScope.access_token = response.data.access_token;
                $rootScope.company_name = response.data.company.name;
                $rootScope.company_code = response.data.company.code;
                $rootScope.company_id = response.data.company.company_id;
                $rootScope.user_emailid = response.data.user.emailid;
                $rootScope.user_id = response.data.user.id;
                
                scope.continue = function(){
                    $window.scrollTo(0,0);
                    $window.scrollTo(0,0);
                    $state.go('companyProfile');
                }
            }
            else{
                scope.loadCond = false;
                scope.verified = false;
                scope.already_verified = true;
            }    
        })

        email_verify.error(function(response){
            console.log(response)
        })

    },2000);
    
    this.login = function(){
        $window.scrollTo(0,0);
        $state.go('home');
    }
}])
    
}());