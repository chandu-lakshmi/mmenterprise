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
	
	/* sample data */
	var dataRef = [
		{"id" : 1, "name" : "John Butler", "imgSrc" : "public/images/Ui_Faces/John Butler.jpg", "refImgSrc" : "public/images/Ui_Faces/Steve Chris.jpg", "designation" : "UI/UX Designer", "refName" : "Steve Chris", "time" : "12 min ago", "status" : "Pending" },
		{"id" : 2, "name" : "Daniel", "imgSrc" : "public/images/Ui_Faces/Daniel.jpg", "refImgSrc" : "public/images/Ui_Faces/Julia Lawson.jpg", "designation" : "Salesforce Architect", "refName" : "Julia Lawson", "time" : "25 mins ago", "status" : "Accepted" },
		{"id" : 3, "name" : "Christopher", "imgSrc" : "public/images/Ui_Faces/Christopher.jpg", "refImgSrc" : "public/images/Ui_Faces/Kristene Scot.jpg", "designation" : "iOS Developer", "refName" : "Kristene Scot", "time" : "12 min ago", "status" : "Hired" },
		{"id" : 4, "name" : "Johnson", "imgSrc" : "public/images/Ui_Faces/Johnson.jpg", "refImgSrc" : "public/images/Ui_Faces/Mary L.jpg", "designation" : "UI/UX Designer", "refName" : "Mary L", "time" : "1 day ago", "status" : "Declined" },
		{"id" : 4, "name" : "Johnson", "imgSrc" : "public/images/Ui_Faces/Johnson.jpg", "refImgSrc" : "public/images/Ui_Faces/Mary L.jpg", "designation" : "UI/UX Designer", "refName" : "Mary L", "time" : "1 day ago", "status" : "Declined" }
	];
	var dataHire = [
		{"id" : 1, "name" : "Daniel", "imgSrc" : "public/images/Ui_Faces/Daniel.jpg", "refImgSrc" : "public/images/Ui_Faces/Julia Lawson.jpg", "designation" : "Salesforce Architect", "refName" : "Julia Lawson", "time" : "1 day ago", "amount" : "Paid $5" },
	];

	/* $http request for Dashboard */
	var dashboardParams = $.param({
        company_code : CompanyDetails.company_code
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
			//scope.referralsList = response.data.post_referrals;
			//scope.hiresList = response.data.post_hires;
			scope.referralsList = dataRef;
			scope.hiresList = dataHire;
			//circleProgress(postProgress.contacts, postProgress.jobs, postProgress.rewards);
			setTimeout(function(){circleProgress(postProgress.contacts, postProgress.jobs, postProgress.rewards)},0);
		}
		else if(response.status_code == 400){
            $window.location = CONFIG.APP_DOMAIN + 'logout';
        }
	})
	dashboard_job_details.error(function(response){
		console.log(response);	
	});


	/* $http request for showReports select box */
	var canceller;	
	this.loaderShowReport = false;
	this.showReportsSel = function(days){
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
	        //data:'showReports: '+days,
	        data: dashboardParams,
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
				// $.when($('.circlestat').circliful({percent: postProgress.contacts})).then( );
				// $.when($('.circlestat1').circliful({percent: postProgress.jobs})).then( );
				// $.when($('.circlestat2').circliful({percent: postProgress.rewards})).then(  );
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
	        //data:'lastReferrals: '+days,
	        data: dashboardParams,
	        url : CONFIG.APP_DOMAIN + 'view_dashboard',
	        timeout : cancelleRerrals.promise
		})
		showReports.success(function(response){
			if (response.status_code == 200) {
				scope.loaderRerrals = false;
				//scope.referralsList = response.data.post_referrals;
				scope.referralsList = dataRef;
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
	        //data:'lastHires: '+days,
	        data: dashboardParams,
	        url : CONFIG.APP_DOMAIN + 'view_dashboard',
	        timeout : cancelleHires.promise
		})
		showReports.success(function(response){
			if (response.status_code == 200) {
				scope.loaderHires = false;
				//scope.hiresList = response.data.post_hires;
				scope.hiresList = dataHire;
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