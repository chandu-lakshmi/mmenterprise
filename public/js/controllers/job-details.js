(function () {
"use strict";

angular.module('app.job.details', [])

.service('ajaxData',function(){
	var responseData = {};

	var bol = false;

	this.setData = function(data){
		responseData = data;
	}

	this.getData = function(){
		return responseData;
	}

	this.addProperty = function(prop,value){
		responseData[prop] = value;
	}
})

.controller('JobDetailsController', ['$scope', '$window', '$state', '$http', '$stateParams', 'jobDetails', 'tabsName', 'ajaxData', '$uibModal',  'CONFIG', function($scope, $window, $state, $http, $stateParams, jobDetails, tabsName, ajaxData, $uibModal, CONFIG){
	
	$window.scrollTo(0,0);

	var scope = this;

	tabsName.tab_name = '';

	this.post_id = jobDetails.id;
	
	if(!ajaxData.bol){
		this.job_details_loader = true;
		this.post_id = jobDetails.id;

		// Secific job details
		var post_details_params = $.param({
			id : scope.post_id
		})
		var post_details = $http({
	        headers: {
	            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	        },
	        method : 'POST',
	        data : post_details_params,
	        url : CONFIG.APP_DOMAIN + 'job_details',
	    })

		post_details.success(function(response){
			scope.job_details_loader = false;
			if(response.status_code == 200){
				scope.post_data = response.data.posts[0];
				scope.post_data.job_description = response.data.posts[0].job_description.replace(/(?:\r\n|\r|\n)/g, '<br />');
				scope.post_data.company_description = response.data.posts[0].company_description.replace(/(?:\r\n|\r|\n)/g, '<br />');
				ajaxData.setData(scope.post_data);
				ajaxData.bol = true;
				jobDetails.job_title = scope.post_data.job_title;
			}
			else if(response.status_code == 400){
				$window.location = CONFIG.APP_DOMAIN + 'logout';
			}
		})
		post_details.error(function(response){
			console.log(response);	
		})
	}
	else{
		scope.post_data = ajaxData.getData();
	}

	this.getRewardsView = function(rewards){
		if(rewards.rewards_type == 'paid'){
			return (rewards.currency_type == 1 ? '$' : '₹') + rewards.rewards_value + '/' + rewards.rewards_name;
		}
		else if(rewards.rewards_type=='points'){
			return rewards.rewards_value + ' Points' + '/' + rewards.rewards_name;
		}
		else{
			return 'Free';	
		}
	}
	
	// this.getRewardsView = function(rewards, rewardsType) {
	// 	for(var i=0; i < rewards.length;i++){
	// 		if(rewards[i].rewards_name == rewardsType){
	// 			if(rewards[i].rewards_type == 'paid'){
 //            		return  (rewards[i].currency_type == 1 ? '$' : '₹') + rewards[i].rewards_value + '/' + rewards[i].rewards_name;
	//         	}
	//         	else if(rewards[i].rewards_type == 'points'){
	//         		return  rewards[i].rewards_value + ' Points' + '/' + rewards[i].rewards_name;	
	//         	}
	// 		}
	// 	}
	// }

	this.closeJob = function() {
		$uibModal.open({
            animation: false,
            backdrop: 'static',
            keyboard: false,
            templateUrl: 'templates/dialogs/confirm-message.phtml',
            openedClass: "referral-status confirm-message",
            resolve: {
	            jobParam: function() {
	                return jobDetails.id;
	            }
            },
            controller: 'ConfirmMessage',
            controllerAs: 'ConfirmMsgCtrl'
        });
	}

 }])


.controller('ConfirmMessage',["$scope", "$uibModalInstance", "jobParam", '$window', '$http', '$state', 'CONFIG',   function($scope, $uibModalInstance, jobParam, $window, $http, $state, CONFIG){
	
	var scope = this;

	this.defaultTemplate = true;
	this.pendingReferralsTemplate = false;
	this.success_loader = false;

	this.userConfirm = function(){
		
		scope.success_loader = true;

		var closeJobId = $.param({
			post_id : jobParam
		})

		var closeJob = $http({
	        headers: {
	            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	        },
	        method : 'POST',
	        data : closeJobId,
	        url : CONFIG.APP_DOMAIN + 'deactivate_post',
	    })

		closeJob.success(function(response){
			if(response.status_code == 200){
				$state.go('app.job');
				$window.scrollTo(0, 0);			
			}
			else if(response.status_code == 406){
				scope.defaultTemplate = false;
				scope.pendingReferralsTemplate = true;
			}
			else if(response.status_code == 400){
				$window.location = CONFIG.APP_DOMAIN + 'logout';
			}
		})
		closeJob.error(function(response){
			console.log(response);	
		})
	}

	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        $uibModalInstance.dismiss('cancel');
    })

}]);


}());