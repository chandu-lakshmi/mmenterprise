(function () {
"use strict";

	angular
		.module('emailParser', ['ui.router', 'ui.bootstrap', 'ngSanitize', 'ngMaterial',
			'app.constants', 'app.components','app.helpers',
			'app.email.parser'
		])


		.config(function ($stateProvider, $urlRouterProvider, $locationProvider, App) {
    
    		$locationProvider.html5Mode(true);

    		$stateProvider
    			.state('allJobs', {
			        url: '/all-jobs/:share_status?ref&jc',
			        templateUrl: App.base_url + 'templates/email-parser/all-jobs.phtml',
			        controller: 'AllJobsController',
			        controllerAs:'AllJobsCtrl',
			        data : { pageTitle: 'MintMesh ( Jobs )' },
			        params : {share_status : 'web'}
			    })
			    .state('candidateDetails', {
			        url: '/candidate-details/:share_status?ref&flag&jc&refrel',
			        templateUrl: App.base_url + 'templates/email-parser/candidate-details.phtml',
			        controller: 'ApplyJobController',
			        controllerAs:'ApplyJobCtrl',
			        data : { pageTitle: 'MintMesh ( Apply )' },
			        params : {status : '',share_status : 'web', refrel : '0'}
			    })
			    .state('referralDetails', {
			        url: '/referral-details/:share_status?ref&flag&jc',
			        templateUrl: App.base_url + 'templates/email-parser/referral-details.phtml',
			        controller: 'ApplyJobController',
			        controllerAs:'ApplyJobCtrl',
			        data: {pageTitle: 'MintMesh ( Refer )'},
			        params : {status : '', share_status : 'web', jc : '0'}
			    })
			    .state('jobDetails', {
			        url: '/job-details/:share_status?ref?jc',
			        templateUrl: App.base_url + 'templates/email-parser/job-details.phtml',
			        controller: 'JobDetailsController',
			        controllerAs:'JobDetailsCtrl',
			        data : { pageTitle: 'MintMesh' },
			        params : {share_status : 'web', jc : '0'}
			    })

			    /*-----------Campaigns---------------*/
			    .state('allCampaigns', {
			        abstract: true,
			        url: '',
			        templateUrl: App.base_url + 'templates/email-parser/all-campaigns.phtml',
			        controller: 'AllCampaignsController',
			        controllerAs: 'AllCampaignsCtrl'
			    })
			    .state('allCampaigns.all', {
			        url: '/all-campaigns/:share_status?ref',
			        templateUrl: App.base_url + 'templates/email-parser/all-campaigns-list.phtml',
			        controller: 'AllCampaignsController',
			        controllerAs: 'AllCampaignsCtrl',
			        data: {pageTitle: 'MintMesh ( Campaigns )'},
			        params: {share_status: 'web'}
			    })
			    .state('allCampaigns.referralDetails', {
			        url: '/campaign/referral-details/:share_status?ref&flag&jc',
			        templateUrl: App.base_url + 'templates/email-parser/referral-details.phtml',
			        controller: 'ApplyJobController',
			        controllerAs: 'ApplyJobCtrl',
			        data: {pageTitle: 'MintMesh ( Refer )'},
			        params: {status: '', share_status: 'web', jc: '0'}
			    })
			    .state('allCampaigns.candidateDetails', {
			    	url: '/campaign/candidate-details/:share_status?ref&flag&jc&refrel',
			    	templateUrl: App.base_url + 'templates/email-parser/candidate-details.phtml',
			    	controller: 'ApplyJobController',
			    	controllerAs:'ApplyJobCtrl',
			    	data : { pageTitle: 'MintMesh ( Apply )' },
			    	params : {status : '',share_status : 'web', refrel : '0'}
			    })

    		$urlRouterProvider.otherwise('/all-jobs');
    
		})


		.run([ '$rootScope', '$state', '$stateParams', 'App', 'ReferralDetails', 'CampaignDetails',
		    function ($rootScope, $state, $stateParams, App, ReferralDetails, CampaignDetails) {
		    	$rootScope.$root 		= App;
		        $rootScope.$state 		= $state;
		        $rootScope.SocialShare 	= {};
		        $rootScope.$stateParams    = $stateParams;
		        $rootScope.ReferralDetails = ReferralDetails;
		        $rootScope.CampaignDetails = CampaignDetails;
		    }
		])

}());