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

    // Forgot Password
    scope.forgot_show = function(){
        scope.signin_show = false;
        if(scope.dublicate_email == true){
            scope.dublicate_email = false;
        }
        scope.login_show_error = false;
        scope.forgotObj = {};
        scope.forgot_password_show = true;
    }
    scope.forgot_cancel = function(){
        if(scope.email_show_error == true){
            scope.email_show_error = false;
        }
        scope.forgot_password_show = false;
        scope.signin_show = true;
    }

    scope.email_show_error = false;
    scope.forgotPassword = function(isValid){
        if(!isValid){
            scope.email_show_error = true;
        }
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
            var email = scope.signup_form.s_email;
            var lower_email = email.toLowerCase();
            var data = $.param({
                fullname: scope.signup_form.s_fname,
                company: scope.signup_form.s_cname,
                emailid: lower_email,
                password: scope.signup_form.s_pass
            });

            var signup = $http({
                headers: {
                   'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: CONFIG.APP_DOMAIN+'create_user',                               
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
                    scope.invalid_new_user = response.message.emailid[0];
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
                password : scope.signin_form.l_pass
            });

            var signin = $http({
                headers: {
                   'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: CONFIG.APP_DOMAIN+'signin',
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
                else if(response.status_code == 403){
                    scope.dublicate_invalid = true;
                    scope.invalid_user = response.message.msg[0];
                }
            });

            signin.error(function(response){
                console.log("Failed signin");
            })
    	}
    }
    
}]);
    
}());


