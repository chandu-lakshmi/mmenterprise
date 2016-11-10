(function () {
"use strict";

angular.module('app.dashboard', ['ngMaterial', 'ngMessages'])

.run(["$templateCache", "$http", function ($templateCache, $http) {
    $http.get('templates/header.phtml', { cache: $templateCache });
   	$http.get('templates/footer.phtml', { cache: $templateCache });
}])


.controller('DashboardController', ['$interval', '$window', '$http', '$state', 'UserDetails', '$q', 'CompanyDetails', 'CONFIG', function($interval, $window, $http, $state, UserDetails, $q, CompanyDetails, CONFIG){

	var scope = this;

	$window.scrollTo(0, 0);

	/*border loading at top */ 	
 	scope.borderInc = 1;
 	var s = $interval(function(){
 		scope.remaining = 100 - scope.borderInc;
        scope.borderInc = scope.borderInc + (0.1 * Math.pow(1 - Math.sqrt(scope.remaining), 2))
 	}, 100);

    this.dashboardLoader = false;
	this.statusNames = ['Referrals', 'Accepted', 'Interviewed', 'Hired'];
	this.getColor = function(status, src){  
		var status = status.toLowerCase();
		if (status == 'pending')
			return '#f07914';
		else if (status == 'accepted')
			return '#22a2ee';
		else if (status == 'declined') 
			return '#FD4243';
		else 
			return ''; 
	}

	this.colorCode = ["#21A4AC", "#EE8F3B", "#2A99E0", "#154c50", "#103954", "#342158", "#5B5B29", "#004D40", "#229A77", "#6f2b25"];    
	this.colorCode2 = ["#4337c1", "#55b567", "#caba34", "#9e9e9e", "#110613", "#b54019", "#cdc309", "#607D8B", "#FFB300", "#424242"];
    this.colorPicker = function(ind, bol) {
        return scope[bol == 1 ? 'colorCode' : 'colorCode2' ][String(ind).slice(-1)];
	}

	this.getSrc = function(arg){
		return (arg != '' || arg == 'null')  ? arg : 'public/images/avatar.png';   
	}
	this.daysList = [
		{ days:7,label:'7 Days' },
		{ days:30,label:'30 Days' },
		{ days:360,label:'1 Year' }
	];

	this.rewardsView = function(rewards) {
		for(var i in rewards){
			if(rewards[i].rewards_name == 'Referral'){
				if(rewards[i].rewards_type == 'paid'){
	           		return  (rewards[i].currency_type == 1 ? '$' : '₹') +  rewards[i].rewards_value + '/' + rewards[i].rewards_name;
	        	}
	        	else if(rewards.rewards_type == 'points'){
	            	return  rewards[i].rewards_value + ' Points' + '/' + rewards[i].rewards_name;  
	        	}
	        	else{
	            	return  'Free';  
	        	}	
			}
		}
    }
	this.username = UserDetails.user_name;
	
	function circleProgress(contact,job,reward){
		$('.circlestat').circliful({
			foregroundColor: '#47bac1',
		    percent: contact,
		    foregroundBorderWidth: 9,
		    backgroundBorderWidth: 9,
		    backgroundColor: '#d4dfe5',
		    icon : 'public/images/contacts_img_small.png',
	        iconSize : 30
		});

		$('.circlestat1').circliful({
			foregroundColor: '#16A4FA',
		    percent: job,
		    foregroundBorderWidth: 9,
		    backgroundBorderWidth: 9,
		    backgroundColor: '#d4dfe5',
		    icon : 'public/images/jobs_img_small.png',
	        iconSize : 30
		});

		$('.circlestat2').circliful({
			foregroundColor: '#FA8214',
	        percent: reward,
	        foregroundBorderWidth: 9,
	        backgroundBorderWidth: 9,
	        backgroundColor: '#d4dfe5',
	        icon : 'public/images/no_rewards.png',
	        iconSize : 30
		});
	}
	
	/* $http request for Dashboard */
	this.noDataRef = false;
	this.noDataHire = false;
	var dashboardParams = $.param({
		company_code : CompanyDetails.company_code,
        request_type : ''
	});

	var dashboard_job_details = $http({
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        method : 'POST',
        data: dashboardParams,
        url : CONFIG.APP_DOMAIN + 'view_dashboard',
	})

	dashboard_job_details.success(function(response){
		
		scope.borderInc = 100;
		$interval.cancel(s);
		$('#borderLoader').fadeOut(2000);

		scope.dashboardLoader = true;
		if (response.status_code == 200) {
			var postProgress = response.data.post_progress;
			scope.dashboardData = response.data;
			scope.jobsCount = response.data.post_counts;
			scope.jobsStatusCount = response.data.status_count;
			scope.referralsList = response.data.post_referrals;
			scope.hiresList = response.data.post_hires;
			if(scope.referralsList.length == 0){
				scope.noDataRef = true;
			}
			if(scope.hiresList.length == 0){
				scope.noDataHire = true;
			}
			if(scope.dashboardData.top_referrals.length == 0){
				scope.top_referrals_empty = true;
			}
			setTimeout(function(){circleProgress(postProgress.contacts, postProgress.jobs, postProgress.rewards)},0);
		}
		else if(response.status_code == 400){
            $window.location = CONFIG.APP_DOMAIN + 'logout';
        }
        $('footer').show();
	})
	dashboard_job_details.error(function(response){
		console.log(response);	
	});

	/* $http request for Progress select box */
	this.cancellerProgress;	
	this.loaderProgress = false;
	this.lastProgressBar = function(days){

		scope.loaderProgress = true;
		updateData(days, 'PROGRESS', 'cancellerProgress', 'loaderProgress', 'progressList', 'post_progress', '');

	}

	/* $http request for lastReferrals select box */
	this.cancelleRerrals;	
	this.loaderRerrals = false;
	this.lastReferrals = function(days){
		
		scope.noDataRef = false;
		scope.loaderRerrals = true;
		updateData(days, 'REFERRALS', 'cancelleRerrals', 'loaderRerrals', 'referralsList', 'post_referrals', 'noDataRef');
	
	}

	/* $http request for lastHires select box */
	this.cancelleHires;	
	this.loaderHires = false;
	this.lastHires = function(days){

		scope.noDataHire = false;
		scope.loaderHires = true;
		updateData(days, 'HIRED', 'cancelleHires', 'loaderHires', 'hiresList', 'post_hires', 'noDataHire');
	
	}

	function updateData(days, paraType, varPromise, spinner, typeList, paraResponse, noDataSpinner){
		var hiresParams = $.param({
			company_code : CompanyDetails.company_code,
	        request_type : paraType,
			filter_limit : days
		});

		if (scope[varPromise]) {
            scope[varPromise].resolve();
        }

        scope[varPromise] = $q.defer();

		var showReports = $http({
	        headers: {
	            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	        },
	        method : 'POST',
	        data: hiresParams,
	        url : CONFIG.APP_DOMAIN + 'view_dashboard',
	        timeout : scope[varPromise].promise
		})

		showReports.success(function(response){
			if (response.status_code == 200) {
				scope[spinner] = false;
				scope[typeList] = response.data[paraResponse];
				
				if(scope[typeList].length == 0){
					scope[noDataSpinner] = true;	
				}

				if(noDataSpinner == ""){
					$('.circlestat svg:last-child').remove(),
					$('.circlestat1 svg:last-child').remove(),
					$('.circlestat2 svg:last-child').remove(),
					circleProgress(scope[typeList].contacts, scope[typeList].jobs, scope[typeList].rewards)
					// $.when($('.circlestat').circliful({percent: postProgress.contacts})).then($('.circlestat svg:last-child').remove());	
				}	
			}
			else if(response.status_code == 400){
	            $window.location = CONFIG.APP_DOMAIN + 'logout';
	        }
		})

		dashboard_job_details.error(function(response){
			console.log(response);	
		});
	}

	/* borderLoading the footer stays at bottom */
	setTimeout(function (){
 		$('footer').hide();
 	},1);

 	
	
}])
 
.controller('HeaderController',['UserDetails', 'CompanyDetails', '$http', 'CONFIG', function(UserDetails,CompanyDetails,$http,CONFIG){
	this.user_name = UserDetails.user_name;
	this.logo = CompanyDetails.company_logo;

	this.logout = function(){
		window.location.href = CONFIG.APP_DOMAIN+'logout';
	}
}])


.controller('FooterController',[function(){

}])







}());