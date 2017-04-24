(function () {
    "use strict";

    angular.module('app', ['ui.router', 'ui.bootstrap',
        'app.constants',
        'app.components', 'app.helpers', 'app.services', 'app.constantKeys',
        'app.home', 'app.forgotPassword', 'app.company.profile', 'app.import.contacts', 'app.emails', 'app.dashboard',
        'app.engagement.contacts', 'app.post.job', 'app.job.search', 'app.job.details', 'app.rewards', 'app.edit.company', 'app.contact',
        'app.candidates', 'app.campaigns', 'app.settings', 'app.license.management'
    ])

            .constant('CONFIG', {
                'APP_NAME': 'Mintmesh Enterprise',
                'APP_VERSION': '1',
                'APP_API_VERSION': 'v1',
                'APP_API_DOMAIN': '',
                'CLIENT_ID': 'G7iLdQoeZy0Ef06C',
                'CLIENT_SECRET': 'Dh0pMLSV6Y82EfDpGKlWN1AyzvWvbvz4'
            })

            .config(function ($stateProvider, $urlRouterProvider, $locationProvider, App, CONFIG, userPermissions) {

                $locationProvider.html5Mode(true);
                //$locationProvider.html5Mode(false).hashPrefix('!');

                // overwriting APP_API_DOMAIN constant from index.phtml
                // JS global variable
                CONFIG.APP_API_DOMAIN = App.API_DOMAIN;
                CONFIG.APP_DOMAIN = App.base_url;
                
                // Federated
                $stateProvider.state('company', {
                    url: '/company/:com_name/:com_cod',
                    templateUrl: App.base_url + 'templates/home.phtml',
                    controller: 'HomeController',
                    controllerAs: 'homeCtrl'
                })
                
                $stateProvider.state('home', {
                    url: '/login',
                    templateUrl: App.base_url + 'templates/home.phtml',
                    controller: 'HomeController',
                    controllerAs: 'homeCtrl',
                    // data : { pageTitle: 'Home' }
                })
                $stateProvider.state('forgotPassword', {
                    url: '/reset_password',
                    templateUrl: App.base_url + 'templates/forgot-password.phtml',
                    controller: 'ForgotPassword',
                    controllerAs: 'forgotCtrl'
                })
                $stateProvider.state('companyProfile', {
                    url: '/company-profile',
                    templateUrl: App.base_url + 'templates/company-profile.phtml',
                    controller: 'CompanyProfileController',
                    controllerAs: 'compCtrl'
                })
                $stateProvider.state('importContacts', {
                    url: '/import-contacts',
                    templateUrl: App.base_url + 'templates/import-contacts.phtml',
                    controller: 'UploadContactsController',
                    controllerAs: 'UploadContCtrl',
                    resolve: {
                        defaultFunction: function () {
                        },
                        getBuckets: function () {
                        },
                        $uibModalInstance: function () {
                        }
                    },
                    params: {
                        importContacts: true
                    }
                })
                $stateProvider.state('importContactsList', {
                    url: '/import-contacts',
                    templateUrl: App.base_url + 'templates/import-contacts-list.phtml',
                    params: {
                        rowEdit: 0
                    },
                    controller: 'ContactsController',
                    controllerAs: 'ContactCtrl'
                })
                $stateProvider.state('emailVerify', {
                    url: '/email-verify',
                    templateUrl: App.base_url + 'templates/emails/verify.phtml',
                    controller: 'EmailVerificationController',
                    controllerAs: 'emailCtrl'
                })
                $stateProvider.state('app', {
                    abstract: true,
                    url: '/dash',
                    templateUrl: App.base_url + 'templates/app.phtml',
                    controller: ''
                })
                if (userPermissions.dashboard == '1') {
                    $stateProvider.state('app.dashboard', {
                        url: '^/dashboard',
                        templateUrl: App.base_url + 'templates/dashboard.phtml',
                        controller: 'DashboardController',
                        controllerAs: 'DashCtrl'
                    })
                }
                $stateProvider.state('app.job', {
                    url: '^/job',
                    templateUrl: App.base_url + 'templates/job.phtml',
                    controller: 'JobSearchController',
                    controllerAs: 'jobSearchCtrl'
                })
                $stateProvider.state('app.postJob', {
                    url: '^/job/post-job',
                    templateUrl: App.base_url + 'templates/post-job.phtml',
                    controller: 'PostJobController',
                    controllerAs: 'PtJobCtrl'
                })
                $stateProvider.state('app.postJob2', {
                    url: '^/job/post-job-2',
                    templateUrl: App.base_url + 'templates/post-job-2.phtml',
                    controller: 'PostJobTwoController',
                    controllerAs: 'post2Ctrl'

                })
                $stateProvider.state('app.jobDetails', {
                    url: '^/job/job-details/:post_id',
                    templateUrl: App.base_url + 'templates/job-details.phtml',
                    controller: 'JobDetailsController',
                    controllerAs: 'jobDetailsCtrl'
                })
                $stateProvider.state('app.engagement/contacts', {
                    url: '^/job/engagement-contacts/:post_id',
                    templateUrl: App.base_url + 'templates/engagement-contacts.phtml',
                    controller: 'EngagementContactsController',
                    controllerAs: 'EngContCtrl'
                })
                $stateProvider.state('app.rewards', {
                    url: '^/job/rewards/:post_id',
                    templateUrl: App.base_url + 'templates/rewards.phtml',
                    controller: 'RewardsController',
                    controllerAs: 'RewardCtrl'
                })
                $stateProvider.state('app.contact', {
                    url: '^/contacts',
                    templateUrl: App.base_url + 'templates/contacts.phtml',
                    params: {
                        rowEdit: 1
                    },
                    controller: 'ContactsController',
                    controllerAs: 'ContactCtrl'
                })
                $stateProvider.state('app.candidates', {
                    url: '^/candidates',
                    templateUrl: App.base_url + 'templates/candidates/candidates.phtml',
                    controller: 'CandidateController',
                    controllerAs: 'CandidateCtrl'
                })
                $stateProvider.state('app.candidates.resumeRoom', {
                    url: '^/candidates/resume-room',
                    templateUrl: App.base_url + 'templates/candidates/resume-room.phtml',
                    controller: 'ResumeRoomController',
                    controllerAs: 'ResumeRoomCtrl'
                })
                $stateProvider.state('app.campaigns', {
                    url: '^/campaigns',
                    templateUrl: App.base_url + 'templates/campaigns/campaigns.phtml',
                    controller: 'CampaignsController',
                    controllerAs: 'CampaignsCtrl'
                })
                $stateProvider.state('app.campaigns.allCampaigns', {
                    url: '^/campaigns/all-campaigns',
                    params: {
                        all_campaigns: 1
                    },
                    data: {all: 0},
                    templateUrl: App.base_url + 'templates/campaigns/all-campaigns.phtml',
                    controller: 'AllCampaignsController',
                    controllerAs: 'AllCampaignsCtrl'
                })
                $stateProvider.state('app.campaigns.myCampaigns', {
                    url: '^/campaigns/my-campaigns',
                    params: {
                        all_campaigns: 0
                    },
                    data: {all: 1},
                    templateUrl: App.base_url + 'templates/campaigns/all-campaigns.phtml',
                    controller: 'AllCampaignsController',
                    controllerAs: 'AllCampaignsCtrl'
                })
                $stateProvider.state('app.campaigns.editCampaigns', {
                    url: '^/campaigns/edit-campaigns',
                    templateUrl: App.base_url + 'templates/campaigns/edit-campaigns.phtml',
                    controller: 'EditCampaignsController',
                    controllerAs: 'EditCampaignsCtrl'
                })
                $stateProvider.state('app.settings', {
                    url: '^/settings',
                    templateUrl: App.base_url + 'templates/settings/settings.phtml',
                    controller: 'SettingsController',
                    controllerAs: 'SettingsCtrl'
                })
                $stateProvider.state('app.settings.companyProfile', {
                    url: '^/settings/company-profile',
                    templateUrl: App.base_url + 'templates/settings/company-profile.phtml',
                    controller: 'SettingsCompanyProfileController',
                    controllerAs: 'CompanyProfileCtrl'
                })
                $stateProvider.state('app.settings.myProfile', {
                    url: '^/settings/my-profile',
                    templateUrl: App.base_url + 'templates/settings/my-profile.phtml',
                    controller: 'MyProfileController',
                    controllerAs: 'MyProfileCtrl'
                })
                $stateProvider.state('app.settings.userGroups', {
                    url: '^/settings/user-group',
                    templateUrl: App.base_url + 'templates/settings/user-group.phtml',
                    controller: 'UserGroupController',
                    controllerAs: 'UserGroupCtrl'
                })
                $stateProvider.state('app.settings.configManager', {
                    url: '^/settings/configuration-manager',
                    templateUrl: App.base_url + 'templates/settings/configuration-manager.phtml',
                    controller: 'ConfigManagerController',
                    controllerAs: 'ConfigMngCtrl'
                })
                $stateProvider.state('app.settings.intManager', {
                    url: '^/settings/integration-manager',
                    templateUrl: App.base_url + 'templates/settings/integration-manager.phtml',
                    controller: 'IntManagerController',
                    controllerAs: 'IntMngCtrl'
                })
                $stateProvider.state('app.editCompanyProfile', {
                    url: '^/edit-company-profile',
                    templateUrl: App.base_url + 'templates/edit-company-profile.phtml',
                    controller: 'editCompanyProfileController',
                    controllerAs: 'editCompCtrl'
                })
                $stateProvider.state('app.licenseManagement', {
                    url: '^/license-management',
                    templateUrl: App.base_url + 'templates/license-management/license.phtml',
                    controller: 'licenseManagementController',
                    controllerAs: 'licMangCtrl'
                })
                $stateProvider.state('app.mintbot', {
                    url: '^/mintbot',
                    templateUrl: App.base_url + 'templates/mintbot.phtml',
                    controller: '',
                    controllerAs: '',
                    // data : { pageTitle: 'Home' }
                })

                // doc viewer
                $stateProvider.state('viewer', {
                    url: '/viewer?url',
                    templateUrl: App.base_url + 'templates/file-viewer/index-viewer.phtml'
                })


                $stateProvider.state('404', {
                    url: '/404',
                    templateUrl: App.base_url + 'templates/admin/404.phtml',
                })

                $urlRouterProvider.otherwise('/login');

            })

            .run(function ($rootScope, userPermissions, CompanyDetails, App) {
                $rootScope.$root = App;
                $rootScope.userPermissions = userPermissions;
                $rootScope.companyDetails = CompanyDetails
                $rootScope.SocialShare = {};
            })

            .run(['$rootScope', '$state', '$stateParams',
                function ($rootScope, $state, $stateParams) {
                    $rootScope.$state = $state;
                    $rootScope.$stateParams = $stateParams;
                }
            ])

}());
