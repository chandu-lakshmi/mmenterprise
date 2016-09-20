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
			scope.post_data = response.data.posts[0];
			ajaxData.setData(scope.post_data);
			ajaxData.bol = true;
			jobDetails.job_title = scope.post_data.job_title;
		})
		post_details.error(function(response){
			console.log(response);	
		})
	}
	else{
		scope.post_data = ajaxData.getData();
	}

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
	$window.scrollTo(0, 0);
	var scope = this;

	this.success_loader = false;

	this.userConfirm = function(){
		$window.scrollTo(0, 0);
   		$state.go('app.job');	
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