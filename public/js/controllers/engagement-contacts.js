(function () {
"use strict";

angular.module('app.engagement.contacts', [])

.filter('fileName', function() {
   return function(x) {
       var file_name = x.split("/").pop();
       return file_name;
   };
})

.controller('EngagementContactsController', ['$window', '$rootScope', '$http', '$q', 'jobDetails', '$uibModal', 'CONFIG', function($window,$rootScope,$http,$q,jobDetails,$uibModal,CONFIG){

	$window.scrollTo(0,0);

	this.post_id = jobDetails.id
	this.job_title = jobDetails.job_title;

	var scope = this,canceller;

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

    $rootScope.ajaxCall = function(status){
        scope.referrals = [];
        scope.referrals_load_cond = true;

        if(canceller){
            canceller.resolve();
        }

        canceller = $q.defer();

        var referrals = $.param({
            post_id : jobDetails.id,
            status : status
        });

        var referralsList = $http({
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            method : 'POST',
            data : referrals,
            url : CONFIG.APP_DOMAIN+'job_referral_details',
            timeout : canceller.promise
        })
        referralsList.success(function(response){
        	if(response.status_code == 200){
        		if(response.data.length == 0){
        			scope.referrals_load_cond = false;
        			scope.length_zero = true;
        		}
        		else{
                    scope.length_zero = false;
        			scope.referrals_load_cond = false;
        			scope.referrals = response.data.referrals;
        		}
        	}
        	
        })
        referralsList.error(function(response){
        	console.log(response);
        })
    }
    $rootScope.ajaxCall('');

    scope.referralsCond = function(status){
        $rootScope.ajaxCall(status);
    }


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

.controller('ReferralStatus',["$scope", "$rootScope", "$uibModalInstance", "referralObj", "$http", "CONFIG", "jobDetails", function($scope, $rootScope, $uibModalInstance, referralObj, $http, CONFIG, jobDetails){

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
            if(response.status_code == 200){
                $rootScope.ajaxCall(referralObj.status);
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