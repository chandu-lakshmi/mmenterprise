(function () {
"use strict";

angular.module('app.home', ['ngMaterial','ngMessages'])

.controller('HomeController', ['$state','$window', '$http','CONFIG',function ($state,$window,$http, CONFIG) {    

   	this.signup_show = false;
   	this.signin_show = true;
    this.default = true;
    this.verfication_show = false;
    this.signup = function () {
        $window.scrollTo(0,0);
        this.signin_show = false;
        this.signup_show = true;
        this.login_show_error = false;
    }
    
    this.signin = function () {
        $window.scrollTo(0,0);
        this.signup_show = false;
        this.signin_show = true;
        this.verfication_show = false;
        this.signup_show_error = false;
    }

    /*  Signup Form Submit  */
    this.signup_show_error = false;
    this.submitSignupForm = function(isValid){
    	// console.log(isValid)
    	if(!isValid){
    		this.signup_show_error = true;
    	}
    	else{
            scope.load_cond = true;
            scope.default = false;
            var data = $.param({
                    fullname: this.s_fname,
                    company: this.s_cname,
                    emailid: this.s_email,
                    password: this.s_pass
            });

            var scope = this;
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
            /*this.signup_show = false;
            this.verfication_show = true;*/
    		//$state.go('emailVerify');
    	}
    }

    /*  Login Form Submit  */
    this.login_show_error = false;
    this.submitLoginForm = function(isValid){
    	// console.log(isValid)
    	if(!isValid){
    		this.login_show_error = true;
    	}
    	else{
    		$state.go('companyProfile');
    	}
    }
    
}]);
    
}());


