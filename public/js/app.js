(function () {
"use strict";

angular.module('app', [
    'ui.router', 'ui.bootstrap',
    'app.constants', 'app.home', 'app.company.profile', 'app.import.contacts', 'app.emails', 'app.dashboard', 'app.engagement.contacts', 'app.post.job', 'app.job.search','app.job.details','app.rewards'
])

.constant('CONFIG', {
    'APP_NAME' : 'Mintmesh Enterprise',
    'APP_VERSION' : '1',
    'APP_API_VERSION': 'v1',
    'APP_API_DOMAIN' : 'http://202.63.105.85/mintmesh/',
    'CLIENT_ID' : '89sloYaTPSMKhbtl',
    'CLIENT_SECRET' : 'ssyZldw0tylSGPwy38FyFu90MeSIgbxC'
})

.config(function ($stateProvider, $urlRouterProvider, $locationProvider, App) {
    
    $locationProvider.html5Mode(false).hashPrefix('!');
    
    $stateProvider
    .state('home', {
        url: '/login',
        templateUrl: App.base_url + 'templates/home.phtml',
        controller: 'HomeController',
        controllerAs:'homeCtrl'
    })
    .state('companyProfile', {
        url: '/company-profile',
        templateUrl: App.base_url + 'templates/company-profile.phtml',
        controller: 'CompanyProfileController',
        controllerAs:'compCtrl'
    })
    .state('importContacts', {
        url: '/import-contacts',
        templateUrl: App.base_url + 'templates/import-contacts.phtml',
        controller: 'ImportContactsController',
        controllerAs:'importCtrl'
    })
    .state('importContactsList',{
        url:'/import-contacts',
        templateUrl: App.base_url + 'templates/import-contacts-list.phtml',
        controller:'ImportContactsListController',
        controllerAs:'ipContactListCtrl'
    })
    .state('emailVerify', {
        url: '/email-verify?token=',
        templateUrl: App.base_url + 'templates/emails/verify.phtml',
        controller: 'EmailVerificationController',
        controllerAs:'emailCtrl'
    })
     .state('invitecontacts', {
        url: '/invite-contacts',
        templateUrl: App.base_url + 'templates/invite-to-MM-contacts.phtml',
        controller: 'InviteContacts',
        controllerAs:'invConts'
    })
    .state('app',{
        abstract: true,
        url: '/dash',
        templateUrl: App.base_url + 'templates/app.phtml',
        controller: ''
    })
    .state('app.dashboard',{
        url: '^/dashboard',
        templateUrl: App.base_url + 'templates/dashboard.phtml',
        controller:'DashboardController',
        controllerAs:'DashCtrl'
    })
    .state('app.engagement/contacts',{
        url: '^/job/engagement-contacts',
        templateUrl: App.base_url + 'templates/engagement-contacts.phtml',
        controller: 'EngagementContactsController',
        controllerAs: 'EngContCtrl'
    })
    .state('app.job',{
        url: '^/job',
        templateUrl: App.base_url + 'templates/job.phtml',
        controller: 'JobSearchController',
        controllerAs: 'jobSearchCtrl'
    })
    .state('app.postJob',{
        url: '^/job/post-job',
        templateUrl: App.base_url + 'templates/post-job.phtml',
        controller: 'PostJobController',
        controllerAs: 'PtJobCtrl'
    })
     .state('app.postJob2',{
        url: '^/job/post-job-2',
        templateUrl: App.base_url + 'templates/post-job-2.phtml',
        controller: 'PostJobTwoController',
        controllerAs: 'post2Ctrl'

    })
    .state('app.jobDetails',{
        url: '^/job/job-details',
        templateUrl: App.base_url + 'templates/job-details.phtml',
        controller: 'JobDetailsController',
        controllerAs: 'jobDetailsCtrl'
    })
    .state('app.importContactsList',{
        url:'^/import-contacts-list',
        templateUrl: App.base_url + 'templates/import-contacts-list.phtml',
        controller:'ImportContactsListController',
        controllerAs:'ipContactListCtrl'
    })
    .state('app.rewards',{
        url: '^/job/rewards',
        templateUrl: App.base_url + 'templates/rewards.phtml',
        controller: 'RewardsController',
        controllerAs: 'RewardCtrl'
    })
    $urlRouterProvider.otherwise('/login');
    
});
    
}());
