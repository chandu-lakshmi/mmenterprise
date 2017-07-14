(function () {
    "use strict";

    angular
            .module('app.email.parser', ['infinite-scroll'])
            .controller('modalController', modalController)
            .controller('AllJobsController', AllJobsController)
            .controller('JobDetailsController', JobDetailsController)
            .controller('ApplyJobController', ApplyJobController)
            .controller('AllCampaignsController', AllCampaignsController)

    modalController.$injext = ['$scope', '$state', '$stateParams', '$uibModalInstance', 'App'];
    AllJobsController.$inject = ['$http', '$stateParams', '$q', 'ReferralDetails', 'App'];
    JobDetailsController.$inject = ['$http', '$stateParams', '$window', 'App'];
    ApplyJobController.$inject = ['$scope', '$state', '$stateParams', '$location', '$window', '$http', '$uibModal', 'App', 'ReferralDetails', 'CampaignDetails', 'campaignJobDetails'];
    AllCampaignsController.$inject = ['$http', '$window', '$q', 'App', 'CampaignDetails', 'campaignJobDetails'];


    function modalController($scope, $state, $stateParams, $uibModalInstance, App) {

        var vm = this;

        vm.close = close;
        vm.jump = jump;
        var refCode = $stateParams.jc == 1 ? App.camp_ref : App.ref;
        function close() {
            if ($stateParams.jc == 1)
                $state.go('allCampaigns', {ref: refCode, share_status: $state.params.share_status})
            else
                $state.go('allJobs', {ref: App.ref, share_status: $state.params.share_status})
        }

        function jump() {
            $state.go('referralDetails', {ref: $stateParams.ref, flag: 1, jc: $state.params.jc, share_status: $state.params.share_status})
        }

        $scope.$on('$stateChangeSuccess', function () {
            $uibModalInstance.dismiss('cancel');
        })
    }

    function AllJobsController($http, $stateParams, $q, ReferralDetails, App) {

        var vm = this,
                canceler;

        if (screen.width <= 480)
            vm.copyText = 'Copy'
        else
            vm.copyText = 'COPY JOBS LINK'

        // capitalize string in javascript
        function toTitleCase(str) {
            return str.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }
        
        function load(url){
            App.Helpers.loadImage({
                target: $('#logo'),
                css: '',
                url_prefix: false,
                url: url,
                onComplete: function () {console.log('shiva')
                    
                },
                onError: function () {
                    
                }
            });
        }

        vm.bol = true;
        vm.noLongerAvailable = false;
        vm.shareUrl = App.base_url + 'email/all-jobs/share?ref=' + App.ref;
        // vm.copyUrl = $location.$$absUrl;
        vm.job_name = [];

        var page_no = 1, total_pages = 1;

        vm.search_val = '';
        vm.loader = false;
        vm.noJobs = false;

        vm.infiniteScroll = {
            busy: false,
            list: [],
            url: App.base_url + 'apply_jobs_list',
            nextPage: function () {
            },
            loadApi: function () {
            },
            onComplete: function (obj) {
                vm.infiniteScroll.busy = false;
                for (var i = 0; i < obj.jobs_list.length; i++) {
                    vm.infiniteScroll.list.push(obj.jobs_list[i]);
                    if (i <= 3) {
                        vm.job_name[i] = obj.jobs_list[i].job_name;
                    }
                }
                vm.infiniteScroll.companyName = obj.company_name;
                vm.infiniteScroll.company_logo = obj.company_logo || '';
                vm.copyUrl = obj.bittly_url;
                sharing(vm.copyUrl);
                if (vm.infiniteScroll.company_logo != '') {
                    load(vm.infiniteScroll.company_logo)
                }
            },
            onError: function () {
                $window.location = App.base_url + 'logout';
            }
        }

        vm.infiniteScroll.nextPage = function () {
            if (total_pages >= page_no && total_pages != 0) {
                if (vm.infiniteScroll.busy) {
                    return;
                }

                vm.infiniteScroll.busy = true;

                vm.infiniteScroll.loadApi(page_no, vm.search_val);
            }
        }

        vm.infiniteScroll.loadApi = function (pageNo, searchVal, callBack) {

            var share = $stateParams.share_status == 'web' ? 0 : 1;
            if ($stateParams.jc == 2) {
                share = 1;
            }

            if (canceler) {
                canceler.resolve();
            }

            canceler = $q.defer();

            $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: vm.infiniteScroll.url,
                data: $.param({
                    reference_id: App.ref,
                    page_no: pageNo,
                    search: searchVal,
                    share: share
                }),
                timeout: canceler.promise
            })
                    .then(function (response) {
                        vm.loader = false;
                        if (response.data.status_code == 200) {
                            if (callBack != undefined) {
                                callBack();
                                vm.infiniteScroll.list = [];
                            }
                            if (page_no == 1) {
                                vm.infiniteScroll.total_count = response.data.data.count;
                                total_pages = Math.ceil(vm.infiniteScroll.total_count / 10);
                            }
                            page_no++;
                            vm.infiniteScroll.onComplete(response.data.data)
                        }
                        else if (response.data.status_code == 403) {

                            vm.noLongerAvailable = response.data.message.msg[0];
                            vm.infiniteScroll.company_logo = '';
                            vm.infiniteScroll.busy = false;
                            pageNo++;
                            /*vm.infiniteScroll.list = [];
                            vm.noJobs = true;
                            vm.infiniteScroll.total_count = 0;
                            total_pages = 0;
                            if (callBack != undefined) {
                                callBack();
                            }*/
                        }
                        else if (response.data.status_code == 400) {
                            vm.infiniteScroll.onError();
                        }
                    })
        }

        // epi search directive
        vm.search_opts = {
            delay: 500,
            progress: false,
            complete: false,
            placeholder: 'Search Job Title/Location',
            onSearch: function (val) {
                vm.search_val = val;
                page_no = 1;
                total_pages = 0;
                vm.noJobs = false;
                vm.loader = true;
                if (vm.search_opts.progress) {
                    if (vm.search_opts.value) {
                        vm.infiniteScroll.loadApi(page_no, vm.search_val, function () {
                            vm.infiniteScroll.list = [];
                            vm.search_opts.progress = false;
                            vm.search_opts.complete = true;
                        });
                    }
                }
            },
            onClear: function () {
                vm.search_val = "";
                page_no = 1;
                total_pages = 0;
                vm.noJobs = false;
                vm.loader = true;
                vm.infiniteScroll.loadApi(page_no, vm.search_val, function () {
                    vm.infiniteScroll.list = [];
                });
            }
        }

        // social sharing directive
        function sharing(bitly) {
            var desc = '';
            if (vm.job_name[1] != undefined)
                desc = toTitleCase(vm.job_name[0]) + ', ' + toTitleCase(vm.job_name[1]) + '...';
            if (vm.job_name[2] != undefined)
                desc = toTitleCase(vm.job_name[0]) + ', ' + toTitleCase(vm.job_name[1]) + ', ' + toTitleCase(vm.job_name[2]) + ' ...'
            else
                desc = toTitleCase(vm.job_name[0]);

            vm.socialMedia = {
                socialIcons: ['facebook', 'twitter', 'linkedin', 'googlePlus'],
                url: vm.shareUrl,
                facebook: {
                    post_title: 'These jobs are available in ' + toTitleCase(vm.infiniteScroll.companyName),
                    post_url: vm.shareUrl,
                    post_img: vm.infiniteScroll.company_logo || '',
                    post_msg: desc
                },
                twitter: {
                    text: 'These jobs are available in ' + toTitleCase(vm.infiniteScroll.companyName) + '. ' + desc,
                    url: bitly || vm.shareUrl,
                    hashtags: '',
                    via: vm.infiniteScroll.companyName,
                    related: ''
                },
                linkedin: {
                    url: bitly || vm.shareUrl,
                    title: 'These jobs are available in ' + toTitleCase(vm.infiniteScroll.companyName),
                    summary: desc,
                    source: vm.infiniteScroll.companyName
                },
                googlePlus: {
                    url: vm.shareUrl
                }
            }
        }

        vm.updateReferralDetails = function(job) {
            ReferralDetails.job_title = job.job_name;
            ReferralDetails.experience = job.experience;
            ReferralDetails.location = job.location;
        }

    }

    function JobDetailsController($http, $stateParams, $window, App) {

        var vm = this;

        var ref = $stateParams.ref;
        vm.shareUrl = App.base_url + 'email/job-details/share?ref=' + ref;
        if (screen.width <= 480)
            vm.copyText = 'Copy'
        else
            vm.copyText = 'COPY JOB LINK'
        // vm.copyUrl = $location.$$absUrl;

        // capitalize string in javascript
        function toTitleCase(str) {
            return str.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }
        vm.noLongerAvailable = false;
        vm.job_details = {
            list: [],
            loader: false,
            url: App.base_url + 'apply_job_details',
            onload: function () {
            },
            onComplete: function (obj) {
                vm.job_details.list = obj.job_details;
                vm.job_details.companyName = obj.company_name;
                vm.job_details.company_logo = obj.company_logo || '';
                vm.copyUrl = obj.bittly_url;
                sharing(vm.copyUrl);
                if (vm.job_details.company_logo != '') {
                    $('header img').on('load', function () {
                        this.className = '';
                        $(this).attr('height', App.Components.aspectRatio({domTarget: $(this)[0]}) + 'px');
                    })
                }
                else {
                    $('header img').remove();
                }
            },
            onError: function () {
                $window.location = App.base_url + 'logout';
            }
        }

        vm.job_details.onload = function () {
            vm.job_details.loader = true;
            $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: vm.job_details.url,
                data: $.param({
                    reference_id: ref
                })
            })
                    .then(function (response) {
                        vm.job_details.loader = false;
                        if (response.data.status_code == 200) {
                            vm.job_details.onComplete(response.data.data)
                        }
                        else if(response.data.status_code == 403) {
                            vm.noLongerAvailable = response.data.message.msg[0];
                        }
                        else if (response.data.status_code == 400) {
                            vm.job_details.onError();
                        }
                    })
        }

        vm.job_details.onload();

        function sharing(bitly) {
            vm.socialMedia = {
                socialIcons: ['facebook', 'twitter', 'linkedin', 'googlePlus'],
                url: vm.shareUrl,
                facebook: {
                    post_title: toTitleCase(vm.job_details.companyName) + ' looking for ' + toTitleCase(vm.job_details.list[0].job_name),
                    post_url: vm.shareUrl,
                    post_img: vm.job_details.company_logo || '',
                    post_msg: 'Experience : ' + vm.job_details.list[0].experience + ', Location : ' + vm.job_details.list[0].location
                },
                twitter: {
                    text: toTitleCase(vm.job_details.companyName) + ' looking for ' + toTitleCase(vm.job_details.list[0].job_name) +
                            ', Experience : ' + vm.job_details.list[0].experience + ', Location : ' + vm.job_details.list[0].location,
                    hashtags: '',
                    via: vm.job_details.companyName,
                    related: '',
                    url: bitly || vm.shareUrl
                },
                linkedin: {
                    url: bitly || vm.shareUrl,
                    title: toTitleCase(vm.job_details.companyName) + ' looking for ' + toTitleCase(vm.job_details.list[0].job_name),
                    summary: 'Experience : ' + vm.job_details.list[0].experience + ', Location : ' + vm.job_details.list[0].location,
                    source: vm.job_details.companyName
                },
                googlePlus: {
                    url: vm.shareUrl
                }
            }
        }

    }

    function ApplyJobController($scope, $state, $stateParams, $location, $window, $http, $uibModal, App, ReferralDetails, CampaignDetails, campaignJobDetails) {

        var vm = this;

        vm.status = $location.search().flag;
        vm.backendError = '';
        vm.loader = false;
        vm.viewReferralDetails = true; /*hide the job details for Drop cv */
        vm.backendMsg = '';


        /*Job Details in header like title, location, exp*/
        if ($stateParams.jc == 0 || $stateParams.jc == 2) {
            vm.jobDetails = ReferralDetails;
        }else{
            vm.jobDetails = campaignJobDetails;
        }


        // Job Functions Dropdown
        var get_job_functions = $http({
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            method: 'GET',
            url: App.base_url + 'get_job_functions'
        })
        get_job_functions.success(function (response) {
            vm.jobFunctions = response.data.job_functions;
        })

        // pagetitle
        if ($stateParams.flag == 1) {
            vm.viewReferralDetails = false;
            $state.current.data.pageTitle = 'MintMesh ( Drop CV )';
        }
        else if ($state.current.name == 'candidateDetails') {
            $state.current.data.pageTitle = 'MintMesh ( Apply )';
        }
        else {
            $state.current.data.pageTitle = 'MintMesh ( Refer )';
        }

        if ($stateParams.share_status == 'share') {
            if ($stateParams.jc == 0 || $stateParams.jc == 2){
                vm.referralDetails = angular.copy(ReferralDetails);
            }
            else{
                vm.referralDetails = angular.copy(CampaignDetails);
            }
            if ($state.current.name == 'candidateDetails') {
                vm.shareReferral = angular.copy(ReferralDetails.emailid);
                vm.referralDetails.emailid = '';
            }
        }
        else {
            // vm.referralDetails = ReferralDetails;
            if ($stateParams.jc == 0 || $stateParams.jc == 2)
                vm.referralDetails = angular.copy(ReferralDetails);
            else
                vm.referralDetails = angular.copy(CampaignDetails);
        }

        // console.log(vm.referralDetails)

        $('h1.logo img').on('load', function () {
            $(this).attr('height', App.Components.aspectRatio({domTarget: $(this)[0]}) + 'px');
        })

        var ref = $stateParams.ref;
        var apiCall = App.base_url + 'apply_job';
        if($stateParams.refrel != 0 && $state.current.name == 'candidateDetails'){
            apiCall = App.base_url + 'apply_job_ref';
        }

        this.fileName = 'Select a file to upload...';

        $("#can-mobile").intlTelInput({
            preferredCountries: ['us', 'in', 'gb'],
            nationalMode: false,
            initialCountry: "us",
            separateDialCode: true

        });

        if ($stateParams.status == 'CLOSED') {
            if ($stateParams.flag != 1) {
                $uibModal.open({
                    animation: true,
                    backdrop: 'static',
                    keyboard: false,
                    templateUrl: '../templates/email-parser/dialog-post-experied.phtml',
                    controller: 'modalController',
                    controllerAs: 'modalCtrl'
                });
            }
        }
        else if ($stateParams.status.length == 0) {
            if (CampaignDetails.post_status == 'CLOSED' || ReferralDetails.post_status == 'CLOSED') {
                if ($stateParams.flag != 1) {
                    $uibModal.open({
                        animation: true,
                        backdrop: 'static',
                        keyboard: false,
                        templateUrl: '../templates/email-parser/dialog-post-experied.phtml',
                        controller: 'modalController',
                        controllerAs: 'modalCtrl'
                    });
                }
            }
        }

        vm.postFormData = postFormData;

        /*Remove file upload mandatory for referal details and flag=0 */
        if($state.current.name == 'referralDetails' && ($stateParams.flag != 1 || $stateParams.jc == 1)){
            vm.chkFile = false;
        }else{
            vm.chkFile = true;
        }
        vm.hasResumeUpload = vm.chkFile;

        function postFormData(formValid, flag) {

            vm.backendError = '';

            /*if (formValid || vm.chkFile) {
                vm.errorRequired = true;
                return;
            }*/

            if (formValid || vm.chkFile) {
                vm.errorRequired = true;
                return;
            }
            else {
                vm.loader = true;
                angular.element('.footer .disabled').css('pointer-events', 'none');
                var data = $('form[name="' + flag + '_form"]').serialize();
                var backEndParams = {
                    ref: ref,
                    flag: vm.status,
                    timeZone: new Date().getTimezoneOffset()
                };

                if($stateParams.jc == 2){
                    angular.extend(backEndParams, {post_id : vm.referralDetails.post_id, refrel : vm.referralDetails.refrel});
                }

                $http({
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    method: 'POST',
                    url: apiCall,
                    data: data + '&' + $.param(backEndParams)
                })
                        .then(function (response) {
                            vm.loader = false;
                            angular.element('.footer .disabled').css('pointer-events', 'auto');
                            if (response.data.status_code == 200) {
                                vm.backendMsg = response.data.message.msg[0];
                                if ($stateParams.jc == 0) {
                                    setTimeout(function () {
                                        $state.go('allJobs', {ref: ref, share_status: $stateParams.share_status})
                                    }, 1000);
                                }
                                else if($stateParams.jc == 2){
                                    setTimeout(function () {
                                        $state.go('allJobs', {ref: vm.referralDetails.ref, share_status: $stateParams.share_status, jc : 2})
                                    }, 1000);
                                }
                                else {
                                    setTimeout(function () {
                                        $state.go('allCampaigns', {ref: App.camp_ref, share_status: $stateParams.share_status})
                                    }, 1000);
                                }
                            }
                            else if (response.data.status_code == 403) {
                                vm.backendError = response.data.message.msg[0];
                            }
                            else if (response.data.status_code == 400) {
                                $window.location = App.base_url + 'logout';
                            }
                        });
            }
        }

        var bonus_file_path;
        var $upload_resume = $('#upload-resume');
        App.Helpers.initUploader({
            id: "upload-resume",
            dragText: "",
            uploadButtonText: "SELECT FILE",
            size: (1 * 1024 * 1024),
            allowedExtensions: ["DOC", "PDF", "RTF", "DOCX"],
            action: App.base_url + "resume_file_upload",
            showFileInfo: false,
            shortMessages: true,
            remove: false,
            file_name: 'resume_original_name',
            path_name: 'cv',
            onSubmit: function (id, name) {
                $('.file-check').text('');
                $upload_resume.find('.qq-upload-list').css('z-index', '0');
                $upload_resume.find('.qq-upload-fail').remove();
            },
            onComplete: function (id, name, response) {
                if (response.success) {
                    bonus_file_path = App.API_DOMAIN + response.filename;
                    $upload_resume.find('.qq-upload-list').css('z-index', '-1');
                    $upload_resume.find('.qq-upload-button').hide();
                    $upload_resume.find('.drag_img').css('background', 'transparent');
                    $upload_resume.find('.qq-upload-drop-area').css('display', 'block');
                    $upload_resume.find('.qq-upload-drop-area .drag_img').html('<a href="' + App.base_url + 'viewer?url=' + bonus_file_path + '" class="view" target="_blank"><img src="../public/images/Applied.svg"><p class="ellipsis">' + response.org_name + '&nbsp;</p></a>');
                    $upload_resume.find('.drag_img').append('<a href="' + bonus_file_path + '" download class="download"><img src="../public/images/material_icons/download.svg"></a><img src="../public/images/material_icons/circle-close.svg" onclick="angular.element(this).scope().ApplyJobCtrl.trash(true)" style="margin-top:-4px">');
                    vm.chkFile = false;
                    $scope.$apply();
                }
                else {
                    $upload_resume.find('.qq-upload-button').show();
                    $upload_resume.find('.qq-upload-fail').remove();
                    $upload_resume.append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>" + response.msg + "</span></div>");
                }
            },
            showMessage: function (msg, obj) {
                $('.file-check').text('');
                $upload_resume.find('.qq-uploader + .qq-upload-fail').remove();
                $upload_resume.closest('.form-group').find('div.error').hide();
                $upload_resume.find('.qq-upload-list').css('z-index', '-1');
                $(obj._listElement).fadeIn();
            },
            onRemove: function () {

            },
            onRemoveComplete: function () {
                $upload_resume.find('.qq-upload-list').css('z-index', '-1');
            }
        });


        this.trash = function () {
            $('.file-check').text('Please Select File');
            $upload_resume.find('.drag_img').html('');
            $upload_resume.find('.qq-upload-list').html('');
            $upload_resume.find('.qq-upload-list').css('z-index', '-1');
            $upload_resume.find('.qq-upload-drop-area').css('display', 'none');
            $upload_resume.find('.qq-upload-button').show();
            vm.chkFile = true;
            $scope.$apply();
        }

    }

    function AllCampaignsController($http, $window, $q, App, CampaignDetails, campaignJobDetails) {

        var vm = this,
                canceler;

        if (screen.width <= 480)
            vm.copyText = 'Copy'
        else
            vm.copyText = 'COPY CAMPAIGN LINK'

        // capitalize string in javascript
        function toTitleCase(str) {
            return str.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }

        vm.bol = true;
        vm.noLongerAvailable = false;
        // vm.copyUrl = $location.$$absUrl;
        vm.shareUrl = App.base_url + 'email/all-campaigns/share?ref=' + App.camp_ref;

        var page_no = 1, total_pages = 1;

        // social sharing directive
        function sharing(bitly) {
            vm.socialMedia = {
                socialIcons: ['facebook', 'twitter', 'linkedin', 'googlePlus'],
                url: vm.shareUrl,
                facebook: {
                    post_title: 'Here is a campaign at ' + toTitleCase(CampaignDetails.company_name) +
                            ' for' + toTitleCase(vm.infiniteScroll.headerDetails.campaign_name),
                    post_url: vm.shareUrl,
                    post_img: CampaignDetails.company_logo || '',
                    post_msg: 'Starts on: ' + vm.infiniteScroll.headerDetails.campaign_start_date +
                            ' and Ends on: ' + vm.infiniteScroll.headerDetails.campaign_end_date +
                            '. Location: ' + vm.infiniteScroll.headerDetails.campaign_location,
                },
                twitter: {
                    text: 'Here is a campaign at ' + toTitleCase(CampaignDetails.company_name) +
                            ' for' + toTitleCase(vm.infiniteScroll.headerDetails.campaign_name),
                            /*'. Starts on: ' + vm.infiniteScroll.headerDetails.campaign_start_date +
                            ' and Ends on: ' + vm.infiniteScroll.headerDetails.campaign_end_date +
                            '. Location: ' + vm.infiniteScroll.headerDetails.campaign_location,*/
                    url: bitly || vm.shareUrl,
                    hashtags: '',
                    via: CampaignDetails.company_name,
                    related: ''
                },
                linkedin: {
                    url: bitly || vm.shareUrl,
                    title: 'Here is a campaign at ' +
                            toTitleCase(CampaignDetails.company_name) +
                            ' for' + toTitleCase(vm.infiniteScroll.headerDetails.campaign_name),
                    summary: 'Starts on: ' +
                            vm.infiniteScroll.headerDetails.campaign_start_date +
                            ' and Ends on: ' + vm.infiniteScroll.headerDetails.campaign_end_date +
                            '. Location: ' + vm.infiniteScroll.headerDetails.campaign_location,
                    source: CampaignDetails.company_name
                },
                googlePlus: {
                    url: vm.shareUrl
                }
            }
        }
        
        function load(url){
            App.Helpers.loadImage({
                target: $('#logo'),
                css: '',
                url_prefix: false,
                url: url,
                onComplete: function () {console.log('shiva')
                    
                },
                onError: function () {
                    
                }
            });
        }

        vm.infiniteScroll = {
            busy: false,
            list: [],
            headerDetails: {},
            url: App.base_url + 'campaign_jobs_list',
            nextPage: function () {
            },
            loadApi: function () {
            },
            onComplete: function (obj) {
                vm.infiniteScroll.busy = false;
                for (var i = 0; i < obj.campaign_jobs_list.length; i++) {
                    vm.infiniteScroll.list.push(obj.campaign_jobs_list[i]);
                }
                vm.infiniteScroll.headerDetails = obj;
                vm.copyUrl = obj.bittly_url;
                sharing(vm.copyUrl);
                vm.bol = false;
                if (vm.infiniteScroll.headerDetails.company_logo != '') {
                    load(vm.infiniteScroll.headerDetails.company_logo)
                }
            },
            onError: function () {
                $window.location = App.base_url + 'logout';
            }
        }

        vm.infiniteScroll.nextPage = function () {
            if (total_pages >= page_no && total_pages != 0) {
                if (vm.infiniteScroll.busy) {
                    return;
                }

                vm.infiniteScroll.busy = true;

                vm.infiniteScroll.loadApi(page_no, vm.search_val);
            }
        }

        vm.infiniteScroll.loadApi = function (pageNo, searchVal, callBack) {

            if (canceler) {
                canceler.resolve();
            }

            canceler = $q.defer();

            $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: vm.infiniteScroll.url,
                data: $.param({
                    time_zone: new Date().getTimezoneOffset()
                }),
                timeout: canceler.promise
            })
                    .then(function (response) {
                        if (response.data.status_code == 200) {
                            if (callBack != undefined) {
                                callBack();
                                vm.infiniteScroll.list = [];
                            }
                            if (page_no == 1) {
                                vm.infiniteScroll.total_count = response.data.data.count;
                                total_pages = Math.ceil(vm.infiniteScroll.total_count / 10);
                            }
                            page_no++;
                            vm.infiniteScroll.onComplete(response.data.data)
                        }
                        else if (response.data.status_code == 403) {
                            vm.noLongerAvailable = response.data.message.msg[0];
                            vm.infiniteScroll.headerDetails.company_logo = '';
                            vm.infiniteScroll.busy = false;
                            page_no++;
                            /*vm.infiniteScroll.list = [];
                            vm.noJobs = true;
                            vm.infiniteScroll.total_count = 0;
                            total_pages = 0;
                            if (callBack != undefined) {
                                callBack();
                            }*/
                        }
                        else if (response.data.status_code == 400) {
                            vm.infiniteScroll.onError();
                        }
                    })
        }

        vm.updateCampaignDetails = function(job) {
            campaignJobDetails.job_title = job.job_name;
            campaignJobDetails.experience = job.experience;
            campaignJobDetails.location = job.location;
        }
    }

}());