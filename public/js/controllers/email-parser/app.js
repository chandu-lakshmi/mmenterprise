(function () {
"use strict";

	angular
		.module('emailParser', ['ui.router',
			'app.constants', 'app.all.jobs','app.candidate.details','app.referral.details','app.lib'
		])


		.config(function ($stateProvider, $urlRouterProvider, $locationProvider, App) {
    
    		$locationProvider.html5Mode(true);

    		$stateProvider
    			.state('allJobs', {
			        url: '/all-jobs',
			        templateUrl: App.base_url + 'templates/email-parser/all-jobs.phtml',
			        controller: 'AllJobsController',
			        controllerAs:'AllJobsCtrl',
			        data : { pageTitle: 'Mintmesh ( Jobs )' }
			    })
			    .state('candidateDetails', {
			        url: '/candidate-details',
			        templateUrl: App.base_url + 'templates/email-parser/candidate-details.phtml',
			        controller: 'UploadController',
			        controllerAs:'UploadCtrl',
			        data : { pageTitle: 'Mintmesh ( Upload CV )' }
			    })
			    .state('referralDetails', {
			        url: '/referral-details',
			        templateUrl: App.base_url + 'templates/email-parser/referral-details.phtml',
			        controller: 'UploadController',
			        controllerAs:'UploadCtrl',
			        data : { pageTitle: 'Mintmesh ( Drop CV )' }
			    })

    		$urlRouterProvider.otherwise('/all-jobs');
    
		})


		.run([ '$rootScope', '$state', '$stateParams',
		    function ($rootScope, $state, $stateParams) {
		        $rootScope.$state = $state;
		        $rootScope.$stateParams = $stateParams;
		    }
		])

}());