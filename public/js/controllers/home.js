(function () {
"use strict";

angular.module('app.home', ['ngMaterial','ngMessages'])

.controller('HomeController', ['$state','$window', '$http', '$rootScope', 'CONFIG',function ($state,$window,$http,$rootScope,CONFIG) {    
    var scope = this;
    var signin_form = {};
    var signup_form = {};
   	scope.signup_show = false;
   	scope.signin_show = true;
    scope.default_signup = true;
    scope.default_signin = true;
    scope.verfication_show = false;
    scope.signup = function () {
        $window.scrollTo(0,0);
        scope.signin_show = false;
        if(scope.dublicate_email == true){
            scope.dublicate_email = false;
        }
        scope.login_show_error = false;
        scope.signup_show = true;
        scope.signup_form = {};
    }
    
    scope.signin = function () {
        $window.scrollTo(0,0);
        scope.signup_show = false;
        scope.verfication_show = false;
        scope.signup_show_error = false;
        if(scope.dublicate_invalid == true){
            scope.dublicate_invalid = false;
        }
        scope.signin_show = true;
        scope.signin_form = {};
    }

    /*  Signup Form Submit  */
    scope.dublicate_email = false;
    scope.signup_show_error = false;
    scope.submitSignupForm = function(isValid){

    	if(!isValid){
    		scope.signup_show_error = true;
    	}
    	else{
            scope.default_signup = false;
            scope.load_cond_signup = true;
            var data = $.param({
                    fullname: scope.signup_form.s_fname,
                    company: scope.signup_form.s_cname,
                    emailid: scope.signup_form.s_email,
                    password: scope.signup_form.s_pass
            });

            var signup = $http({
                headers: {
                   'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: CONFIG.APP_API_DOMAIN+CONFIG.APP_API_VERSION+'/enterprise/create_user',                               
                data: data
            })

            signup.success(function(response){
                scope.load_cond_signup = false;
                scope.default_signup = true;
                if(response.status_code == 200) {
                    scope.signup_show = false;
                    scope.verfication_show = true;
                }else if (response.status_code == 403) {
                    scope.dublicate_email = true;
                };
                
            })
            signup.error(function(response){
                console.log("Failed Registration")
            })
    	}
    }

    /*  Login Form Submit  */
    scope.dublicate_invalid = false;
    scope.login_show_error = false;
    scope.submitLoginForm = function(isValid){

    	if(!isValid){
    		scope.login_show_error = true;
    	}
    	else{
            scope.load_cond_signin = true;
            scope.default_signin = false;
            var data = $.param({
                    username : scope.signin_form.l_email,
                    password : scope.signin_form.l_pass,
                    client_id : CONFIG.CLIENT_ID,
                    client_secret : CONFIG.CLIENT_SECRET,
                    grant_type : 'password'
            });

            console.log(data)
            var signin = $http({
                headers: {
                   'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: CONFIG.APP_API_DOMAIN+CONFIG.APP_API_VERSION+'/enterprise/login',                               
                data: data
            })

            signin.success(function(response){
                scope.load_cond_signin = false;
                scope.default_signin = true;
                if(response.status_code == 200){
                    $rootScope.access_token = response.data.access_token;
                    $rootScope.refresh_token = response.data.refresh_token;
                    $state.go('app.dashboard');
                }
                else{
                    scope.dublicate_invalid = true;
                }
            });

            signin.error(function(response){
                console.log("Failed signin");
            })
    	}
    }
    
}]);
    
}());


