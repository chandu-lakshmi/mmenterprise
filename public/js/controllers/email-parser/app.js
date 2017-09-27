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
    				abstract : true,
			        url: '',
			        templateUrl: App.base_url + 'templates/email-parser/all-jobs.phtml',
			        controller: 'JobsController',
			        controllerAs:'JobsCtrl'
			    })
			    .state('allJobs.all', {
			        url: '/all-jobs/:share_status?ref&jc',
			        templateUrl: App.base_url + 'templates/email-parser/all-jobs-list.phtml',
			        controller: 'AllJobsController',
			        controllerAs:'AllJobsCtrl',
			        data : { pageTitle: 'MintMesh ( Jobs )' },
			        params : {share_status : 'web'}
			    })
			    .state('allJobs.candidateDetails', {
			        url: '/candidate-details/:share_status?ref&flag&jc&refrel',
			        templateUrl: App.base_url + 'templates/email-parser/candidate-details.phtml',
			        controller: 'ApplyJobController',
			        controllerAs:'ApplyJobCtrl',
			        data : { pageTitle: 'MintMesh ( Apply )' },
			        params : {status : '',share_status : 'web', refrel : '0'}
			    })
			    .state('allJobs.referralDetails', {
			        url: '/referral-details/:share_status?ref&flag&jc',
			        templateUrl: App.base_url + 'templates/email-parser/referral-details.phtml',
			        controller: 'ApplyJobController',
			        controllerAs:'ApplyJobCtrl',
			        data: {pageTitle: 'MintMesh ( Refer )'},
			        params : {status : '', share_status : 'web', jc : '0', refrel : '0'}
			    })
			    .state('allJobs.jobDetails', {
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
			        controller: 'CampaignsController',
			        controllerAs: 'CampaignsCtrl'
			    })
			    .state('allCampaigns.all', {
			        url: '/all-campaigns/:share_status?ref',
			        templateUrl: App.base_url + 'templates/email-parser/all-campaigns-list.phtml',
			        controller: 'AllCampaignsController',
			        controllerAs: 'AllCampaignsCtrl',
			        data: {pageTitle: 'MintMesh ( Campaigns )'},
			        params: {share_status: 'web'}
			    })
			    .state('allCampaigns.jobDetails', {
			    	url: '/campaign/job-details/:share_status?ref?jc',
			        templateUrl: App.base_url + 'templates/email-parser/job-details.phtml',
			        controller: 'JobDetailsController',
			        controllerAs:'JobDetailsCtrl',
			        data : { pageTitle: 'MintMesh' },
			        params : {share_status : 'web', jc : '1'}
			    })
			    .state('allCampaigns.referralDetails', {
			        url: '/campaign/referral-details/:share_status?ref&flag&jc',
			        templateUrl: App.base_url + 'templates/email-parser/referral-details.phtml',
			        controller: 'ApplyJobController',
			        controllerAs: 'ApplyJobCtrl',
			        data: {pageTitle: 'MintMesh ( Refer )'},
			        params: {status: '', share_status: 'web', jc: '1', refrel : '0'}
			    })
			    .state('allCampaigns.candidateDetails', {
			    	url: '/campaign/candidate-details/:share_status?ref&flag&jc&refrel',
			    	templateUrl: App.base_url + 'templates/email-parser/candidate-details.phtml',
			    	controller: 'ApplyJobController',
			    	controllerAs:'ApplyJobCtrl',
			    	data : { pageTitle: 'MintMesh ( Apply )' },
			    	params : {status : '',share_status : 'web', jc : '1', refrel : '0'}
                })
                
                /* Assessment */
                .state('candidateAssessment', {
                    url: '/campaign/candidate-assessment/:share_status?ref&flag&jc&refrel',
                    templateUrl: App.base_url + 'templates/email-parser/assessment.phtml',
                    controller: 'AssessmentController',
                    controllerAs: 'AssessmentCtrl',
                    data: { pageTitle: 'Assessment' },
                    params : {status : '',share_status : 'web', jc : '1', refrel : '0'}
                })

                .state('checkAssessment', {
                    url: '/candidate-assessment/:assessmentId',
                    templateUrl: App.base_url + 'templates/email-parser/assessment.phtml',
                    controller: 'CheckAssessmentController',
                    controllerAs: 'CheckAssessmentCtrl',
                    data: { pageTitle: 'Assessment' }
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