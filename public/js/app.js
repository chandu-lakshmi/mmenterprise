(function () {
"use strict";

angular.module('app', [
    'ui.router', 'ui.bootstrap',
    'app.constants', 'app.home', 'app.forgotPassword', 'app.company.profile', 'app.import.contacts', 'app.emails', 'app.dashboard',
    'app.engagement.contacts', 'app.post.job', 'app.job.search', 'app.job.details', 'app.rewards', 'app.edit.company', 'app.contact',
    'app.candidates'
])

.constant('CONFIG', {
    'APP_NAME' : 'Mintmesh Enterprise',
    'APP_VERSION' : '1',
    'APP_API_VERSION': 'v1',
    'APP_API_DOMAIN' : '',
    'CLIENT_ID' : 'G7iLdQoeZy0Ef06C',
    'CLIENT_SECRET' : 'Dh0pMLSV6Y82EfDpGKlWN1AyzvWvbvz4'
})

.config(function ($stateProvider, $urlRouterProvider, $locationProvider, App, CONFIG) {
    
    $locationProvider.html5Mode(true);
    //$locationProvider.html5Mode(false).hashPrefix('!');

    // overwriting APP_API_DOMAIN constant from index.phtml
    // JS global variable
    CONFIG.APP_API_DOMAIN = App.API_DOMAIN;
    CONFIG.APP_DOMAIN     = App.base_url;
    
    $stateProvider
    .state('home', {
        url: '/login',
        templateUrl: App.base_url + 'templates/home.phtml',
        controller: 'HomeController',
        controllerAs:'homeCtrl',
        // data : { pageTitle: 'Home' }
    })
    .state('forgotPassword',{
        url:'/reset_password',
        templateUrl : App.base_url + 'templates/forgot-password.phtml',
        controller:'ForgotPassword',
        controllerAs:'forgotCtrl'
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
        url: '/email-verify',
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
        url: '^/job/engagement-contacts/:post_id',
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
        url: '^/job/job-details/:post_id',
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
        url: '^/job/rewards/:post_id',
        templateUrl: App.base_url + 'templates/rewards.phtml',
        controller: 'RewardsController',
        controllerAs: 'RewardCtrl'
    })
    .state('app.editCompanyProfile',{
        url: '^/edit-company-profile',
        templateUrl: App.base_url + 'templates/edit-company-profile.phtml',
        controller: 'editCompanyProfileController',
        controllerAs: 'editCompCtrl'
    })
    .state('app.contact',{
        url: '^/contacts',
        templateUrl: App.base_url + 'templates/contacts.phtml',
        controller: 'ContactsController',
        controllerAs: 'ContactCtrl'
    })
    .state('app.uploadContact',{
        url: '^/contacts/upload-contacts',
        templateUrl: App.base_url + 'templates/upload-contacts.phtml',
        controller: 'UploadContactsController',
        controllerAs: 'UploadContCtrl'
    })
    .state('app.candidates',{
        url: '^/candidates',
        templateUrl: App.base_url + 'templates/candidates.phtml',
        controller: 'CandidatesController',
        controllerAs: 'CandidatesCtrl'
    })

    $urlRouterProvider.otherwise('/login');
    
})

/*.run([ '$rootScope', '$state', '$stateParams',
    function ($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }
])*/
    
}());
