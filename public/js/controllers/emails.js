(function () {
"use strict";

angular.module('app.emails', [])

.controller('EmailVerificationController', ['$state','$stateParams','$http','CONFIG','$rootScope', function ($state,$stateParams,$http,CONFIG,$rootScope) {

        this.loadCond = true;

 		var scope = this;
 		var tokenid = $stateParams.token;
 		var data = $.param({
            token: tokenid,
            client_id : CONFIG.CLIENT_ID,
            client_secret : CONFIG.CLIENT_SECRET
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
                
            	if(response.status_code == 200){

                    scope.loadCond = false;
                    scope.verified = false;
                    scope.already_verified = true;
                    $rootScope.access_token = response.data.access_token;
                    $rootScope.company_name = response.data.company.name;
                    $rootScope.company_code = response.data.company.code;
                    $rootScope.user_emailid = response.data.user.emailid;
                    $rootScope.user_id = response.data.user.id;
       
                    scope.continue = function(){
                        $state.go('companyProfile');
                    }
                }
                else{
                    scope.loadCond = false;
                    scope.verified = false;
                    scope.already_verified = true;
                }    
            })
            request.error(function(response){
                console.log(response)
            })
        },2000);
}])
    
}());