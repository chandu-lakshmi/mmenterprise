(function () {
"use strict";

angular.module('app.post.job', ['app.components', 'ngAutocomplete', 'angucomplete-alt'])

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

.controller('PostJobController', ['$state', '$timeout', '$window', '$http', '$scope', '$uibModal', 'gettingData', 'CompanyDetails', 'CONFIG', function($state, $timeout, $window,$http,$scope,$uibModal,gettingData,CompanyDetails,CONFIG){

  $window.scrollTo(0,0);

  this.geo_location = '';
  this.geo_options = null;
  this.geo_details = '';

	var scope = this;
  this.company_name = CompanyDetails.company_name;
  this.postJob1 = gettingData.getObj();

  // job title autocomplete
  this.getServices = function(userInputString, timeoutPromise){
    var services = [];
    //.post(CONFIG.APP_DOMAIN + 'get_services', {search : userInputString}, {timeout: timeoutPromise})
    return $http({
      headers: {
           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        method: 'POST',
        data: $.param({search: userInputString}),
        url: CONFIG.APP_DOMAIN + 'get_services',
        timeout: timeoutPromise
    })
    .then(function(response){
      services = response.data.data.services;
      return  {"data": services}
    })

      // $http({
      //   headers: {
      //      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      //   },
      //   method: 'POST',
      //   data: $.param({search: userInputString}),
      //   url: CONFIG.APP_DOMAIN + 'get_services'
      // })
      // .then(function(response){
      //   console.log(response)
      //   services = response.data.data.services;
      //   setTimeout(function(){return  {"data": services}},1000);
      //   /*angular.element('.disabled').css('pointer-events','auto');
      //   if(response.data.status_code == 200){
      //     scope.updateLoader = false;
      //     scope.message = true;
      //     setTimeout(function(){scope.message = false;$scope.$apply()},3000);
      //   }*/
      // },function(response){
      //   console.log(response)
      // })
  }



  // Autocomplete for job title
  /*var result = [];
  this.job_title_suggestion = function(input){
    $('#job_title').autocomplete({
      source: function( request, response ) {
        $.ajax( {
          type: 'POST',
          url: CONFIG.APP_DOMAIN+'get_services',
          data: {
            search: input
          },
          dataType: 'json',
          success: function( res ) {
            console.log(res.data)
            for(var i = 0; i < res.data.services.length; i++){
              //console.log(res.data.services[i].service_name)
              result.push(res.data.services[i].service_name)
            }
            response( result )
          }
        })
      },
      minLength: 3,
    });
  }*/
  

  /*scope.job_title_suggestion = function(key){
    $('#job_title').autocomplete({});
  }*/

  this.postJob1.country_code = '';
  this.postJob1.country_code = '';
  $scope.$watch(function() {
    return scope.geo_details;
  }, function(location) {
    if (location) {
      scope.postJob1.location = scope.geo_location;
      if(location.hasOwnProperty('address_components')){
        var obj = location.address_components;
        for(var i = 0;i < obj.length; i++){
          if(obj[i].types[0] == 'country'){
            scope.postJob1.country_code = obj[i].short_name;
          }
        }
      }
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
        if (!scope.postJob1.hasOwnProperty("requistion_id")) {
            scope.postJob1.requistion_id = '';
        }
        if(!scope.postJob1.hasOwnProperty("position_id")){
            scope.postJob1.position_id = '';   
        }
        gettingData.setData(scope.postJob1)
        $window.scrollTo(0,0);
        $state.go('^.postJob2');
      }
    }
    
    /*$scope.$watch('PtJobCtrl.postJob1.job_desc', function(){
        scope.jdCharCount = $('#toolbarCC span').text();
    });*/
        

}])


.controller('PostJobTwoController', ['$window', '$uibModal', 'gettingData', 'CompanyDetails', '$http', 'CONFIG', function($window, $uibModal, gettingData, CompanyDetails, $http, CONFIG){

    $window.scrollTo(0,0);
    this.company_name = CompanyDetails.company_name;
  
    gettingData.bol = true;
    this.buckLoader = true;

    this.post_job_result = gettingData.getObj();

    var scope = this;

      // getting bucket names dynamically
    var get_buckets = $http({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        method: 'POST',
        url: CONFIG.APP_DOMAIN+'buckets_list'
    })
    get_buckets.success(function(response){
        scope.bucket_names = response.data.buckets_list;
        scope.buckLoader = false;
    });
    get_buckets.error(function(response){
        console.log(response);
    })

    this.currencyInfo = [
        { id : 1, code : '$' },
        { id : 2, code : '₹' }
    ];

    this.code = '1';
    scope.discoveryRewards =  true;
    scope.discoveryRewardsType = 'free'
    this.reset = function(para){
        if(para == ""){
            scope.discoveryPoints = "";
            scope.discoveryCurrency = "";
            //scope.code = '1';
        }
        else if(para == "paid"){
            scope.discoveryPoints = "";
            scope.discoveryRewardsType = 'paid';
        }
        else{
            scope.discoveryCurrency = "";
            //scope.code = "1";
            scope.discoveryRewardsType = 'points';
        }
        scope.bolFormValid = false; 
    }

    this.code1 = '1';
    this.reset1 = function(para){
        if(para == ""){
            scope.referralPoints = "";
            scope.referralCurrency = "";
            //scope.code1 = '1';
        }
        else if(para == "paid"){
            scope.referralPoints = "";
            scope.referralRewardsType = 'paid';
        }
        else{
            scope.referralCurrency = "";
            //scope.code1 = "1";
            scope.referralRewardsType = 'points';
        }
        scope.bolForm2Valid = false;
    }

    this.toggleDiscoveryReward = function(bolChk){
        if(bolChk){
            scope.discoveryRewardsType = 'free';
        }
        else{
            scope.discoveryRewardsType = '';
            //scope.code = '1';
            scope.discoveryCurrency = '';
        }
        scope.userSelRewards = false; 
    }

    this.toggleReferralReward = function(bolChk){
        if(bolChk){
            scope.referralRewardsType = 'free';
        }
        else{
            scope.referralRewardsType = '';
            //scope.code1 = '1';
            scope.referralCurrency = '';
        }
        scope.userSelRewards = false; 
    }

    this.loader = 
    this.success_cond = 
    this.bolFormValid =  
    this.bolForm2Valid = 
    this.userSelOnebkt = 
    this.userSelRewards = false;
	this.requestSuccess =function (bolForm, bolForm2) {
      
        if (!bolForm || !bolForm2) {
            !bolForm ? scope.bolFormValid = true : '';
            !bolForm2 ? scope.bolForm2Valid = true : '';
            return false;     
        }

        var buckets = $('input[name="selectedBuckets"]').val();
        if (!buckets) {
            scope.userSelRewards = false;
            scope.userSelOnebkt = true;
            return false;    
        }
        else if($(".select-rewards input[type='checkbox']").serializeArray().length == 0) {
            scope.userSelOnebkt = false;
            scope.userSelRewards = true;
            return false;
        }

        var rewardsObj = [];
        function rewards(type, rewards_value){
            var obj =  {
                type : type,
                rewards_type : scope[type + 'RewardsType'],
                currency_type : scope[rewards_value],
                rewards_value : scope[type + 'Points'] || scope[type + 'Currency'] 
            }
            rewardsObj.push(obj);
        }

        if(scope.discoveryRewards){
            rewards('discovery', 'code');    
        }
        if(scope.referralRewards){
            //rewards('referral', 'code1');    
            rewards('referral', 'code');    
        }

        var freeJob;
        var disRwds = scope.discoveryRewardsType;
        var refReds = scope.referralRewardsType;
        if(disRwds == 'paid' ||  disRwds == 'points' || refReds == 'paid' || refReds == 'points' ) {
            freeJob = 0;
        }
        else{
            freeJob = 1;     
        }
        scope.bucket_error = false;
        scope.success_cond = true;
        scope.loader = true;
        var post_job = $.param({
            rewards : rewardsObj,
            country_code : scope.post_job_result.country_code,
            job_title : scope.post_job_result.job_title,
            location : scope.post_job_result.location,
            industry : scope.post_job_result.industry.industry_id,
            employment_type : scope.post_job_result.emp_type.employment_type_id,
            job_description : scope.post_job_result.job_desc,
            experience_range : scope.post_job_result.experience.experience_id,
            job_function : scope.post_job_result.job_func.job_function_id,
            post_type : scope.post_job_result.post_type,
            free_job : freeJob ,
            no_of_vacancies : scope.post_job_result.no_of_vacancies,
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
          url: CONFIG.APP_DOMAIN + 'post_job',                               
          data: post_job
        })

        post_job_api.success(function(response) {
          if(response.status_code == 200){
            scope.success_cond = false;
            scope.loader = false;
            gettingData.setData({});
            $uibModal.open({
              animation: false,
              keyboard: false,
              backdrop: 'static',
              templateUrl: 'templates/dialogs/post-success.phtml',
              openedClass: "posted-success",
              controller: 'SuccessController',
              controllerAs:"succCtrl"
            });
          }
          else if(response.status_code == 406){
            if(response.message.hasOwnProperty('bucket_id')){
              scope.success_cond = false;
              scope.loader = false;
              scope.bucket_error = true;
            }
          }
          else if(response.status_code == 400){
            $window.location = CONFIG.APP_DOMAIN + 'logout';
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