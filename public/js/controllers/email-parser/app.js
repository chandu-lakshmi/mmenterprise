(function () {
"use strict";

	angular
		.module('emailParser', ['ui.router', 'ui.bootstrap', 'ngMeta',
			'app.constants', 'app.components','app.helpers',
			'app.email.parser'
		])


		.config(function ($stateProvider, $urlRouterProvider, $locationProvider, App, ngMetaProvider) {
    
    		$locationProvider.html5Mode(true);

    		ngMetaProvider.setDefaultTag('app_id', '730971373717257');

    		$stateProvider
    			.state('allJobs', {
			        url: '/all-jobs/:share_status?ref',
			        templateUrl: App.base_url + 'templates/email-parser/all-jobs.phtml',
			        controller: 'AllJobsController',
			        controllerAs:'AllJobsCtrl',
			        data : { pageTitle: 'Mintmesh ( Jobs )' },
			        params : {share_status : 'web'}
			    })
			    .state('candidateDetails', {
			        url: '/candidate-details/:share_status?ref&flag&jc',
			        templateUrl: App.base_url + 'templates/email-parser/candidate-details.phtml',
			        controller: 'ApplyJobController',
			        controllerAs:'ApplyJobCtrl',
			        data : { pageTitle: 'Mintmesh ( Upload CV )' },
			        params : {status : '',share_status : 'web'}
			    })
			    .state('referralDetails', {
			        url: '/referral-details/:share_status?ref&flag&jc',
			        templateUrl: App.base_url + 'templates/email-parser/referral-details.phtml',
			        controller: 'ApplyJobController',
			        controllerAs:'ApplyJobCtrl',
			        data : { pageTitle: '' },
			        params : {status : '', share_status : 'web', jc : '0'}
			    })
			    .state('jobDetails', {
			        url: '/job-details/:share_status?ref',
			        templateUrl: App.base_url + 'templates/email-parser/job-details.phtml',
			        controller: 'JobDetailsController',
			        controllerAs:'JobDetailsCtrl',
			        data : { pageTitle: 'Mintmesh' },
			        params : {share_status : 'web'}
			    })
			    .state('allCampaigns', {
			        url: '/all-campaigns/:share_status?ref',
			        templateUrl: App.base_url + 'templates/email-parser/all-campaigns.phtml',
			        controller: 'AllCampaignsController',
			        controllerAs:'AllCampaignsCtrl',
			        data : { pageTitle: 'Mintmesh ( Campaigns )' },
			        params : {share_status : 'web'}
			    })

    		$urlRouterProvider.otherwise('/all-jobs');
    
		})


		.run([ '$rootScope', '$state', '$stateParams', 'ngMeta', 'App', 'ReferralDetails',
		    function ($rootScope, $state, $stateParams, ngMeta, App, ReferralDetails) {
		    	ngMeta.init();
		    	$rootScope.$root = App;
		        $rootScope.$state = $state;
		        $rootScope.ReferralDetails = ReferralDetails;
		        $rootScope.SocialShare = {};
		        $rootScope.$stateParams = $stateParams;
		    }
		])

}());