(function () {
"use strict";

angular.module('app.post.job', ['ngAutocomplete'])

.service('gettingData',function(){
    var obj = {};

    var bol = false;
    this.getObj = function(){
        return obj;
    }

    this.setData = function(data){
        obj = data;
    }
})

.controller('PostJobController', ['$state','$window', '$http', '$scope', '$uibModal', 'gettingData', 'CompanyDetails', 'CONFIG', function($state,$window,$http,$scope,$uibModal,gettingData,CompanyDetails,CONFIG){

  this.geo_location = '';
  this.geo_options = null;
  this.geo_details = '';

	var scope = this;
  this.company_name = CompanyDetails.company_name;
  this.postJob1 = gettingData.getObj();
  
  scope.postJob1.location = '';

  $scope.$watch(function() {
    return scope.geo_details;
  }, function(location) {
    if (location) {
      scope.postJob1.location = location.formatted_address;
      // console.log(scope.postJob1.location)
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
    if(gettingData.bol){
      scope.postJob1.job_func = scope.job_function[scope.postJob1.job_func.job_function_id - 1];
    }
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
       scope.industry_list = response.data.industries;
        if(gettingData.bol){
          scope.postJob1.industry = scope.industry_list[scope.postJob1.industry.industry_id - 1];
        }
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
       if(gettingData.bol){
          scope.postJob1.emp_type = scope.employment_type[scope.postJob1.emp_type.employment_type_id - 1];
        }    
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
       if(gettingData.bol){
          scope.postJob1.experience = scope.experience[scope.postJob1.experience.experience_id - 1];
        }
    })


    this.job_post_error = false;
    this.postJob = function(isValid){
      if(!isValid){
        this.job_post_error = true;
      }
      else{
        gettingData.setData(scope.postJob1)
        $window.scrollTo(0,0);
        $state.go('^.postJob2');
      }
    }

}])


.controller('PostJobTwoController', ['$uibModal', 'gettingData', 'CompanyDetails', '$http', 'CONFIG', function($uibModal,gettingData,CompanyDetails,$http,CONFIG){

  this.company_name = CompanyDetails.company_name;
  
  gettingData.bol = true;
  this.buckLoader = true;
  var bucketColor = ["#229A77", "#21A4AC", "#EE8F3B", "#2A99E0", "#154c50", "#103954", "#342158", "#5B5B29", "#004D40", "#3e110d"];
  var bucketColor = ["#229A77", "#21A4AC", "#EE8F3B", "#2A99E0", "#154c50", "#103954", "#342158", "#5B5B29", "#004D40", "#6f2b25"];
  
  this.getColor = function(ind) {
    return bucketColor[String(ind).slice(-1)];
  }

  this.rewards = [
    {'pay_status':'free','amount':'0','message':'just a thank you','currency':'DLR','pay_fee':'1'},
    {'pay_status':'pay','amount':'10','message':'per referral','currency':'DLR','pay_fee':'0'},
    {'pay_status':'pay','amount':'20','message':'per referral','currency':'DLR','pay_fee':'0'},
    {'pay_status':'pay','amount':'50','message':'per referral','currency':'DLR','pay_fee':'0'},
    {'pay_status':'pay','amount':'100','message':'per referral','currency':'DLR','pay_fee':'0'},
    {'pay_status':'pay','amount':'500','message':'per referral','currency':'DLR','pay_fee':'0'}
  ]

  this.post_job_result = gettingData.getObj();
  //console.log(this.post_job_result)

  var scope = this;

  /*this.payCond = function(){
    if(scope.rewardCond.pay_status == "free"){
      scope.pay_fee = 0; 
    }
    else{
      scope.pay_fee = 1;
    }
    scope.amount = scope.rewardCond.amount;
    scope.currency = scope.rewardCond.currency;
  }*/

  // getting bucket names dynamically
  var get_buckets = $http({
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    method: 'POST',
    url: CONFIG.APP_DOMAIN+'buckets_list'
  })
  get_buckets.success(function(response){
    scope.bucket_names = response.data;
    scope.buckLoader = false;
  });
  get_buckets.error(function(response){
    console.log(response);
  })

  var bucket_count = [];

  this.getDataUpdate = function(src,ind,bucketId){
    if(src == "public/images/add.svg"){
      bucket_count.push(bucketId);
      scope.bucket_names[ind].src = "public/images/select.svg";
    }
    else{
      var index = bucket_count.indexOf(bucketId);
      bucket_count.splice(index,1);
      scope.bucket_names[ind].src="public/images/add.svg";
    }
  }

  scope.success_cond = false;
	this.requestSuccess =function  () {
    scope.bucket_error = false;
    var buckets = bucket_count.toString();
    scope.success_cond = true;
    scope.loader = true;


    var post_job = $.param({
      //access_token : $rootScope.access_token,
      job_title : scope.post_job_result.job_title,
      location : scope.post_job_result.location,
      industry : scope.post_job_result.industry.industry_id,
      employment_type : scope.post_job_result.emp_type.employment_type_id,
      job_description : scope.post_job_result.job_desc,
      experience_range : scope.post_job_result.experience.experience_id,
      //company_name : $rootScope.company_name,
      //company_code : $rootScope.company_code,
      job_function : scope.post_job_result.job_func.job_function_id,
      free_job : scope.rewardCond.pay_fee,
      job_currency : scope.rewardCond.currency,
      job_cost : scope.rewardCond.amount,
      job_period : 'immediate', 
      bucket_id : buckets,
      position_id : scope.post_job_result.position_id,
      requistion_id : scope.post_job_result.requistion_id,
      job_type : 'global'
    })

    var post_job_api = $http({
      headers: {
         'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      method: 'POST',
      url: CONFIG.APP_DOMAIN+'post_job',                               
      data: post_job
    })

    post_job_api.success(function(response){
      if(response.status_code == 200){
        scope.success_cond = false;
        scope.loader = false;
        gettingData.setData({});
        $uibModal.open({
          animation: false,
          keyboard: false,
          backdrop: 'static',
          templateUrl: 'templates/dialogs/post-success.phtml',
          openedClass: "import_verify",
          windowClass: "pop-cre",
          controller: 'SuccessController',
          controllerAs:"succCtrl"
        });
      }
      if(response.status_code == 406){
        if(response.message.hasOwnProperty('bucket_id')){
          scope.success_cond = false;
          scope.loader = false;
          scope.bucket_error = true;
        }
      }
    })

    post_job_api.error(function(response){
      scope.success_cond = false;
      console.log(response)
    })

	}


}])

.controller('SuccessController',['$scope', '$window', '$state', '$uibModalInstance', 'gettingData', function ($scope, $window, $state, $uibModalInstance, gettingData) {
  
  this.goDashBoard = function  () {
    
    $window.scrollTo(0,0);
	  $state.go('^.job');
  }

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    gettingData.bol = false;
    gettingData.setData({});
    $uibModalInstance.dismiss('cancel');
  })

}]);


}());