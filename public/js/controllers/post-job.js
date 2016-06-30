(function () {
"use strict";

angular.module('app.post.job', [])

.controller('PostJobController', ['$state','$window', '$http', 'CONFIG', function($state,$window,$http,CONFIG){

	this.postJob2 = function(){
		$window.scrollTo(0,0);
		$state.go('^.postJob2');
	}

	var scope = this;
	// Job Functions Dropdown
	var get_job_functions = $http({
		headers: {
           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        method: 'GET',
        url: CONFIG.APP_API_DOMAIN+CONFIG.APP_API_VERSION+'/get_job_functions'
	})
	get_job_functions.success(function(response){
		scope.job_function = response.data.job_functions;
	})
	// Industries Dropdown
	var get_industries = $http({
        headers: {
           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        method: 'GET',
        url: CONFIG.APP_API_DOMAIN+CONFIG.APP_API_VERSION+'/get_industries'
    })

    get_industries.success(function(response){
       scope.industry = response.data.industries;
        
    })
    // Employement Type Dropdown
    var get_employment_types = $http({
        headers: {
           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        method: 'GET',
        url: CONFIG.APP_API_DOMAIN+CONFIG.APP_API_VERSION+'/get_employment_types'
    })

    get_employment_types.success(function(response){
       scope.employment_type = response.data.employmentTypes;    
    })
    // Experience Dropdown
    var get_experiences = $http({
        headers: {
           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        method: 'GET',
        url: CONFIG.APP_API_DOMAIN+CONFIG.APP_API_VERSION+'/get_experiences'
    })

    get_experiences.success(function(response){
       scope.experience = response.data.experiences;
    })



}])
.controller('PostJobTwoController', ['$uibModal', function($uibModal){
	this.enable = function(a) {
		console.log(this)
	};
	this.requestSuccess =function  () {
	   $uibModal.open({
       animation: false,
       templateUrl: 'public/templates/dialogs/post-success.html',
       openedClass: "import_verify",
       windowClass: "pop-cre",
       controller: 'SuccessController',
       controllerAs:"succCtrl"
    });
	}
}])
.controller('SuccessController',['$window', '$state', '$uibModalInstance', function ($window, $state, $uibModalInstance) {
  this.goDashBoard = function  () {
  	$window.scrollTo(0,0);
	$state.go('^.dashboard');
  }
  window.onhashchange = function() {
    $uibModalInstance.dismiss('cancel');
  }
}]);
}());