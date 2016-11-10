(function () {
"use strict";

angular.module('app.forgotPassword', [])

// password match directive
.directive('pwMatch', function () {
	return {
  		require: 'ngModel',
  		link: function (scope, elem, attrs, ctrl) {
    		var rePassword = '#' + attrs.pwMatch;

    		elem.add(rePassword).on('keyup', function () {
          		scope.$apply(function () {
            		var v = elem.val()===$(rePassword).val();
            		// alert(v);
            		ctrl.$setValidity('pwmatch', v);
          		});
    		});
  		}
	}
})

.controller('ForgotPassword',['$state', '$window', 'tokens', '$http', '$uibModal', 'CONFIG', function($state, $window, tokens, $http, $uibModal, CONFIG){
	
	var scope = this;

	this.forgot_submit = function(isValid){
		
		scope.forgot_show_error = false;

		if(!isValid){
			scope.forgot_show_error = true;
		}
		else{
			scope.load_cond_reset = true;
            var token;
            if(tokens.reset_token){
                token = tokens.reset_token;
                resetPassword(token, 'reset_password');
            }
            else if(tokens.set_token){
                token = tokens.set_token;
                resetPassword(token, 'set_password')
            }
        }
    }

    function resetPassword(code, url){
        var reset_params = $.param({
            password : scope.forgotPassword.new_password,
            password_confirmation : scope.forgotPassword.re_password,
            code : code
        })
        var resetPassword = $http({
            headers: {
               'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            method: 'POST',
            url: CONFIG.APP_DOMAIN + url,                               
            data: reset_params
        })

        resetPassword.success(function(response){
            scope.load_cond_reset = false;
            if(response.status_code == 200){
                $uibModal.open({
                    animation: true,
                    keyboard: false,
                    backdrop: 'static',
                    templateUrl: 'templates/dialogs/reset-success.phtml',
                    openedClass: "reset-pwd",
                });
            }
            else if(response.status_code == 403){
                scope.backendError = true;
                scope.backendMsg = response.message.msg[0];
            }
            else if(response.status_code == 400){
                $window.location = CONFIG.APP_DOMAIN + 'logout';
            }
        })
        resetPassword.error(function(response){
            scope.load_cond_reset = false;
            console.log(response)
        })
    }

	// cancel button
	this.forgot_cancel = function(){
		$state.go('home')
	}

    
}])


}());