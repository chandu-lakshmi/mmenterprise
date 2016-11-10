(function () {
"use strict";

angular.module('app.emails', [])

.controller('EmailVerificationController', ['$state', '$window', 'tokens', '$http', 'CONFIG', function ($state, $window, tokens, $http, CONFIG) {

    this.loadCond = true;

		var scope = this;

		var data = $.param({
            token: tokens.access_token
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
                
                scope.continue = function(){
                    $window.scrollTo(0,0);
                    $window.location = CONFIG.APP_DOMAIN+'company-profile';
                    //$state.go('companyProfile');
                }
            }
            else if(response.status_code == 400){
                $window.location = CONFIG.APP_DOMAIN + 'logout';
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