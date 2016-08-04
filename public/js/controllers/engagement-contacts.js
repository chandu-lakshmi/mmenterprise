(function () {
"use strict";

angular.module('app.engagement.contacts', [])

.filter('fileName', function() {
   return function(x) {
       var file_name = x.split("/").pop();
       return file_name;
   };
})

.controller('EngagementContactsController', ['$window', '$http', 'jobDetails', '$uibModal', 'CONFIG', function($window,$http,jobDetails,$uibModal,CONFIG){

	$window.scrollTo(0,0);

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


    scope.referral_status = function(obj,status_code){
    	$uibModal.open({
            animation: false,
            backdrop: 'static',
            keyboard: false,
            templateUrl: 'templates/dialogs/referral_status.phtml',
            openedClass: "referral-status",
            resolve: {
                referralObj: function() {
                    var referralObj = obj;
                    referralObj.status_code = status_code
                    return referralObj;
                }
            },
            controller: 'ReferralStatus',
            controllerAs: "refStatus"
        });
    }

}])

.controller('ReferralStatus',["$scope", "$uibModalInstance", "referralObj", "$http", "CONFIG", "jobDetails", function($scope, $uibModalInstance, referralObj, $http, CONFIG, jobDetails){

	var scope = this;
	scope.accept = false;
	scope.decline = false;
	if(referralObj.status_code == 'accepted'){
		scope.accept = true;
	}
	else{
		scope.decline = true
	}

    // function
    this.referralStatus = function(status){

        var pramas = $.param({
            from_user : referralObj.from_user,
            referred_by : referralObj.referred_by,
            post_id : jobDetails.id,
            status : status
        });

        var processJob = $http({
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            method : 'POST',
            data : pramas,
            url : CONFIG.APP_DOMAIN+'process_job',
        })
        processJob.success(function(response){
            console.log(response)
            if(response.status_code == 200){
                $uibModalInstance.dismiss('cancel');
            }
        })
        processJob.error(function(response){
            console.log(response)
        })
    }

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

        $uibModalInstance.dismiss('cancel');

    })
}])









}());