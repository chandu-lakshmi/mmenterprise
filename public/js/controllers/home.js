(function () {
"use strict";

angular.module('app.home', ['ngMaterial','ngMessages'])

.controller('HomeController', ['$state','$window', '$http','CONFIG',function ($state,$window,$http, CONFIG) {    
    var scope = this;

   	scope.signup_show = false;
   	scope.signin_show = true;
    scope.default = true;
    scope.verfication_show = false;
    scope.signup = function () {
        $window.scrollTo(0,0);
        scope.signin_show = false;
        scope.signup_show = true;
        scope.login_show_error = false;
    }
    
    scope.signin = function () {
        $window.scrollTo(0,0);
        scope.signup_show = false;
        scope.signin_show = true;
        scope.verfication_show = false;
        scope.signup_show_error = false;
    }

    /*  Signup Form Submit  */
    scope.signup_show_error = false;
    scope.submitSignupForm = function(isValid){
    	// console.log(isValid)
    	if(!isValid){
    		scope.signup_show_error = true;
    	}
    	else{
            scope.load_cond = true;
            scope.default = false;
            var data = $.param({
                    fullname: scope.s_fname,
                    company: scope.s_cname,
                    emailid: scope.s_email,
                    password: scope.s_pass
            });

            
            var request = $http({
                headers: {
                   'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: CONFIG.APP_API_DOMAIN+CONFIG.APP_API_VERSION+'/enterprise/create_user',                               
                data: data
            })

            request.success(function(response){
                if(response.status_code == 200) {
                    scope.signup_show = false;
                    scope.verfication_show = true;
                    scope.default = true;
                    scope.load_cond = false;
                    //console.log("Successful Registration")
                }else if (response.status_code == 403) {
                    scope.dublicate_email = true;
                };
                
            })
            request.error(function(response){
                console.log("Failed Registration")
            })
            /*scope.signup_show = false;
            scope.verfication_show = true;*/
    		//$state.go('emailVerify');
    	}
    }

    /*  Login Form Submit  */
    scope.login_show_error = false;
    scope.submitLoginForm = function(isValid){
    	// console.log(isValid)
    	if(!isValid){
    		scope.login_show_error = true;
    	}
    	else{
    		$state.go('companyProfile');
    	}
    }
    
}]);
    
}());


