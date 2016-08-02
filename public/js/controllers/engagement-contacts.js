(function () {
"use strict";

angular.module('app.engagement.contacts', [])

.filter('fileName', function() {
   return function(x) {
       var file_name = x.split("/").pop();
       console.log(file_name)
       return file_name;
   };
})

.controller('EngagementContactsController', [ '$http', 'jobDetails', '$uibModal', 'CONFIG', function($http,jobDetails,$uibModal,CONFIG){

	this.post_id = jobDetails.id
	this.job_title = jobDetails.job_title;

	var scope = this;

	/*this.fun_click = function(){
		if(this.referrals_show == true){
			this.referrals_show = false;
		}
		else{
			this.referrals_show = true;
		}
	}*/

	this.length_zero = false;

	this.referrals_load_cond = true;
	var referrals = $.param({
        post_id : jobDetails.id
    });

    var referralsList = $http({
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        method : 'POST',
        data : referrals,
        url : CONFIG.APP_DOMAIN+'job_referral_details',
    })
    referralsList.success(function(response){
    	if(response.status_code == 200){
    		if(response.data.length == 0){
    			scope.referrals_load_cond = false;
    			scope.length_zero = true;
    		}
    		else{
    			scope.referrals_load_cond = false;
    			scope.referrals = response.data.referrals;
    		}
    	}
    	
    })
    referralsList.error(function(response){
    	console.log(response);
    })


    scope.referral_status = function(status){

    	$uibModal.open({
            animation: false,
            backdrop: 'static',
            keyboard: false,
            templateUrl: 'templates/dialogs/referral_status.phtml',
            openedClass: "referral-status",
            resolve: {
                status_code : function(){
                	return status;
                }
            },
            controller: 'ReferralStatus',
            controllerAs: "refStatus"
        });
    }

}])

.controller('ReferralStatus',["$scope", "$uibModalInstance", "status_code", function($scope, $uibModalInstance, status_code){

	var scope = this;

	scope.accept = false;
	scope.decline = false;
	if(status_code == 1){
		scope.accept = true;
	}
	else{
		scope.decline = true
	}

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

        $uibModalInstance.dismiss('cancel');

    })
}])









}());