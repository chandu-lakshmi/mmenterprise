(function () {
"use strict";

angular.module('app.post.job', ['ngAutocomplete', 'angucomplete-alt'])

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


/*$scope.countries = [
      {name: 'Afghanistan', code: 'AF'},
      {name: 'Aland Islands', code: 'AX'},
      {name: 'Albania', code: 'AL'},
      {name: 'Algeria', code: 'DZ'},
      {name: 'American Samoa', code: 'AS'},
      {name: 'AndorrA', code: 'AD'},
      {name: 'Angola', code: 'AO'},
      {name: 'Anguilla', code: 'AI'},
      {name: 'Antarctica', code: 'AQ'},
      {name: 'Antigua and Barbuda', code: 'AG'},
      {name: 'Argentina', code: 'AR'},
      {name: 'Armenia', code: 'AM'},
      {name: 'Aruba', code: 'AW'},
      {name: 'Australia', code: 'AU'},
      {name: 'Austria', code: 'AT'},
      {name: 'Azerbaijan', code: 'AZ'},
      {name: 'Bahamas', code: 'BS'},
      {name: 'Bahrain', code: 'BH'},
      {name: 'Bangladesh', code: 'BD'},
      {name: 'Barbados', code: 'BB'},
      {name: 'Belarus', code: 'BY'},
      {name: 'Belgium', code: 'BE'},
      {name: 'Belize', code: 'BZ'},
      {name: 'Benin', code: 'BJ'},
      {name: 'Bermuda', code: 'BM'},
      {name: 'Bhutan', code: 'BT'},
      {name: 'Bolivia', code: 'BO'},
      {name: 'Bosnia and Herzegovina', code: 'BA'},
      {name: 'Botswana', code: 'BW'},
      {name: 'Bouvet Island', code: 'BV'},
      {name: 'Brazil', code: 'BR'},
      {name: 'British Indian Ocean Territory', code: 'IO'},
      {name: 'Brunei Darussalam', code: 'BN'},
      {name: 'Bulgaria', code: 'BG'},
      {name: 'Burkina Faso', code: 'BF'},
      {name: 'Burundi', code: 'BI'},
      {name: 'Cambodia', code: 'KH'},
      {name: 'Cameroon', code: 'CM'},
      {name: 'Canada', code: 'CA'},
      {name: 'Cape Verde', code: 'CV'},
      {name: 'Cayman Islands', code: 'KY'},
      {name: 'Central African Republic', code: 'CF'},
      {name: 'Chad', code: 'TD'},
      {name: 'Chile', code: 'CL'},
      {name: 'China', code: 'CN'},
      {name: 'Christmas Island', code: 'CX'},
      {name: 'Cocos (Keeling) Islands', code: 'CC'},
      {name: 'Colombia', code: 'CO'},
      {name: 'Comoros', code: 'KM'},
      {name: 'Congo', code: 'CG'},
      {name: 'Congo, The Democratic Republic of the', code: 'CD'},
      {name: 'Cook Islands', code: 'CK'},
      {name: 'Costa Rica', code: 'CR'},
      {name: 'Cote D\'Ivoire', code: 'CI'},
      {name: 'Croatia', code: 'HR'},
      {name: 'Cuba', code: 'CU'},
      {name: 'Cyprus', code: 'CY'},
      {name: 'Czech Republic', code: 'CZ'},
      {name: 'Denmark', code: 'DK'},
      {name: 'Djibouti', code: 'DJ'},
      {name: 'Dominica', code: 'DM'},
      {name: 'Dominican Republic', code: 'DO'},
      {name: 'Ecuador', code: 'EC'},
      {name: 'Egypt', code: 'EG'},
      {name: 'El Salvador', code: 'SV'},
      {name: 'Equatorial Guinea', code: 'GQ'},
      {name: 'Eritrea', code: 'ER'},
      {name: 'Estonia', code: 'EE'},
      {name: 'Ethiopia', code: 'ET'},
      {name: 'Falkland Islands (Malvinas)', code: 'FK'},
      {name: 'Faroe Islands', code: 'FO'},
      {name: 'Fiji', code: 'FJ'},
      {name: 'Finland', code: 'FI'},
      {name: 'France', code: 'FR'},
      {name: 'French Guiana', code: 'GF'},
      {name: 'French Polynesia', code: 'PF'},
      {name: 'French Southern Territories', code: 'TF'},
      {name: 'Gabon', code: 'GA'},
      {name: 'Gambia', code: 'GM'},
      {name: 'Georgia', code: 'GE'},
      {name: 'Germany', code: 'DE'},
      {name: 'Ghana', code: 'GH'},
      {name: 'Gibraltar', code: 'GI'},
      {name: 'Greece', code: 'GR'},
      {name: 'Greenland', code: 'GL'},
      {name: 'Grenada', code: 'GD'},
      {name: 'Guadeloupe', code: 'GP'},
      {name: 'Guam', code: 'GU'},
      {name: 'Guatemala', code: 'GT'},
      {name: 'Guernsey', code: 'GG'},
      {name: 'Guinea', code: 'GN'},
      {name: 'Guinea-Bissau', code: 'GW'},
      {name: 'Guyana', code: 'GY'},
      {name: 'Haiti', code: 'HT'},
      {name: 'Heard Island and Mcdonald Islands', code: 'HM'},
      {name: 'Holy See (Vatican City State)', code: 'VA'},
      {name: 'Honduras', code: 'HN'},
      {name: 'Hong Kong', code: 'HK'},
      {name: 'Hungary', code: 'HU'},
      {name: 'Iceland', code: 'IS'},
      {name: 'India', code: 'IN'},
      {name: 'Indonesia', code: 'ID'},
      {name: 'Iran, Islamic Republic Of', code: 'IR'},
      {name: 'Iraq', code: 'IQ'},
      {name: 'Ireland', code: 'IE'},
      {name: 'Isle of Man', code: 'IM'},
      {name: 'Israel', code: 'IL'},
      {name: 'Italy', code: 'IT'},
      {name: 'Jamaica', code: 'JM'},
      {name: 'Japan', code: 'JP'},
      {name: 'Jersey', code: 'JE'},
      {name: 'Jordan', code: 'JO'},
      {name: 'Kazakhstan', code: 'KZ'},
      {name: 'Kenya', code: 'KE'},
      {name: 'Kiribati', code: 'KI'},
      {name: 'Korea, Democratic People\'S Republic of', code: 'KP'},
      {name: 'Korea, Republic of', code: 'KR'},
      {name: 'Kuwait', code: 'KW'},
      {name: 'Kyrgyzstan', code: 'KG'},
      {name: 'Lao People\'S Democratic Republic', code: 'LA'},
      {name: 'Latvia', code: 'LV'},
      {name: 'Lebanon', code: 'LB'},
      {name: 'Lesotho', code: 'LS'},
      {name: 'Liberia', code: 'LR'},
      {name: 'Libyan Arab Jamahiriya', code: 'LY'},
      {name: 'Liechtenstein', code: 'LI'},
      {name: 'Lithuania', code: 'LT'},
      {name: 'Luxembourg', code: 'LU'},
      {name: 'Macao', code: 'MO'},
      {name: 'Macedonia, The Former Yugoslav Republic of', code: 'MK'},
      {name: 'Madagascar', code: 'MG'},
      {name: 'Malawi', code: 'MW'},
      {name: 'Malaysia', code: 'MY'},
      {name: 'Maldives', code: 'MV'},
      {name: 'Mali', code: 'ML'},
      {name: 'Malta', code: 'MT'},
      {name: 'Marshall Islands', code: 'MH'},
      {name: 'Martinique', code: 'MQ'},
      {name: 'Mauritania', code: 'MR'},
      {name: 'Mauritius', code: 'MU'},
      {name: 'Mayotte', code: 'YT'},
      {name: 'Mexico', code: 'MX'},
      {name: 'Micronesia, Federated States of', code: 'FM'},
      {name: 'Moldova, Republic of', code: 'MD'},
      {name: 'Monaco', code: 'MC'},
      {name: 'Mongolia', code: 'MN'},
      {name: 'Montserrat', code: 'MS'},
      {name: 'Morocco', code: 'MA'},
      {name: 'Mozambique', code: 'MZ'},
      {name: 'Myanmar', code: 'MM'},
      {name: 'Namibia', code: 'NA'},
      {name: 'Nauru', code: 'NR'},
      {name: 'Nepal', code: 'NP'},
      {name: 'Netherlands', code: 'NL'},
      {name: 'Netherlands Antilles', code: 'AN'},
      {name: 'New Caledonia', code: 'NC'},
      {name: 'New Zealand', code: 'NZ'},
      {name: 'Nicaragua', code: 'NI'},
      {name: 'Niger', code: 'NE'},
      {name: 'Nigeria', code: 'NG'},
      {name: 'Niue', code: 'NU'},
      {name: 'Norfolk Island', code: 'NF'},
      {name: 'Northern Mariana Islands', code: 'MP'},
      {name: 'Norway', code: 'NO'},
      {name: 'Oman', code: 'OM'},
      {name: 'Pakistan', code: 'PK'},
      {name: 'Palau', code: 'PW'},
      {name: 'Palestinian Territory, Occupied', code: 'PS'},
      {name: 'Panama', code: 'PA'},
      {name: 'Papua New Guinea', code: 'PG'},
      {name: 'Paraguay', code: 'PY'},
      {name: 'Peru', code: 'PE'},
      {name: 'Philippines', code: 'PH'},
      {name: 'Pitcairn', code: 'PN'},
      {name: 'Poland', code: 'PL'},
      {name: 'Portugal', code: 'PT'},
      {name: 'Puerto Rico', code: 'PR'},
      {name: 'Qatar', code: 'QA'},
      {name: 'Reunion', code: 'RE'},
      {name: 'Romania', code: 'RO'},
      {name: 'Russian Federation', code: 'RU'},
      {name: 'RWANDA', code: 'RW'},
      {name: 'Saint Helena', code: 'SH'},
      {name: 'Saint Kitts and Nevis', code: 'KN'},
      {name: 'Saint Lucia', code: 'LC'},
      {name: 'Saint Pierre and Miquelon', code: 'PM'},
      {name: 'Saint Vincent and the Grenadines', code: 'VC'},
      {name: 'Samoa', code: 'WS'},
      {name: 'San Marino', code: 'SM'},
      {name: 'Sao Tome and Principe', code: 'ST'},
      {name: 'Saudi Arabia', code: 'SA'},
      {name: 'Senegal', code: 'SN'},
      {name: 'Serbia and Montenegro', code: 'CS'},
      {name: 'Seychelles', code: 'SC'},
      {name: 'Sierra Leone', code: 'SL'},
      {name: 'Singapore', code: 'SG'},
      {name: 'Slovakia', code: 'SK'},
      {name: 'Slovenia', code: 'SI'},
      {name: 'Solomon Islands', code: 'SB'},
      {name: 'Somalia', code: 'SO'},
      {name: 'South Africa', code: 'ZA'},
      {name: 'South Georgia and the South Sandwich Islands', code: 'GS'},
      {name: 'Spain', code: 'ES'},
      {name: 'Sri Lanka', code: 'LK'},
      {name: 'Sudan', code: 'SD'},
      {name: 'Suriname', code: 'SR'},
      {name: 'Svalbard and Jan Mayen', code: 'SJ'},
      {name: 'Swaziland', code: 'SZ'},
      {name: 'Sweden', code: 'SE'},
      {name: 'Switzerland', code: 'CH'},
      {name: 'Syrian Arab Republic', code: 'SY'},
      {name: 'Taiwan, Province of China', code: 'TW'},
      {name: 'Tajikistan', code: 'TJ'},
      {name: 'Tanzania, United Republic of', code: 'TZ'},
      {name: 'Thailand', code: 'TH'},
      {name: 'Timor-Leste', code: 'TL'},
      {name: 'Togo', code: 'TG'},
      {name: 'Tokelau', code: 'TK'},
      {name: 'Tonga', code: 'TO'},
      {name: 'Trinidad and Tobago', code: 'TT'},
      {name: 'Tunisia', code: 'TN'},
      {name: 'Turkey', code: 'TR'},
      {name: 'Turkmenistan', code: 'TM'},
      {name: 'Turks and Caicos Islands', code: 'TC'},
      {name: 'Tuvalu', code: 'TV'},
      {name: 'Uganda', code: 'UG'},
      {name: 'Ukraine', code: 'UA'},
      {name: 'United Arab Emirates', code: 'AE'},
      {name: 'United Kingdom', code: 'GB'},
      {name: 'United States', code: 'US'},
      {name: 'United States Minor Outlying Islands', code: 'UM'},
      {name: 'Uruguay', code: 'UY'},
      {name: 'Uzbekistan', code: 'UZ'},
      {name: 'Vanuatu', code: 'VU'},
      {name: 'Venezuela', code: 'VE'},
      {name: 'Vietnam', code: 'VN'},
      {name: 'Virgin Islands, British', code: 'VG'},
      {name: 'Virgin Islands, U.S.', code: 'VI'},
      {name: 'Wallis and Futuna', code: 'WF'},
      {name: 'Western Sahara', code: 'EH'},
      {name: 'Yemen', code: 'YE'},
      {name: 'Zambia', code: 'ZM'},
      {name: 'Zimbabwe', code: 'ZW'}
    ];*/

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


  $scope.$watch(function() {
    return scope.geo_details;
  }, function(location) {
    if (location) {
      scope.postJob1.location = scope.geo_location;
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


.controller('PostJobTwoController', ['$window', '$uibModal', 'gettingData', 'CompanyDetails', '$http', 'CONFIG', function($window,$uibModal,gettingData,CompanyDetails,$http,CONFIG){

    $window.scrollTo(0,0);

    this.company_name = CompanyDetails.company_name;
  
    gettingData.bol = true;
    this.buckLoader = true;
    var bucketColor = ["#229A77", "#21A4AC", "#EE8F3B", "#2A99E0", "#154c50", "#103954", "#342158", "#5B5B29", "#004D40", "#3e110d"];
    var bucketColor = ["#229A77", "#21A4AC", "#EE8F3B", "#2A99E0", "#154c50", "#103954", "#342158", "#5B5B29", "#004D40", "#6f2b25"];
      
    this.getColor = function(ind) {
        return bucketColor[String(ind).slice(-1)];
    }

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

    var bucket_count = [];

    this.getDataUpdate = function(src,ind,bucketId){
        if(src == "public/images/add.svg"){
          bucket_count.push(bucketId);
          scope.bucket_names[ind].src = "public/images/select.svg";
        }
        else{
          var index = bucket_count.indexOf(bucketId);
          bucket_count.splice(index, 1);
          scope.bucket_names[ind].src="public/images/add.svg";
        }
        scope.userSelOnebkt = false;
    }

    this.currencyInfo = [
        { id : 1, code : '$' },
        { id : 2, code : '₹' }
    ];

    this.code = '1';

    this.reset = function(para){
        if(para == ""){
            scope.discoveryPoints = "";
            scope.discoveryCurrency = "";
            scope.code = '1';
        }
        else if(para == "paid"){
            scope.discoveryPoints = "";
            scope.discoveryRewardsType = 'paid';
        }
        else{
            scope.discoveryCurrency = "";
            scope.code = "1";
            scope.discoveryRewardsType = 'points';
        }
        scope.bolFormValid = false; 
    }

    this.code1 = '1';
    this.reset1 = function(para){
        if(para == ""){
            scope.referralPoints = "";
            scope.referralCurrency = "";
            scope.code1 = '1';
        }
        else if(para == "paid"){
            scope.referralPoints = "";
            scope.referralRewardsType = 'paid';
        }
        else{
            scope.referralCurrency = "";
            scope.code1 = "1";
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
            scope.code = '1';
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
            scope.code1 = '1';
            scope.referralCurrency = '';
        }
        scope.userSelRewards = false; 
    }


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

        if (bucket_count.length == 0) {
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
            rewards('referral', 'code1');    
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
        var buckets = bucket_count.toString();
        scope.success_cond = true;
        scope.loader = true;

        var post_job = $.param({
            rewards : rewardsObj,
            job_title : scope.post_job_result.job_title,
            location : scope.post_job_result.location,
            industry : scope.post_job_result.industry.industry_id,
            employment_type : scope.post_job_result.emp_type.employment_type_id,
            job_description : scope.post_job_result.job_desc,
            experience_range : scope.post_job_result.experience.experience_id,
            job_function : scope.post_job_result.job_func.job_function_id,
            free_job : freeJob ,
            // job_currency : scope.rewardCond.currency,
            // job_cost : scope.rewardCond.amount,
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