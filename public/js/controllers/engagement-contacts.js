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

.controller('EngagementContactsController', ['$window', '$http', '$q', 'jobDetails', '$uibModal', 'tabsName', 'ajaxData', 'ajaxService', 'UserDetails', 'CONFIG', function($window,$http,$q,jobDetails,$uibModal,tabsName,ajaxData,ajaxService,UserDetails,CONFIG){

	$window.scrollTo(0,0);

    this.clientName = UserDetails.user_name;

    var className;

    this.subHeaderCount = ajaxData.getData();

    // tab cond based on navigation
    if(tabsName.tab_name == ''){
        this.tabCond = 'ALL';
    }
    else{
        this.tabCond = tabsName.tab_name;
    }
    

	this.post_id = jobDetails.id;
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
                    if(status == 'ACCEPTED'){
                        awaitingStatusCall(scope.referrals);
                    }
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
        if(status == 'ALL'){
            ajaxCall('')
        }
        else{
            ajaxCall(status);
        }
    }

    // process function
    var status_arr = ["accept","interviewed","offermade","hired"];
    var interviewed = ['accept'],offermade = ['accept','interviewed'],hired = ['accept','interviewed','offermade'];

    // initial disable unwanted clicks action
    function awaitingStatusCall(obj){
        setTimeout(function(){
           for(var i = 0; i < obj.length; i++){
                if(obj[i].awaiting_action_status == 'INTERVIEWED'){
                    $('.interviewed').eq(i).css('pointerEvents','none');
                    for(var j in interviewed){
                        $('.'+interviewed[j]).eq(i).removeClass('bg-accepted');
                        $('.'+interviewed[j]).eq(i).css('pointerEvents','none');
                    }
                }
                if(obj[i].awaiting_action_status == 'OFFERMADE'){
                    console.log(obj[i].awaiting_action_status)
                    $('.offermade').eq(i).css('pointerEvents','none');
                    for(var j in offermade){
                        $('.'+offermade[j]).eq(i).removeClass('bg-accepted');
                        $('.'+offermade[j]).eq(i).css('pointerEvents','none');
                    }
                }
                if(obj[i].awaiting_action_status == 'HIRED'){
                    $('.hired').eq(i).css('pointerEvents','none');
                    for(var j in hired){
                        $('.'+hired[j]).eq(i).removeClass('bg-accepted');
                        $('.'+hired[j]).eq(i).css('pointerEvents','none');
                    }
                }
            } 
        },100)
            
    }

    var canceller;
    scope.process_status = function(status,index){

        if(canceller){
            canceller.resolve();
        }

        canceller = $q.defer();
        var statusData = $.param({
            from_user : scope.referrals[index].from_user,
            referred_by : scope.referrals[index].referred_by,
            post_id : jobDetails.id,
            awaiting_action_status : status,
            relation_count : scope.referrals[index].relation_count,
            referred_by_phone : scope.referrals[index].referred_by_phone
        })

        var awaitingStatus = $http({
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            method : 'POST',
            data : statusData,
            url : CONFIG.APP_DOMAIN+'awaiting_action',
            timeout : canceller.promise
        })

        awaitingStatus.success(function(response){
            if(response.status_code == 200){
                ajaxData.addProperty('hired_count',response.data.hired_count);
                scope.subHeaderCount.hired_count = response.data.hired_count;
                if(response.data.awaiting_action_status == 'INTERVIEWED'){
                    className = response.data.awaiting_action_status.toLowerCase();
                    $('.status_details').eq(index).find('span').remove();
                    $('.status_details').eq(index).append('<span>Status changed to '+className+' by '+response.data.awaiting_action_by+' at '+response.data.awaiting_action_updated_at+'</span>');
                    $('.'+className).eq(index).addClass('bg-accepted');
                    $('.'+className).eq(index).css('pointerEvents','none');
                    for(var i in interviewed){
                        $('.'+interviewed[i]).eq(index).removeClass('bg-accepted');
                        $('.'+interviewed[i]).eq(index).css('pointerEvents','none');
                    }
                }
                if(status == 'OFFERMADE'){
                    className = response.data.awaiting_action_status.toLowerCase();
                    $('.status_details').eq(index).find('span').remove();
                    $('.status_details').eq(index).append('<span>Status changed to '+className+' by '+response.data.awaiting_action_by+' at '+response.data.awaiting_action_updated_at+'</span>');
                    $('.'+className).eq(index).addClass('bg-accepted');
                    $('.'+className).eq(index).css('pointerEvents','none');
                    for(var i in offermade){
                        $('.'+offermade[i]).eq(index).removeClass('bg-accepted');
                        $('.'+offermade[i]).eq(index).css('pointerEvents','none');
                    }
                }
                if(status == 'HIRED'){
                    className = response.data.awaiting_action_status.toLowerCase();
                    $('.status_details').eq(index).find('span').remove();
                    $('.status_details').eq(index).append('<span>Status changed to '+className+' by '+response.data.awaiting_action_by+' at '+response.data.awaiting_action_updated_at+'</span>');
                    $('.'+className).eq(index).addClass('bg-accepted');
                    $('.'+className).eq(index).css('pointerEvents','none');
                    for(var i in hired){
                        $('.'+hired[i]).eq(index).removeClass('bg-accepted');
                        $('.'+hired[i]).eq(index).css('pointerEvents','none');
                    }
                } 
            }
            else if(response.status_code == 400){
                $window.location = CONFIG.APP_DOMAIN+'logout';
            }

        })
        awaitingStatus.error(function(response){
            console.log(response)
        })
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