(function () {
"use strict";

angular.module('app.engagement.contacts', [])

.filter('fileName', function() {
   return function(x) {
       var file_name = x.split("/").pop();
       return file_name;
   };
})

.controller('EngagementContactsController', ['$window', '$http', '$q', 'jobDetails', '$uibModal', 'ajaxData', 'CONFIG', function($window,$http,$q,jobDetails,$uibModal,ajaxData,CONFIG){

	$window.scrollTo(0,0);

    this.subHeaderCount = ajaxData.getData();

	this.post_id = jobDetails.id
	this.job_title = jobDetails.job_title;

	var scope = this,canceller;

	this.length_zero = false;

    this.referrals_load_cond = true;


    function  ajaxCall(status){

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
                    var data = response.data.countDetails;
                    for(var i in data){
                        ajaxData.addProperty(i,data[i]);
                    }
                    scope.subHeaderCount = data;
        			scope.referrals = response.data.referrals;
                    scope.totals = response.data.count;
        		}
        	}
        	else if(response.status_code == 400){
                $window.location = CONFIG.APP_DOMAIN+'logout';
            }
        })
        referralsList.error(function(response){
        	console.log(response);
        })
    }

    ajaxCall('');

    scope.referralsCond = function(status){
        ajaxCall(status);
    }


    scope.referral_status = function(tabName,obj,status_code){
    	$uibModal.open({
            animation: false,
            backdrop: 'static',
            keyboard: false,
            templateUrl: 'templates/dialogs/referral_status.phtml',
            openedClass: "referral-status",
            resolve: {
                referralObj: function() {
                    var referralObj = obj;
                    referralObj.tabName = tabName;
                    referralObj.status_code = status_code;
                    referralObj.ajaxFunCall = ajaxCall;
                    return referralObj;
                }
            },
            controller: 'ReferralStatus',
            controllerAs: "refStatus"
        });
    }

}])

.controller('ReferralStatus',["$scope", "$q", "$uibModalInstance", "referralObj", "$http", "ajaxData", "CONFIG", "jobDetails", function($scope, $q, $uibModalInstance, referralObj, $http, ajaxData, CONFIG, jobDetails){

	var scope = this;

	scope.accept = false;
	scope.decline = false;

    scope.success_loader = false;

    console.log(referralObj)

	if(referralObj.status_code == 'accepted'){
		scope.accept = true;
	}
	else{
		scope.decline = true
	}

    var canceller;
    this.referralStatus = function(status){

        scope.success_loader = true;

        $('.referral-status .modal-dialog').css({
            'pointerEvents' : 'none'
        })

        if(canceller){
            canceller.resolve();
        }

        canceller = $q.defer();

        var pramas = $.param({
            from_user : referralObj.from_user,
            referred_by : referralObj.referred_by,
            relation_count : referralObj.relation_count,
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
            timeout : canceller.promise
        })
        processJob.success(function(response){

            $('.referral-status .modal-dialog').css({
                'pointerEvents' : 'auto'
            })

            scope.success_loader = false;
            if(response.status_code == 200){
                referralObj.ajaxFunCall(referralObj.tabName);
                $uibModalInstance.dismiss('cancel');
            }
            else if(response.status_code == 400){
                $window.location = CONFIG.APP_DOMAIN+'logout';
            }
        })
        processJob.error(function(response){
            console.log(response)

            $('.referral-status .modal-dialog').css({
                'pointerEvents' : 'auto'
            })
        })
    }

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

        $uibModalInstance.dismiss('cancel');

    })
}])









}());