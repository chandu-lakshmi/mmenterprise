(function () {
"use strict";

angular.module('app.engagement.contacts', [])

.filter('fileName', function() {
   return function(x) {
       var file_name = x.split("/").pop();
       return file_name;
   };
})

// ajax in factory method
.factory('ajaxService', function($http,$q,jobDetails,CONFIG) {
    var canceller;
    var ajaxService = {
        async: function(obj,status) {

            if(canceller){
                canceller.resolve();
            }

            canceller = $q.defer();

            var pramas = $.param({
                from_user : obj.from_user,
                referred_by : obj.referred_by,
                relation_count : obj.relation_count,
                post_id : jobDetails.id,
                status : status,
                referred_by_phone : obj.referred_by_phone
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

            return processJob;
        }
    }
    return ajaxService;

})


// For Navigation
.service('tabsName',function() {
    var tab_name = '';
})

.controller('EngagementContactsController', ['$window', '$http', '$q', 'jobDetails', '$uibModal', 'tabsName', 'ajaxData', 'ajaxService', 'CONFIG', function($window,$http,$q,jobDetails,$uibModal,tabsName,ajaxData,ajaxService,CONFIG){

	$window.scrollTo(0,0);

    this.subHeaderCount = ajaxData.getData();

    // tab cond based on navigation
    if(tabsName.tab_name == ''){
        this.tabCond = 'ALL';
    }
    else{
        this.tabCond = tabsName.tab_name;
    }
    

	this.post_id = jobDetails.id
	this.job_title = jobDetails.job_title;

	var scope = this,canceller;

    // for styling li's
	this.length_zero = false;

    this.referrals_load_cond = true;


    function  ajaxCall(status){

        scope.referrals = [];
        scope.length_zero = false;
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
                    if(status == 'PENDING'){
                        ajaxData.addProperty('pending_count','0');
                        scope.subHeaderCount.pending_count = 0;
                    }                    
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

    ajaxCall(tabsName.tab_name);

    scope.referralsCond = function(status){
        scope.tabCond = status;
        ajaxCall(status);
    }

    scope.referral_status = function(tabName,obj,status_code){
        if(status_code == 'accepted'){
            $('div.pointer').css({
                'pointerEvents' : 'none'
            })
            /* From Factory Service Dynamically */
            var ajax = ajaxService.async(obj,'ACCEPTED');
            ajax.success(function(response){
                if(response.status_code == 200){
                    ajaxCall(tabName)
                }
                else if(response.status_code == 400){
                    $window.location = CONFIG.APP_DOMAIN+'logout';
                }
            })
            ajax.error(function(response){
                console.log(response)
                $('div.pointer').css({
                    'pointerEvents' : 'auto'
                })
            })

        }
    	else{
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
                        referralObj.ajaxFunCall = ajaxCall;
                        return referralObj;
                    }
                },
                controller: 'ReferralStatus',
                controllerAs: "refStatus"
            });
        }
    }

}])

.controller('ReferralStatus',["$scope", "$uibModalInstance", "referralObj", "$http", "ajaxService", "CONFIG", function($scope, $uibModalInstance, referralObj, $http, ajaxService, CONFIG){

	var scope = this;

	scope.accept = false;
	scope.decline = false;

    scope.success_loader = false;

    this.referralStatus = function(status){

        scope.success_loader = true;


        $('.referral-status .modal-dialog').css({
            'pointerEvents' : 'none'
        })

        /* From Factory Service Dynamically */
        var processJob = ajaxService.async(referralObj,status);
        processJob.success(function(response){
            $('.referral-status .modal-dialog').css({
                'pointerEvents' : 'auto'
            });
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
            scope.success_loader = false;
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