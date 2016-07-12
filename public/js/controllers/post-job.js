(function () {
"use strict";

angular.module('app.post.job', ['ngAutocomplete'])

.service('gettingData',function(){
    var obj = {};

    this.getObj = function(){
        return obj;
    }

    this.setData = function(data){
        obj = data;
    }
})

.controller('PostJobController', ['$state','$window', '$http', '$scope', '$uibModal', 'gettingData', 'CONFIG', function($state,$window,$http,$scope,$uibModal,gettingData,CONFIG){

    this.geo_location = '';
    this.geo_options = null;
    this.geo_details = '';

	var scope = this;

    this.postJob1 = {};

    $scope.$watch(function() {
        return scope.geo_details;
    }, function(location) {
        if (location) {
            scope.postJob1.location = location.formatted_address;
            console.log(scope.postJob1.location)
        }
     });

	// Job Functions Dropdown
	var get_job_functions = $http({
		headers: {
           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        method: 'GET',
        url: CONFIG.APP_DOMAIN+'get_job_functions'
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
        url: CONFIG.APP_DOMAIN+'get_industries'
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
        url: CONFIG.APP_DOMAIN+'get_employment_types'
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
        url: CONFIG.APP_DOMAIN+'get_experiences'
    })
    get_experiences.success(function(response){
       scope.experience = response.data.experiences;
    })


    this.job_post_error = false;
    this.postJob = function(isValid){
      if(!isValid){
        this.job_post_error = true;
      }
      else{
        $window.scrollTo(0,0);
        gettingData.setData(scope.postJob1)
        console.log(scope.postJob1)
        $state.go('^.postJob2');
      }
    }



}])
.controller('PostJobTwoController', ['$uibModal', 'gettingData', function($uibModal,gettingData){

    this.post_job_result = gettingData.getObj();
    console.log(this.post_job_result)

	this.enable = function(a) {
		console.log(this)
	};
	this.requestSuccess =function  () {
        $uibModal.open({
            animation: false,
            templateUrl: 'templates/dialogs/post-success.phtml',
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