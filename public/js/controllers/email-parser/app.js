(function () {
"use strict";

	angular
		.module('emailParser', ['ui.router', 'ui.bootstrap',
			'app.constants', 'app.components','app.helpers',
			'app.email.parser'
		])


		.config(function ($stateProvider, $urlRouterProvider, $locationProvider, App) {
    
    		$locationProvider.html5Mode(true);

    		$stateProvider
    			.state('allJobs', {
			        url: '/all-jobs?ref',
			        templateUrl: App.base_url + 'templates/email-parser/all-jobs.phtml',
			        controller: 'AllJobsController',
			        controllerAs:'AllJobsCtrl',
			        data : { pageTitle: 'Mintmesh ( Jobs )' }
			    })
			    .state('candidateDetails', {
			        url: '/candidate-details?ref&flag&jc',
			        templateUrl: App.base_url + 'templates/email-parser/candidate-details.phtml',
			        controller: 'ApplyJobController',
			        controllerAs:'ApplyJobCtrl',
			        data : { pageTitle: 'Mintmesh ( Upload CV )' },
			        params : {status : ''}
			    })
			    .state('referralDetails', {
			        url: '/referral-details?ref&flag&jc',
			        templateUrl: App.base_url + 'templates/email-parser/referral-details.phtml',
			        controller: 'ApplyJobController',
			        controllerAs:'ApplyJobCtrl',
			        data : { pageTitle: '' },
			        params : {status : ''}
			    })
			    .state('jobDetails', {
			        url: '/job-details?ref',
			        templateUrl: App.base_url + 'templates/email-parser/job-details.phtml',
			        controller: 'JobDetailsController',
			        controllerAs:'JobDetailsCtrl',
			        data : { pageTitle: 'Mintmesh' },
			    })
			    .state('allCampaigns', {
			        url: '/all-campaigns?ref',
			        templateUrl: App.base_url + 'templates/email-parser/all-campaigns.phtml',
			        controller: 'AllCampaignsController',
			        controllerAs:'AllCampaignsCtrl',
			        data : { pageTitle: 'Mintmesh ( Campaigns )' }
			    })

    		$urlRouterProvider.otherwise('/all-jobs');
    
		})


		.run([ '$rootScope', '$state', '$stateParams', 'App', 'ReferralDetails',
		    function ($rootScope, $state, $stateParams, App, ReferralDetails) {
		    	$rootScope.$root = App;
		        $rootScope.$state = $state;
		        $rootScope.ReferralDetails = ReferralDetails;
		        $rootScope.SocialShare = {};
		        $rootScope.$stateParams = $stateParams;
		    }
		])

}());