(function () {
"use strict";

angular.module('app.dashboard', ['ngProgress'])

.run(["$templateCache", "$http", function ($templateCache, $http) {
    $http.get('templates/header.phtml', { cache: $templateCache });
    $http.get('templates/footer.phtml', { cache: $templateCache });
}])


.controller('DashboardController', ['$scope', '$window', '$http', '$state', 'UserDetails', '$q', 'ngProgressFactory', 'CompanyDetails', 'CONFIG', function($scope, $window, $http, $state, UserDetails, $q, ngProgressFactory, CompanyDetails, CONFIG){

	var scope = this;

	$window.scrollTo(0, 0);

	$scope.progressbar = ngProgressFactory.createInstance();
    $scope.progressbar.start();
    $scope.progressbar.setColor('#34b893');

    this.dashboardLoader = false;
	this.statusNames = ['Referrals', 'Accepted', 'Interviewed', 'Hired'];
	this.getColor = function(status){
		var status = status.toLowerCase();
		if (status == 'pending')
			return '#f07914';
		else if (status == 'accepted')
			return '#22a2ee';
		else if (status == 'declined') 
			return '#FD4243';
		else
			return '#468A25'; 
	}
	this.username = UserDetails.user_name;
	
	function circleProgress(contact,job,reward){
		$('.circlestat').circliful({
			foregroundColor: '#47bac1',
		    percent: contact,
		    foregroundBorderWidth: 9,
		    backgroundBorderWidth: 9,
		    backgroundColor: '#d4dfe5',
		});

		$('.circlestat1').circliful({
			foregroundColor: '#16A4FA',
		    percent: job,
		    foregroundBorderWidth: 9,
		    backgroundBorderWidth: 9,
		    backgroundColor: '#d4dfe5',
		});

		$('.circlestat2').circliful({
			foregroundColor: '#FA8214',
	        percent: reward,
	        foregroundBorderWidth: 9,
	        backgroundBorderWidth: 9,
	        backgroundColor: '#d4dfe5',
		});
	}
	
	/* $http request for Dashboard */
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
		$scope.progressbar.complete();
		scope.dashboardLoader = true;
		if (response.status_code == 200) {
			var postProgress = response.data.post_progress;
			scope.jobsCount = response.data.post_counts;
			scope.jobsStatusCount = response.data.status_count;
			scope.referralsList = response.data.post_referrals;
			scope.hiresList = response.data.post_hires;
			setTimeout(function(){circleProgress(postProgress.contacts, postProgress.jobs, postProgress.rewards)},0);
		}
		else if(response.status_code == 400){
            $window.location = CONFIG.APP_DOMAIN + 'logout';
        }
	})
	dashboard_job_details.error(function(response){
		console.log(response);	
	});


	/* $http request for Progress select box */
	var canceller;	
	this.loaderShowReport = false;
	this.showReportsSel = function(days){

		var progressParams = $.param({
			company_code : CompanyDetails.company_code,
	        request_type :'PROGRESS',
			filter_limit : days
		});
		
		scope.loaderShowReport = true;
		if (canceller) {
            canceller.resolve();
        }

        canceller = $q.defer();

		var showReports = $http({
	        headers: {
	            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	        },
	        method : 'POST',
	        data: progressParams,
	        url : CONFIG.APP_DOMAIN + 'view_dashboard',
	        timeout : canceller.promise
		})
		showReports.success(function(response){
			if (response.status_code == 200) {
				var postProgress = response.data.post_progress;
				scope.loaderShowReport = false;				
				$('.circlestat svg:last-child').remove();
				$('.circlestat1 svg:last-child').remove();
				$('.circlestat2 svg:last-child').remove();
				circleProgress(postProgress.contacts, postProgress.jobs, postProgress.rewards);
				// $.when($('.circlestat').circliful({percent: postProgress.contacts})).then($('.circlestat svg:last-child').remove());
			}
		})
		dashboard_job_details.error(function(response){
			console.log(response);	
		});

	}
	

	/* $http request for lastReferrals select box */
	var cancelleRerrals;	
	this.loaderRerrals = false;
	this.lastReferrals = function(days){

		var refParams = $.param({
			company_code : CompanyDetails.company_code,
	        request_type :'REFERRALS',
			filter_limit : days
		});

		scope.loaderRerrals = true;

		if (cancelleRerrals) {
            cancelleRerrals.resolve();
        }

        cancelleRerrals = $q.defer();

		var showReports = $http({
	        headers: {
	            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	        },
	        method : 'POST',
	        data: refParams,
	        url : CONFIG.APP_DOMAIN + 'view_dashboard',
	        timeout : cancelleRerrals.promise
		})
		showReports.success(function(response){
			if (response.status_code == 200) {
				scope.loaderRerrals = false;
				scope.referralsList = response.data.post_referrals;
			}
		})
		dashboard_job_details.error(function(response){
			console.log(response);	
		});

	}

	/* $http request for lastHires select box */
	var cancelleHires;	
	this.loaderHires = false;
	this.lastHires = function(days){

		var hiresParams = $.param({
			company_code : CompanyDetails.company_code,
	        request_type :'HIRED',
			filter_limit : days
		});


		scope.loaderHires = true;

		if (cancelleHires) {
            cancelleHires.resolve();
        }

        cancelleHires = $q.defer();

		var showReports = $http({
	        headers: {
	            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	        },
	        method : 'POST',
	        data: hiresParams,
	        url : CONFIG.APP_DOMAIN + 'view_dashboard',
	        timeout : cancelleHires.promise
		})
		showReports.success(function(response){
			if (response.status_code == 200) {
				scope.loaderHires = false;
				scope.hiresList = response.data.post_hires;
			}
		})
		dashboard_job_details.error(function(response){
			console.log(response);	
		});

	}





	
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