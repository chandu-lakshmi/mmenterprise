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
    'APP_API_DOMAIN' : 'http://192.168.33.10/mintmesh/'
})

.config(function ($stateProvider, $urlRouterProvider, $locationProvider, App) {
    
    $locationProvider.html5Mode(false).hashPrefix('!');
    
    $stateProvider
    .state('home', {
        url: '/home',
        templateUrl: App.base_url + 'public/templates/home.html',
        controller: 'HomeController',
        controllerAs:'homeCtrl'
    })
    .state('companyProfile', {
        url: '/company-profile',
        templateUrl: App.base_url + 'public/templates/company-profile.html',
        controller: 'CompanyProfileController',
        controllerAs:'compCtrl'
    })
    .state('importContacts', {
        url: '/import-contacts',
        templateUrl: App.base_url + 'public/templates/import-contacts.html',
        controller: 'ImportContactsController',
        controllerAs:'importCtrl'
    })
    .state('importContactsList',{
        url:'/import-contacts',
        templateUrl: App.base_url + 'public/templates/import-contacts-list.html',
        controller:'ImportContactsListController',
        controllerAs:'ipContactListCtrl'
    })
    .state('emailVerify', {
        url: '/email-verify?token=',
        templateUrl: App.base_url + 'public/templates/emails/verify.html',
        controller: 'EmailVerificationController',
        controllerAs:'emailCtrl'
    })
     .state('invitecontacts', {
        url: '/invite-contacts',
        templateUrl: App.base_url + 'public/templates/invite-to-MM-contacts.html',
        controller: 'InviteContacts',
        controllerAs:'invConts'
    })
    .state('app',{
        abstract: true,
        url: '/dash',
        templateUrl: App.base_url + 'public/templates/app.html',
        controller: ''
    })
    .state('app.dashboard',{
        url: '^/dashboard',
        templateUrl: App.base_url + 'public/templates/dashboard.html',
        controller:'DashboardController',
        controllerAs:'DashCtrl'
    })
    .state('app.engagement/contacts',{
        url: '^/job/engagement-contacts',
        templateUrl: App.base_url + 'public/templates/engagement-contacts.html',
        controller: 'EngagementContactsController',
        controllerAs: 'EngContCtrl'
    })
    .state('app.job',{
        url: '^/job',
        templateUrl: App.base_url + 'public/templates/job.html',
        controller: 'JobSearchController',
        controllerAs: 'jobSearchCtrl'
    })
    .state('app.postJob',{
        url: '^/job/post-job',
        templateUrl: App.base_url + 'public/templates/post-job.html',
        controller: 'PostJobController',
        controllerAs: 'PtJobCtrl'
    })
     .state('app.postJob2',{
        url: '^/job/post-job-2',
        templateUrl: App.base_url + 'public/templates/post-job-2.html',
        controller: 'PostJobTwoController',
        controllerAs: 'post2Ctrl'

    })
    .state('app.jobDetails',{
        url: '^/job/job-details',
        templateUrl: App.base_url + 'public/templates/job-details.html',
        controller: 'JobDetailsController',
        controllerAs: 'jobDetailsCtrl'
    })
    .state('app.importContactsList',{
        url:'^/import-contacts-list',
        templateUrl: App.base_url + 'public/templates/import-contacts-list.html',
        controller:'ImportContactsListController',
        controllerAs:'ipContactListCtrl'
    })
    .state('app.rewards',{
        url: '^/job/rewards',
        templateUrl: App.base_url + 'public/templates/rewards.html',
        controller: 'RewardsController',
        controllerAs: 'RewardCtrl'
    })
    $urlRouterProvider.otherwise('/home');
    
});
    
}());