(function () {
    "use strict";

    angular
            .module('app.campaigns', ['app.components', 'ui.grid', 'ui.grid.selection', 'mdPickers', 'ngMessages', 'ngAutocomplete', 'mwFormBuilder', 'mwFormViewer', 'pascalprecht.translate'])
            
            .controller('CampaignsController', CampaignsController)
            .controller('NewCampaignController', NewCampaignController)
            .controller('AllCampaignsController', AllCampaignsController)
            .controller('MyCampaignsController', MyCampaignsController)
            .controller('EditCampaignsController', EditCampaignsController)
            .controller('SocialShareController', SocialShareController)
            .controller('FormBuilderController', FormBuilderController)
            .controller('CreateJobController', CreateJobController)

            .service('CampaignsData', CampaignsData)
            .service('contactBuckets', contactBuckets)
            
            //.service('createJobData', createJobData)
            //.directive('createJob', createJob)

            .directive('scheduleStart' , scheduleStart)
            .directive('scheduleEnd' , scheduleEnd)
            .directive('mmUploader', mmUploader)

            .config(function ($translateProvider) {
                $translateProvider.useStaticFilesLoader({
                    prefix: 'public/angular-survey/i18n/',
                    suffix: '/angular-surveys.json'
                });
                $translateProvider.preferredLanguage('en');
            })

            function scheduleStart() {
                return {
                    restrict: 'AC',
                    require: '?ngModel',
                    link: function (scope, element, attr, ngModel) {
                        
                        if (!ngModel) return;
                        
                        ngModel.$render = function() {
                          element.val(ngModel.$viewValue || '');
                        };

                        element.on("dp.change", function (e) {
                            scope.$apply(function() {
                               ngModel.$setViewValue( !e.date ? '' : e.date);
                            });    
                            element.closest('.sib').next().find('input').data("DateTimePicker").minDate(e.date);
                        });  

                        element.datetimepicker({
                            minDate : new Date(),
                            ignoreReadonly: true,
                            format: 'MMM DD, YYYY  hh:mm A',
                            sideBySide : true,
                            useCurrent:true
                        });
                    }
                }
            }
            function scheduleEnd() {
                return {
                    restrict: 'AC',
                    require: '?ngModel',
                    link: function (scope, element, attr, ngModel) {
                        
                        if (!ngModel) return;
                        
                        ngModel.$render = function() {
                          element.val(ngModel.$viewValue || '');
                        };

                        element.on("dp.change", function (e) {
                            scope.$apply(function() {
                               ngModel.$setViewValue( !e.date ? '' : e.date);
                            }); 
                           element.closest('.sib').prev().find('input').data("DateTimePicker").maxDate(e.date);
                        }); 

                        element.datetimepicker({
                            minDate : new Date(),
                            ignoreReadonly: true,
                            format: 'MMM DD, YYYY  hh:mm A',
                            sideBySide : true,
                            useCurrent : false
                        });
                    }
                }
            }

    CampaignsController.$inject = ['$rootScope', '$http', '$window', 'contactBuckets', '$uibModal', 'App'];
    NewCampaignController.$inject = ['$scope', '$filter', '$uibModal', '$timeout', 'contactBuckets', 'CampaignsData', '$uibModalInstance', '$http', 'CompanyDetails', 'createCampaign', 'App'];
    AllCampaignsController.$inject = ['$scope', '$state', '$http', '$rootScope', '$q', '$timeout', '$window', 'uiGridConstants', 'CampaignsData', 'userPermissions', '$stateParams', 'App'];
    MyCampaignsController.$inject = [];
    EditCampaignsController.$inject = ['$scope', '$rootScope', '$state', '$uibModal', 'CompanyDetails', 'CampaignsData', 'contactBuckets', '$window', '$http', 'App'];
    CreateJobController.$inject = ['$http', '$timeout', '$window', '$uibModalInstance', 'App'];
    //createJobData.$inject = ['$rootScope'];
    //createJob.$inject = ['App', '$http', '$window', '$timeout', 'createJobData'];
    SocialShareController.$inject = ['$state', '$rootScope', 'CampaignsData', 'CompanyDetails', 'App']
    FormBuilderController.$inject = ['$scope', '$http', '$q', '$uibModal'];

    mmUploader.$inject = [];

    function mmUploader() {
        return{
            restrict: 'EA', 
            scope: {
              datasource : '='
            },
            template : '<div id="{{mmUploaderCtrl.opts.id}}"></div>' ,
            controller: function($scope, $timeout, App){
                var vm = this;
                    vm.opts = vm.datasource;

                function init() {
                    var $company_logo = $('#' + vm.opts.id);
                    App.Helpers.initUploader({
                        id: vm.opts.id,
                        dragText: "",
                        uploadButtonText: vm.opts.uploadButtonText,
                        size: vm.opts.size,
                        allowedExtensions: vm.opts.allowedExtensions,
                        action: App.base_url + vm.opts.action,
                        showFileInfo: false,
                        shortMessages: true,
                        remove: true,
                        file_name: vm.opts.file_name,
                        path_name: vm.opts.path_name,
                        onSubmit: function (id, name) {
                            $company_logo.find('.qq-upload-list').css('z-index', '0');
                        },
                        onComplete: function (id, name, response) {
                            if (response.success) {
                                $company_logo.find('.qq-upload-list').css('z-index', '-1');
                                $company_logo.find('.qq-upload-drop-area').css('display', 'block');
                                vm.update = true;
                                $scope.$apply();
                                App.Helpers.loadImage({
                                    target: $company_logo.find('.drag_img'),
                                    css: 'img-thumbnail',
                                    remove: true,
                                    view: true,
                                    fileName : response.org_name,
                                    url_prefix: App.pre_path,
                                    url: response.filename.split('/').slice(-2).join('/'),
                                    onComplete: App.Helpers.setImagePosition,
                                    onError: function () {
                                        $company_logo.find('.qq-upload-button').show();
                                    }
                                });
                            }
                        },
                        showMessage: function (msg, obj) {
                            $company_logo.closest('.form-group').find('div.error').hide();
                            $company_logo.find('.qq-upload-list').css('z-index', '0');
                            $(obj._listElement).fadeIn();
                        },
                        onRemove: function () {
                            vm.update = true;
                            $scope.$apply();
                        },
                        onRemoveComplete: function () {
                            $company_logo.find('.qq-upload-list').css('z-index', '-1');
                        }
                    });
                }
                
                // initial company logo qq-uploader
                function previewImg(url, name) {
                    var logo = $('#' + vm.opts.id);
                    if(url){
                        logo.find('.qq-upload-drop-area').show();
                        logo.find('.qq-upload-list').html('');
                        App.Helpers.loadImage({
                            target: logo.find('.drag_img'),
                            css: 'img-thumbnail',
                            remove: true,
                            url_prefix: false,
                            view: true,
                            url: url,
                            onComplete: function () {
                                logo.find('.qq-upload-list').append("<li><input type='hidden' value='" + url + "' name='" + name + "'/></li>").show();
                            },
                            onError: function () {
                                logo.find('.qq-upload-drop-area').hide();
                                logo.find('.qq-upload-button').show();
                            }
                        });
                    }else{
                        App.Helpers.removeUploadedFiles({
                            obj: logo
                        })
                    }
                }

                
                $timeout(function(){
                    init();
                    vm.opts.previewImg(previewImg);
                })

            },
            controllerAs: 'mmUploaderCtrl',
            bindToController: true
        }

    }

    function contactBuckets() {

        var buckets = {};

        this.setBucket = function (data) {
            buckets = data;
        }

        this.getBucket = function () {
            return buckets
        }

        this.addBucket = function (prop, val) {
            buckets[prop] = val;
        }
    }

    function CampaignsData() {
        var campaigns = {};

        var bol = false;

        this.setCampaigns = function (data) {
            campaigns = data;
        }

        this.getCampaigns = function () {
            return campaigns
        }

        this.addCampaigns = function (prop, val) {
            campaigns[prop] = val;
        }
    }

    function createJobData($rootScope) {
        this.UpdateDataInCtrl = function (data) {
            if (data.editCampagin) {
                $rootScope.$broadcast('newJobDataEditCmp', data);
            }
            else {
                $rootScope.$broadcast('newJobData', data);
            }
        }
    }

    function CampaignsController($rootScope, $http, $window, contactBuckets, $uibModal, App) {

        var vm = this;

        $rootScope.selectedFilter = {
            all: [],
            single: []
        };

        function bucketsList() {
            var get_buckets = $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: App.base_url + 'buckets_list'
            })
            get_buckets.success(function (response) {
                if (response.status_code == 200) {
                    contactBuckets.setBucket(response.data.buckets_list);
                    vm.bucketListApi = true;
                }
                else if (response.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }
            })
            get_buckets.error(function (response) {
                console.log(response);
            })
        }
        bucketsList();

        /*this.createNewCampaign = createNewCampaign;

        function createNewCampaign(boolCreatNewCamp) {
            $uibModal.open({
                animation: false,
                backdrop: 'static',
                keyboard: false,
                templateUrl: 'templates/campaigns/new-campaign-dialog.phtml',
                openedClass: "new-campaign",
                resolve: {
                    createCampaign: function () {
                        return boolCreatNewCamp;
                    }
                },
                controller: 'NewCampaignController',
                controllerAs: 'NewCampaignCtrl'
            });
        };*/
    }

    function createJob(App, $http, $window, $timeout, createJobData) {
        return{
            restrict: 'AE',
            scope: {
                setFn: '&',
                closeTemplate: '&',
                closeModals: '&',
                editCampagin: '='
            },
            templateUrl: 'templates/campaigns/template-create-job.phtml',
            link: function (scope) {


                //google api location
                scope.geo_location = '';
                scope.geo_options = '';
                scope.geo_details = '';
                scope.$watch(function () {
                    return scope.geo_details;
                }, function (location) {
                });

                scope.postJob = function (invalid) {
                    if (invalid || scope.jobData.jobDescription.trim().length == 0) {
                        scope.errCond = true;
                        return;
                    }
                    scope.apiCallStart = true;
                    var postJobData = $('form[name="create_job"]').serialize();
                    $http({
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                        },
                        method: 'post',
                        data: postJobData + '&' + $.param({
                            job_period: 'immediate',
                            job_type: 'global'
                        }),
                        url: App.base_url + 'job_post_from_campaigns'
                    }).success(function (response) {
                        if (response.status_code == 200) {
                            scope.apiSuccessMsg = response.message.msg[0];
                            response.data['editCampagin'] = scope.editCampagin.bol
                            $timeout(function () {
                                scope.editCampagin.bol ? scope.closeDismiss() : scope.close()
                            }, 800);
                            createJobData.UpdateDataInCtrl(response.data);
                            $timeout(function () {
                                scope.apiSuccessMsg = "",
                                scope.apiCallStart = false;
                            }, 900);
                        }
                        else if (response.status_code == 400) {
                            $window.location = App.base_url + 'logout';
                        }
                    });
                }

                scope.close = function () {
                    scope.closeTemplate();
                    scope.errCond = false;
                    scope.jobData = {};
                }

                function getData() {
                    var apiCall = ['get_job_functions', 'get_industries', 'get_employment_types', 'get_experiences'];

                    for (var i = 0; i < apiCall.length; i++) {
                        $http({
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                            },
                            method: 'GET',
                            url: App.base_url + apiCall[i]
                        }).success(function (response) {
                            if (response.status_code == 200) {
                                var label = Object.keys(response.data)[0];
                                scope[label] = response.data[label];

                            }
                            else if (response.status_code == 400) {
                                $window.location = App.base_url + 'logout';
                            }
                        });
                    }
                }

                if (scope.editCampagin.bol) {
                    getData();
                }
                scope.setFn({dirFn: getData});
                scope.closeDismiss = function () {
                    scope.closeModals();
                }
            }
        }
    }

    function NewCampaignController($scope, $filter, $uibModal, $timeout, contactBuckets, CampaignsData, $uibModalInstance, $http, CompanyDetails, createCampaign, App) {

        var vm = this,
            currentTab = 'campaignDetails';

        vm.campaign        = ['Mass Recruitment', 'Military Veterans', 'Campus Hires'];
        vm.campaignDetails = true;
        vm.schedule        = false; 
        vm.careersPage     = false;
        vm.manageContacts  = false;

        vm.campDetails     = {};
        vm.jobLists        = [];
        vm.scheduleDetails = {
            job_ids : []
        };
        vm.careersDetails  = {};
        vm.manageContactsDetails = {};


        vm.nextStep = function(viewTab) {

            if(vm.scheduleDetails.job_ids.length == 0 && currentTab == 'schedule'){
                vm['errCond' + currentTab] = true;
                return;
            }

            if($scope[currentTab].$valid) {
                vm[currentTab] = false;
                vm[viewTab]    = true;
                currentTab     = viewTab; 
            }

            vm['errCond' + currentTab] = true; 

        }

        vm.getScheduleDate = function(id) {
            return $filter('date')(new Date($(id).val()), 'dd-MM-yyyy');
        }

        vm.getScheduleTime = function(id) {
            return $filter('date')(new Date($(id).val()), 'HH:mm');
        }

        vm.createJob = function() {
            var modalInstance = $uibModal.open({
                animation: false,
                backdrop: 'static',
                keyboard: false,
                templateUrl: 'templates/campaigns/template-create-job.phtml',
                openedClass: "new-campaign",
                controller: 'CreateJobController',
                controllerAs: 'CreateJobCtrl'
            })

            modalInstance.result.then(function (response) {
                var data = response.data,
                    obj = {
                        no_of_vacancies: data.no_of_vacancies,
                        id: data.post_id,
                        job_title: data.name
                    };

                vm.jobLists.push(obj);
                var id = data.post_id.toString();
                vm.scheduleDetails.job_ids.push(id);
                $timeout(function () {
                    $('#selectJob').trigger('chosen:updated')
                }, 100);

            }, function () {});
        };

        vm.companyLogoOpts = {
            id     : 'logo',
            size   : (1 * 1024 * 1024),
            action : "file_upload",
            file_name : 'logo_org_name',
            path_name : 'logo_image',
            allowedExtensions : ["jpg", "jpeg", "png"],
            uploadButtonText  : "<span class='head'>Logo</span><span class='desc'>Add your careers page company logo</span>",
            previewImg : function(dirFun) {
                vm.updateLogo = dirFun;
            }
        }

        vm.heroShortImageOpts = {
            id     : 'heroshort-logo',
            size   : (1 * 1024 * 1024),
            action : "file_upload",
            file_name : 'logo_org_name',
            path_name : 'logo_image',
            allowedExtensions : ["jpg", "jpeg", "png"],
            uploadButtonText  : "<span class='head'>Heroshot Image</span><span class='desc'>Add your careers page heroshot image</span>",
            previewImg : function(dirFun) {
                vm.updateHeroShortImage = dirFun;
            }
        }

        vm.addHyperlink = function() {
            if(vm.careersDetails.career_links.length < 4){
                vm.careersDetails.career_links.push({cls:'mm-slide-left'});
            }
        }

        //location
        this.geo_location = '';
        this.geo_options = {types: '(cities)'};
        this.geo_details = '';
        
        var componentForm = {
            locality: 'long_name',
            administrative_area_level_1: 'long_name',
            country: 'long_name',
            postal_code: 'short_name'
        };

        var locationModalName = {
            locality: 'city',
            administrative_area_level_1: 'state',
            country: 'country',
            postal_code: 'zip_code'
        }

        $scope.$watch(function () {
            return vm.geo_details;
        }, function (location) {
            if (location) {
                if (location.hasOwnProperty('address_components')) {
                    vm.campDetails.location.zip_code = '';
                    for (var i = 0; i < location.address_components.length; i++) {
                        var addressType = location.address_components[i].types[0];
                        if (componentForm[addressType]) {
                            var val = location.address_components[i][componentForm[addressType]];
                            vm.campDetails.location[locationModalName[addressType]] = val;
                        }
                    }
                    vm.lat = location.geometry.location.lat();
                    vm.lng = location.geometry.location.lng();
                }
            }
        });

        this.resetLocation = function (city) {
            if (city == undefined) {
                vm.campDetails.location.zip_code = "";
                vm.campDetails.location.state = "";
                vm.campDetails.location.country = "";
            }
        }

        

        function init() {
            $http({
                headers : { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                method  : 'POST',
                data    : $.param({company_code: CompanyDetails.company_code}),
                url     : App.base_url + 'get_career_settings'
            })
            .then(function (response) {
                if (response.data.status_code == 200) {
                    vm.careersDetails = response.data.data;
                    vm.updateLogo(response.data.data.career_logo, 'career_logo');
                    vm.updateHeroShortImage(response.data.data.career_heroshot_image, 'career_heroshot_image');
                }
                else if (response.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }
            }, function (response) {
                console.log(response)
            });

            var get_buckets = $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: App.base_url + 'buckets_list'
            })
            get_buckets.success(function (response) {
                if (response.status_code == 200) {
                    vm.bucketsName = response.data.buckets_list;
                }
                else if (response.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }
            })
            get_buckets.error(function (response) {
                console.log(response);
            });
        }

        init();


        $('.videoFiles').fancybox({
            minWidth: 500,
            maxWidth: 500,
            minHeight: 300,
            maxHeight: 300,
            scrollOutside: false,
            afterLoad: function (x, y) {
                var url = x.element[0].attributes.videoplay.value;
                var tpl = '<video controls width="100%" autoplay>' +
                        '<source src="' + url + '" type="video/mp4">' +
                        '<source src="' + url + '" type="video/webm">' +
                        '<source src="' + url + '" type="video/ogg">' +
                        '<source src="' + url + '" type="video/ogv">' +
                        '</video>'
                x.content = tpl
            }
        });

        this.company_name = CompanyDetails.name;
        this.addTimeSheet = addTimeSheet;
        this.closeTimeSheet = closeTimeSheet;
        this.postNewCampaign = postNewCampaign;
        this.trash = trash;
        this.showJobTemplate = false;
        this.createJobData = createJobData;

        
        this.timeSheetGroups = [1];
        this.currentTimeSheet = 1;

        function addTimeSheet() {
            if (vm.timeSheetGroups.length == 5) {
                return;
            }
            vm.currentTimeSheet++
            vm.timeSheetGroups.push(vm.currentTimeSheet);
        }

        function closeTimeSheet(groupId) {
            var index = vm.timeSheetGroups.indexOf(groupId);
            vm.timeSheetGroups.splice(index, 1);
        }

        function validStep(viewTab){
            vm[currentTab] = false;
            vm[viewTab]    = true;
            currentTab     = viewTab;
            vm['errCond' + viewTab] = true; 
        }

        function postNewCampaign() {         
            
            if($scope.manageContacts.$invalid){
                return validStep('manageContacts');
            }
            else if($scope.campaignDetails.$invalid) {
                return validStep('campaignDetails');
            } 
            else if($scope.schedule.$invalid) {
                return validStep('schedule');
            } 
            else if($scope.careersPage.$invalid) {
                return validStep('careersPage');
            } 

            // vm.postPointer = true;
            // vm.postLoader = true;


            console.log('ok');
            return;

            
            var frmData = $("form[name='campaignDetails'], form[name='schedule'] :not('.form-control'), form[name='careersPage'] :not('.rm'), form[name='manageContacts']").serialize();
            
            
            var newCampaign = $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                data: frmData + '&' + $.param({
                    request_type: 'add'
                }),
                url: App.base_url + 'add_campaign'
            })
            newCampaign.success(function (response) {
                vm.postLoader = false;
                vm.message = true;

                if (response.status_code == 200) {
                    vm.successMsg = response.message.msg[0];
                    CampaignsData.bol = true;
                    CampaignsData.setCampaigns(response.data);
                    closeModal();
                    setTimeout(function () {
                        share()
                    }, 500);
                }
                else if (response.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }
            })
            newCampaign.error(function (response) {
                console.log(response)
            })

        }

        function share() {
            $uibModal.open({
                animation: false,
                backdrop: 'static',
                keyboard: false,
                templateUrl: 'templates/campaigns/social-share-modal.phtml',
                openedClass: "social-share",
                controller: 'SocialShareController',
                controllerAs: 'SocialShareCtrl'
            });
        }
        
        function uploader() {
            for (var i = 0; i < 2; i++) {
                window["$upload_pitch" + i] = $('.upload-pitch').eq(i);
                pitchUpload(i);
            }
        }

        var uploadTemplate = '<div class="upload-box">' +
                '<div class="file">' +
                '<div class="progress-bar"></div>' +
                '<div class="filename"></div>' +
                '</div>' +
                '</div>'

        var param = '';
        function pitchUpload(index) {
            var uploader = new qq.FileUploader({
                element: document.getElementsByClassName('upload-pitch')[index],
                dragText: "",
                uploadButtonText: "Browse File",
                multiple: false,
                sizeLimit: (25 * 1024 * 1024),
                allowedExtensions: ["MP4", "WEBM", "OGG", "OGV"],
                action: App.base_url + 'file_upload',
                onSubmit: function (id, name) {
                    eval("$upload_pitch" + index).next('.upload-box').remove();
                    eval("$upload_pitch" + index).after(uploadTemplate);
                    eval("$upload_pitch" + index).find('.qq-upload-list').remove();
                    eval("$upload_pitch" + index).find('.qq-upload-fail').remove();
                },
                onComplete: function (id, name, response) {
                    if (response.success) {
                        if (index == 0) {
                            param = {name: 'ceos_org_name', file: 'ceos_file_name'};
                        }
                        else {
                            param = {name: 'emp_org_name', file: 'emp_file_name'};
                        }
                        var tpl = '<video style="width: 7%;vertical-align:middle">' +
                                '<source src="' + App.pre_path + response.filename.split('/').slice(-2).join('/') + '" type="video/mp4">' +
                                '<source src="' + App.pre_path + response.filename.split('/').slice(-2).join('/') + '" type="video/webm">' +
                                '<source src="' + App.pre_path + response.filename.split('/').slice(-2).join('/') + '" type="video/ogg">' +
                                '<source src="' + App.pre_path + response.filename.split('/').slice(-2).join('/') + '" type="video/ogv">' +
                                '</video>'
                        eval("$upload_pitch" + index).find('.qq-upload-fail').remove();
                        eval("$upload_pitch" + index).find('.qq-upload-success').hide();
                        eval("$upload_pitch" + index).find('.qq-upload-list').css('z-index', '-1');
                        eval("$upload_pitch" + index).next('.upload-box').find('.filename').append('<a class="videoFiles fancybox.ajax" target="_blank" videoPlay="' + App.pre_path.split('/').slice(-2).join('/') + response.filename + '" href="templates/components/video-play.phtml">' + tpl + '</a>');
                        eval("$upload_pitch" + index).next('.upload-box').find('.filename').append('<p class="name ellipsis">' + response.org_name + '</p>');
                        eval("$upload_pitch" + index).next('.upload-box').find('.filename').append('<img src="public/images/material_icons/circle-close.svg" onclick="angular.element(this).scope().NewCampaignCtrl.trash(' + index + ')">');
                        eval("$upload_pitch" + index).next('.upload-box').append("<input type='hidden' name='" + param.file + "' value='" + response.filename + "' />").show();
                        eval("$upload_pitch" + index).next('.upload-box').append("<input type='hidden' name='" + param.name + "' value='" + response.org_name + "' />").show();
                    }
                    else {
                        eval("$upload_pitch" + index).next('.upload-box').remove();
                        eval("$upload_pitch" + index).append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>" + response.msg + "</span></div>");
                    }
                    $('.progress-bar').hide();
                },
                onProgress: function (id, fileName, loaded, total) {
                    var percent = Math.round((loaded / total) * 100);
                    eval("$upload_pitch" + index).next().find('.progress-bar').progressbar({
                        value: percent
                    });
                },
                showMessage: function (msg) {
                    eval("$upload_pitch" + index).find('.qq-upload-fail').remove();
                    eval("$upload_pitch" + index).append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>" + msg + "</span></div>");
                }
            });
        }

        function trash(index) {
            eval("$upload_pitch" + index).next('.upload-box').remove();
            eval("$upload_pitch" + index).find('.qq-upload-fail').remove();
        }
        
        setTimeout(function () {
            uploader()
        }, 1000);

        setTimeout(function () {
            $('#selectJob').chosen()
        }, 0);

        
        /*
        
        var formName = 'campaignDetails';
        this.currentStep = 1;
        this.step1 = true;
        this.switchSteps = switchSteps;
        function switchSteps(step) {

            if (step == "next") {
                if (vm.currentStep == 2) {
                    if ($scope[formName].$invalid || vm.frm2.job_ids.length == 0) {
                        vm['errCond' + formName] = true;
                        return;
                    }
                } else {
                    if ($scope[formName].$invalid) {
                        vm['errCond' + formName] = true;
                        return;
                    }
                }
                vm['errCond' + formName] = false;
                if (vm.currentStep == 3) {
                    vm.postNewCampaign();
                }
                else {
                    vm["step" + vm.currentStep] = false;
                    vm.currentStep++;
                    vm.listSteps[vm.currentStep - 1].status = true;
                }
            }
            else {
                vm["step" + vm.currentStep] = false;
                vm.currentStep--;
                vm['errCond' + formName] = false;
                vm.listSteps[vm.currentStep].status = false;
            }
            formName = 'frm' + vm.currentStep;
            vm["step" + vm.currentStep] = true;
        }

         vm.openCalander = function(id){
            $('#' + id).datetimepicker('show');
        }

        //this.closeModal = closeModal;
        //this.jobTemplate = jobTemplate;

        this.setDirectiveFn = function (dirFn) {
            vm.resetBuckets = dirFn;
        };



        // NewCampaign or Create Job based on Boolean
        this.createJobEditCampagin = !createCampaign;
        this.campState = {
            bol: vm.createJobEditCampagin
        }
        
        if (vm.createJobEditCampagin) {
            jobTemplate();
        }

        function closeModal() {
            $('html').removeClass('remove-scroll');
            $uibModalInstance.dismiss('cancel');
        }

        function createJobData(dirFn) {
            vm.createJobApi = dirFn;
        }

        var triggerCreateJobCalls = true;

        function jobTemplate() {
            vm.showJobTemplate = !vm.showJobTemplate;
            if (triggerCreateJobCalls) {
                vm.createJobApi();
                triggerCreateJobCalls = false;
            }
        }

        this.listSteps = [
            {label: 'CAMPAIGN DETAILS', status: true},
            {label: 'SCHEDULE CAMPAIGN', status: false},
            {label: 'PREPARE CONTACTS', status: false},
            // { label:'PUBLISH CAMPAIGN', status: false}
        ];

        this.closeDropdown = function () {
            $('body').find('.md-select-menu-container').removeClass('md-leave');
            if ($('body').find('.md-select-menu-container').hasClass('md-active')) {
                $('body').find('.md-select-menu-container').removeClass('md-active md-clickable');
                $('body').find('.md-select-menu-container').addClass('md-leave');
            }
        }

        //$('html').addClass('remove-scroll');
        this.currentDate = new Date();

        $scope.$on('newJobData', function (event, data) {

            var obj = {
                no_of_vacancies: data.no_of_vacancies,
                id: data.post_id,
                job_title: data.name
            }
            vm.jobLists.push(obj);
            var id = data.post_id.toString();
            vm.frm2.job_ids.push(id);
            $timeout(function () {
                $('#selectJob').trigger('chosen:updated')
            }, 100);
        })*/

        /*$scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $uibModalInstance.dismiss('cancel');
        });*/
    }


    function AllCampaignsController($scope, $state, $http, $rootScope, $q, $timeout, $window, uiGridConstants, CampaignsData, userPermissions, $stateParams, App) {

        var vm = this, canceler,
                gridApiCall = App.base_url + 'campaigns_list';

        var a = [0];

        vm.all_campaigns = $stateParams.all_campaigns;
        $rootScope.campaignCond = vm.all_campaigns;

        if (vm.all_campaigns == 1 && $rootScope.selectedFilter && $rootScope.selectedFilter.all.length > 0) {
            vm.filterList = $rootScope.selectedFilter.all;
            a[0] = vm.filterList.length;
        }
        else if (vm.all_campaigns == 0 && $rootScope.selectedFilter && $rootScope.selectedFilter.single.length > 0) {
            vm.filterList = $rootScope.selectedFilter.single;
            a[0] = vm.filterList.length;
        }

        vm.loader = false;
        vm.noCampaigns = false;

        CampaignsData.bol = true;

        vm.pageNumber = 1;
        vm.applyFilter = applyFilter;
        vm.editCampaigns = editCampaigns;
        vm.pageChanged = pageChanged;

        $rootScope.apiCall = vm.pageChanged;

        // epi search directive
        vm.search_opts = {
            delay: 500,
            progress: false,
            complete: false,
            placeholder: 'Search by Campaign Name',
            onSearch: function (val) {
                vm.search_val = val;
                if (vm.search_opts.progress) {
                    if (vm.search_opts.value) {
                        pageChanged(vm.pageNumber, vm.filterList ? vm.filterList.toString() : '').then(function () {
                            vm.search_opts.progress = false;
                            vm.search_opts.complete = true;
                        })
                    }
                }
            },
            onClear: function () {
                vm.search_val = "";
                pageChanged(vm.pageNumber, vm.filterList ? vm.filterList.toString() : '')
            }
        }

        // filter
        vm.filterOptions = [
            {name: ' Campaign Type', children: [{label: 'Mass Recruitment', value: 'Mass Recruitment'}, {label: 'Military Veterans', value: 'Military Veterans'}, {label: 'Campus Hires', value: 'Campus Hires'}]},
            {name: 'Status', children: [{label: 'Open', value: 'Open'}, {label: 'Close', value: 'Closed'}]}
        ]

        // filter api call
        function applyFilter() {
            if (vm.filterList != undefined) {
                if (a[0] == 0 && vm.filterList.length == 0) {
                    return false
                }
                a[0] = vm.filterList.length;
                if (vm.all_campaigns == 1)
                    $rootScope.selectedFilter.all = vm.filterList;
                else
                    $rootScope.selectedFilter.single = vm.filterList;
                pageChanged(vm.pageNumber, vm.filterList.toString())
            }
        }

        // grid function
        vm.gridOptions = {
            rowHeight: 70,
            enableSorting: true,
            enableColumnMenus: false,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            data: 'data'
        };

        vm.gridOptions.columnDefs = [
            {field: 'campaign_name', displayName: 'CAMPAIGN NAME', cellClass: 'first-col', width: '20%', enableSorting: false},
            {field: 'campaign_type', displayName: 'CAMPAIGN TYPE', width: '25%', enableSorting: true, sortDirectionCycle: ['asc', 'desc', '']},
            {field: 'total_vacancies', displayName: '#VACANCIES', width: '20%', enableSorting: false},
            {field: 'start_on_date', displayName: 'START & END DATES', width: '25%', enableSorting: false, cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.start_on_date | date: "MMM dd"}} - {{row.entity.end_on_date | date: "MMM dd, yyyy "}}</div>'},
            {field: 'status', displayName: 'STATUS', width: '15%', enableSorting: false,
                cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                    var text = grid.getCellValue(row, col).toLowerCase();
                    return text == 'open' ? 'open' : 'closed'
                }
            }
        ]

        vm.gridOptions.onRegisterApi = function (gridApi) {
            if (userPermissions.run_campaign == 1) {
                gridApi.selection.on.rowSelectionChanged(null, vm.editCampaigns);
            }
            vm.gridApi = gridApi;
        }


        vm.data = [];
        vm.gridOptions.data = vm.data;

        function resetGrid() {
            vm.firstPage = 0;
            vm.lastPage = 0;
            vm.pageNo = 1;
            vm.totalPages = 1;
            vm.noCampaigns = false;
        }

        function pageChanged(pageNo, filters) {
            resetGrid();

            vm.loader = true;
            
            if(filters == '' && vm.filterList != undefined && vm.filterList.length > 0){
                vm.filterList = undefined;
            }

            if (canceler) {
                canceler.resolve();
            }

            canceler = $q.defer();

            return $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: gridApiCall,
                data: $.param({
                    filter: filters || '',
                    search: vm.search_val,
                    page_no: pageNo,
                    all_campaigns: vm.all_campaigns
                }),
                timeout: canceler.promise
            })
                    .then(function (response) {
                        vm.loader = false;
                        if (response.data.status_code == 200) {
                            if (response.data.data.length == 0) {
                                vm.noCampaigns = true;
                                vm.gridOptions.data = [];
                            }
                            else {
                                vm.gridOptions.data = response.data.data.campaigns;
                                vm.totalRecords = response.data.data.total_count;
                            }
                            try {
                               document.getElementsByClassName("ui-grid-viewport")[0].scrollTop = 0;
                            }
                            catch(err) {
                                console.log("error in scroll");
                            }
                        }
                        else if (response.data.status_code == 403) {
                            vm.noCampaigns = true;
                            vm.gridOptions.data = [];
                            vm.totalRecords = 0;
                        }
                        else if (response.data.status_code == 400) {
                            $window.location = App.base_url + 'logout';
                        }
                    })
        }

        if (CampaignsData.bol) {
            $timeout(function () {
                pageChanged(vm.pageNumber, vm.filterList ? vm.filterList.toString() : '');
            })
        }

        function editCampaigns(row) {
            vm.loader = true;

            $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: App.base_url + 'view_campaign',
                data: $.param({
                    campaign_id: row.entity.id
                })
            })
                    .then(function (response) {
                        if (response.data.status_code == 200) {
                            CampaignsData.setCampaigns(response.data.data);
                            CampaignsData.addCampaigns('id', row.entity.id);
                            $state.go('app.campaigns.editCampaigns');
                        }
                        else if (response.data.status_code == 400) {
                            $window.location = App.base_url + 'logout';
                        }
                    })
        }

    }


    function MyCampaignsController() {

    }

    function EditCampaignsController($scope, $rootScope, $state, $uibModal, CompanyDetails, CampaignsData, contactBuckets, $window, $http, App) {

        var vm = this,
                link = App.base_url + 'email-parser/all-campaigns?ref=';

        vm.company_name = CompanyDetails.name;

        $('.videoFiles').fancybox({
            minWidth: 500,
            maxWidth: 500,
            minHeight: 300,
            maxHeight: 300,
            scrollOutside: false,
            afterLoad: function (x, y) {
                var url = x.element[0].attributes.videoplay.value;
                var tpl = '<video controls width="100%" autoplay>' +
                        '<source src="' + url + '" type="video/mp4">' +
                        '<source src="' + url + '" type="video/webm">' +
                        '<source src="' + url + '" type="video/ogg">' +
                        '<source src="' + url + '" type="video/ogv">' +
                        '</video>'
                x.content = tpl
            }
        });

        vm.errCond = false;
        vm.loader = false;
        vm.bktView = true;
        vm.campaignDetails = {};
        vm.bucketsName = {};
        vm.radioButtons = {};
        vm.checkBox = {};
        vm.campaign = ['Mass Recruitment', 'Military Veterans', 'Campus Hires'];

        //location
        vm.geo_location = '';
        vm.geo_options = {types: '(cities)'};
        vm.geo_details = '';

        var componentForm = {
            locality: 'long_name',
            administrative_area_level_1: 'long_name',
            country: 'long_name',
            postal_code: 'short_name'
        };

        var locationModalName = {
            locality: 'city',
            administrative_area_level_1: 'state',
            country: 'country',
            postal_code: 'zip_code'
        }

        $scope.$watch(function () {
            return vm.geo_details;
        }, function (location) {
            if (location) {
                if (location.hasOwnProperty('address_components')) {
                    vm.campaignDetails.location.zip_code = '';
                    for (var i = 0; i < location.address_components.length; i++) {
                        var addressType = location.address_components[i].types[0];
                        if (componentForm[addressType]) {
                            var val = location.address_components[i][componentForm[addressType]];
                            vm.campaignDetails.location[locationModalName[addressType]] = val;
                        }
                    }
                    vm.lat = location.geometry.location.lat();
                    vm.lng = location.geometry.location.lng();
                }
            }
        });

        vm.updateCampaign = updateCampaign;
        vm.trash = trash;
        vm.resetLocation = resetLocation;
        vm.campaignDetails = CampaignsData.getCampaigns();
        vm.prevSelectedJobIds = [];
        vm.cacheData = angular.copy(vm.campaignDetails);

        vm.bucketsName = angular.copy(contactBuckets.getBucket());
        vm.checkedBuckets = vm.campaignDetails.bucket_ids || [];

        vm.jobsList = vm.campaignDetails.job_details;
        function resetJobs() {
            var arr = [];
            for (var j = 0; j < vm.jobsList.length; j++) {
                arr.push(vm.jobsList[j].post_id.toString());
            }
            vm.campaignDetails.job_ids = arr;
            $('#mul_select').trigger('chosen:updated');
            setTimeout(function () {
                for (var i = 0; i < vm.jobsList.length; i++) {
                    vm.prevSelectedJobIds.push($('.chosen-choices li.search-choice').eq(i).find('a').attr('data-option-array-index'));
                    $('.chosen-choices li').eq(i).find('a').remove();
                }
            }, 200)
        }
        resetJobs();

        // modern select
        setTimeout(function () {
            $('#mul_select').chosen()
        }, 1);


        function radioButton() {
            vm.radioButtons = {
                address: vm.campaignDetails.location_type || 'online'
            }
        }
        radioButton();

        vm.checkBox = {
            schedule: 'false',
            socialNetworks: 'false',
            myNetworks: 'false',
            ceoPitch: 'false',
            employeePitch: 'false'
        }

        // uploader
        for (var i = 0; i < 2; i++) {
            window["$upload_pitch" + i] = $('.upload-pitch').eq(i);
            pitchUpload(i);
        }

        function resetErrors() {
            vm.errCond = false;
            for (var i = 0; i < 2; i++) {
                eval("$upload_pitch" + i).find('.qq-upload-fail').remove();
            }
        }


        vm.currentDate = new Date();
        function schedule() {
            vm.scheduleTime = [0];
            vm.currentTimeLength = 0;
            var schedule = vm.campaignDetails.schedule;
            if (schedule.length == 1) {
                if (schedule[0].status == 'CLOSED') {
                    vm.currentTimeLength++;
                    vm.scheduleTime.push(vm.currentTimeLength);
                }
            }
            if (schedule.length > 1) {
                var x = 0;
                if (schedule[0].status == 'CLOSED') {
                    x++;
                }
                for (var i = 1; i < schedule.length; i++) {
                    if (schedule[i].status == 'CLOSED') {
                        x++;
                    }
                    vm.currentTimeLength++;
                    vm.scheduleTime.push(vm.currentTimeLength);
                    if (x == schedule.length && x != 5) {
                        vm.currentTimeLength++;
                        vm.scheduleTime.push(vm.currentTimeLength);
                    }
                }
            }
            vm.disableSchedule = angular.copy(vm.scheduleTime);
            vm.campaignDetails.date = [];
            if (vm.campaignDetails.schedule.length > 0) {

                var campaginOpen = vm.campaignDetails.status == 'OPEN' ? false : true;

                for (var i = 0; i < vm.campaignDetails.schedule.length; i++) {
                    var obj = {};
                    obj.start_on_date = campaginOpen ? new Date(vm.campaignDetails.schedule[i].start_on_date) : '';
                    obj.end_on_date = campaginOpen ? new Date(vm.campaignDetails.schedule[i].end_on_date) : '';
                    obj.start_on_time = campaginOpen ? new Date(vm.campaignDetails.schedule[i].start_on_date + ' ' + vm.campaignDetails.schedule[i].start_on_time) : '';
                    obj.end_on_time = campaginOpen ? new Date(vm.campaignDetails.schedule[i].end_on_date + ' ' + vm.campaignDetails.schedule[i].end_on_time) : '';
                    obj.schedule_id = vm.campaignDetails.schedule[i].schedule_id;
                    vm.campaignDetails.date.push(obj);
                }
            }
        }
        schedule();
        vm.addSchedule = function () {
            if (vm.scheduleTime.length == 5) {
                vm.checkbox.schedule = false;
                return;
            }
            vm.currentTimeLength++;
            vm.scheduleTime.push(vm.currentTimeLength);
        }
        vm.closeSchedule = function (val) {
            var indx = vm.scheduleTime.indexOf(val);
            vm.scheduleTime.splice(indx, 1)
        }


        if (vm.campaignDetails.hasOwnProperty('files')) {
            for (var i = 0; i < vm.campaignDetails.files.length; i++) {
                if (i == 0) {
                    if (vm.campaignDetails.files[i].ceos_file_name != '') {
                        vm.checkBox.ceoPitch = true;
                        param = {file: 'ceos_file_name', name: 'ceos_org_name'};
                        hasFile(param, vm.campaignDetails.files[i], i, false);
                    }
                }
                else {
                    if (vm.campaignDetails.files[i].emp_file_name != '') {
                        vm.checkBox.employeePitch = true;
                        param = {file: 'emp_file_name', name: 'emp_org_name'};
                        hasFile(param, vm.campaignDetails.files[i], i, false);
                    }
                }
            }
        }

        vm.directiveCall = function (dirFn) {
            vm.resetBuckects = dirFn;
        };


        var uploadTemplate = '<div class="upload-box">' +
                '<div class="file">' +
                '<div class="progress-bar"></div>' +
                '<div class="filename"></div>' +
                '</div>' +
                '</div>'

        var param = '';
        function pitchUpload(index) {
            var uploader = new qq.FileUploader({
                element: document.getElementsByClassName('upload-pitch')[index],
                dragText: "",
                uploadButtonText: "Browse File",
                multiple: false,
                sizeLimit: (25 * 1024 * 1024),
                allowedExtensions: ["MP4", "WEBM", "OGG", "OGV"],
                action: App.base_url + 'file_upload',
                file_name: index == 0 ? 'ceos_org_name' : 'emp_org_name',
                path_name: index == 0 ? 'ceos_file_name' : 'emp_file_name',
                onSubmit: function (id, name) {
                    eval("$upload_pitch" + index).next('.upload-box').remove();
                    eval("$upload_pitch" + index).after(uploadTemplate);
                },
                onComplete: function (id, name, response) {
                    if (response.success) {
                        $('.progress-bar').hide();
                        hasFile(param, response, index, true);
                    }
                    else {
                        $('.progress-bar').eq(index).hide();
                        eval("$upload_pitch" + index).find('.qq-upload-fail').remove();
                        eval("$upload_pitch" + index).next('.upload-box').remove();
                        eval("$upload_pitch" + index).append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>" + response.msg + "</span></div>");
                    }
                },
                onProgress: function (id, fileName, loaded, total) {
                    var percent = Math.round((loaded / total) * 100);
                    eval("$upload_pitch" + index).next().find('.progress-bar').progressbar({
                        value: percent
                    });
                },
                showMessage: function (msg) {
                    eval("$upload_pitch" + index).find('.qq-upload-fail').remove();
                    eval("$upload_pitch" + index).append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>" + msg + "</span></div>");
                }
            });
        }

        function trash(index) {
            eval("$upload_pitch" + index).next('.upload-box').remove();
        }

        function hasFile(params, response, index, cond) {console.log(cond)
            if (cond) {
                var tpl = '<video style="width: 7%;vertical-align:middle">' +
                        '<source src="' + App.pre_path + response.filename.split('/').slice(-2).join('/') + '" type="video/mp4">' +
                        '<source src="' + App.pre_path + response.filename.split('/').slice(-2).join('/') + '" type="video/webm">' +
                        '<source src="' + App.pre_path + response.filename.split('/').slice(-2).join('/') + '" type="video/ogg">' +
                        '<source src="' + App.pre_path + response.filename.split('/').slice(-2).join('/') + '" type="video/ogv">' +
                        '</video>'

                $('.progress-bar').eq(index).hide();
                eval("$upload_pitch" + index).find('.qq-upload-fail').remove();
                eval("$upload_pitch" + index).find('.qq-upload-success').hide();
                eval("$upload_pitch" + index).find('.qq-upload-list').css('z-index', '-1');
                eval("$upload_pitch" + index).next('.upload-box').find('.filename').append('<a class="videoFiles fancybox.ajax" target="_blank" videoPlay="' + App.pre_path + response.filename.split('/').slice(-2).join('/') + '" href="templates/components/video-play.phtml">' + tpl + '</a>');
                eval("$upload_pitch" + index).next('.upload-box').find('.filename').append('<p class="name ellipsis">' + response.org_name + '</p>');
                eval("$upload_pitch" + index).next('.upload-box').find('.filename').append('<img src="public/images/material_icons/circle-close.svg" onclick="angular.element(this).scope().EditCampaignsCtrl.trash(' + index + ')">');
            }
            else {
                setTimeout(function () {
                    var tpl1 = '<video style="width: 7%;vertical-align:middle">' +
                            '<source src="' + response[params.file] + '" type="video/mp4">' +
                            '<source src="' + response[params.file] + '" type="video/webm">' +
                            '<source src="' + response[params.file] + '" type="video/ogg">' +
                            '<source src="' + response[params.file] + '" type="video/ogv">' +
                            '</video>'
                    eval("$upload_pitch" + index).after(uploadTemplate);
                    eval("$upload_pitch" + index).next('.upload-box').find('.progress-bar').hide();
                    eval("$upload_pitch" + index).next('.upload-box').find('.filename').append('<a class="videoFiles fancybox.ajax" target="_blank" videoPlay="' + response[params.file] + '" href="templates/components/video-play.phtml">' + tpl1 + '</a>');
                    eval("$upload_pitch" + index).next('.upload-box').find('.filename').append('<p class="name ellipsis">' + response[params.name] + '</p>');
                    eval("$upload_pitch" + index).next('.upload-box').find('.filename').append('<img src="public/images/material_icons/circle-close.svg" onclick="angular.element(this).scope().EditCampaignsCtrl.trash(' + index + ')">');
                    eval("$upload_pitch" + index).next('.upload-box').append("<input type='hidden' name='" + params.file + '_s3' + "' value='" + response[params.file] + "' />").show();
                    eval("$upload_pitch" + index).next('.upload-box').append("<input type='hidden' name='" + params.name + '_s3' + "' value='" + response[params.name] + "' />").show();
                }, 100)
            }
        }

        function updateCampaign(isValid) {

            if (!isValid) {
                vm.errCond = true;
            }
            else {
                vm.errCond = false;
                vm.loader = true;
                angular.element('.box-footer .disabled').css('pointer-events', 'none');
                var data = $('form[name="edit_campaigns_form"]').serialize();
                return $http({
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    method: 'POST',
                    url: App.base_url + 'add_campaign',
                    data: data + '&' + $.param({
                        request_type: 'edit'
                    }),
                })
                        .then(function (response) {
                            vm.loader = false;
                            angular.element('.box-footer .disabled').css('pointer-events', 'auto');
                            if (response.data.status_code == 200) {
                                vm.back();
                            }
                            else if (response.data.status_code == 400) {
                                $window.location = App.base_url + 'logout';
                            }

                        })
            }
        }

        function resetLocation(city) {
            if (city == undefined) {
                vm.campaignDetails.location.zip_code = "";
                vm.campaignDetails.location.state = "";
                vm.campaignDetails.location.country = "";
            }
        }

        $scope.$on('newJobDataEditCmp', function (event, data) {
            vm.jobsList.push(data);
            var id = data.post_id.toString();
            vm.campaignDetails.job_ids.push(id)
            vm.campaignDetails.job_ids = angular.copy(vm.campaignDetails.job_ids);
            setTimeout(function () {
                $('#mul_select').trigger('chosen:updated')
            }, 100);
            setTimeout(function () {
                for (var j = 0; j < vm.prevSelectedJobIds.length; j++) {
                    for (var i = 0; i < $('.chosen-choices li.search-choice').length - 1; i++) {
                        if ($('.chosen-choices li a').eq(i).attr('data-option-array-index') == vm.prevSelectedJobIds[j]) {
                            $('.chosen-choices li a').eq(i).remove();
                            break;
                        }
                    }
                }

            }, 200);
        });

        vm.back = back;
        function back() {
            if ($rootScope.campaignCond == 1)
                $state.go('app.campaigns.allCampaigns')
            else
                $state.go('app.campaigns.myCampaigns')
        }

        vm.share = share;

        function share() {
            $uibModal.open({
                animation: false,
                backdrop: 'static',
                keyboard: false,
                templateUrl: 'templates/campaigns/social-share-modal.phtml',
                openedClass: "social-share",
                controller: 'SocialShareController',
                controllerAs: 'SocialShareCtrl'
            });
        }

    }

    function FormBuilderController($scope, $http, $q, $uibModal) {
        var vm = this;

        vm.builderReadOnly = false;
        vm.showResponseData = false;
        vm.formBuilder = {};
        vm.optionsBuilder = {};

        vm.formData = null;
        $http.get('form-data.json')
                .then(function (res) {
                    vm.formData = res.data;
                });

        vm.formStatus = {};

        vm.onImageSelection = function () {

            var d = $q.defer();
            var src = prompt("Please enter image src");
            if (src != null) {
                d.resolve(src);
            } else {
                d.reject();
            }

            return d.promise;
        };

        // reset form builder
        vm.resetBuilder = function () {
            if (vm.formBuilder.reset) {
                vm.formBuilder.reset();
            }
        };

        vm.showResponseModal = showResponseModal;
        function showResponseModal(flag) {
            if (flag) {
                vm.modalInstance = $uibModal.open({
                    animation: false,
                    keyboard: false,
                    backdrop: 'static',
                    templateUrl: 'form_build_json.phtml',
                    openedClass: "form-build",
                    scope: $scope
                });
            }
        }
    }

    function SocialShareController($state, $rootScope, CampaignsData, CompanyDetails, App) {

        $(".google-map").fancybox({
            maxWidth: 800,
            maxHeight: 600,
            fitToView: false,
            width: '70%',
            height: '70%',
            autoSize: false,
            closeClick: false,
            openEffect: 'none',
            closeEffect: 'none'
        });


        var vm = this;

        // capitalize string in javascript
        function toTitleCase(str) {
            return str.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }

        vm.company_name = CompanyDetails.name;
        vm.details = CampaignsData.getCampaigns();

        vm.copyUrl = App.base_url + 'email/all-campaigns/share?ref=' + vm.details.camp_ref;

        vm.close = close;
        vm.geoLocationUrl = vm.details.location_type == 'onsite' ? ("https://maps.google.com/?output=embed&f=q&source=s_q&hl=en&q=" + vm.details.location.address + ' ,' + vm.details.location.city + ' ,' + vm.details.location.state) : "#";

        var desc = '';
        if (vm.details.location_type != 'online')
            desc = 'Starts on: ' + vm.details.schedule[0].start_on_date + ' and Ends on: ' + vm.details.schedule[0].end_on_date +
                    '. Location: ' + vm.details.location.city + ', ' +
                    vm.details.location.state + ', ' + vm.details.location.country;
        else
            desc = desc = 'Starts on: ' + vm.details.schedule[0].start_on_date + ' and Ends on: ' + vm.details.schedule[0].end_on_date
        vm.socialMedia = {
            socialIcons: ['facebook', 'twitter', 'linkedin', 'googlePlus'],
            url: vm.copyUrl,
            facebook: {
                post_title: 'Here is a campaign at ' + vm.company_name + ' for ' + toTitleCase(vm.details.campaign_name),
                post_url: vm.copyUrl,
                post_img: CompanyDetails.company_logo || '',
                post_msg: desc,
            },
            twitter: {
                text: 'Here is a campaign at ' + vm.company_name + ' for ' + toTitleCase(vm.details.campaign_name) + '. ',
                url: CampaignsData.getCampaigns().bittly_url || vm.copyUrl,
                hashtags: '',
                via: vm.company_name,
                related: ''
            },
            linkedin: {
                url: CampaignsData.getCampaigns().bittly_url || vm.copyUrl,
                title: 'Here is a campaign at ' + vm.company_name + ' for ' + toTitleCase(vm.details.campaign_name),
                summary: desc,
                source: vm.company_name
            },
            googlePlus: {
                url: vm.copyUrl
            }
        }
        vm.details.schedule[0].start_on_date = new Date(vm.details.schedule[0].start_on_date);
        // closing modal
        function close() {
            if ($state.current.name == 'app.campaigns.allCampaigns' || $state.current.name == 'app.campaigns.myCampaigns') {
                $rootScope.selectedFilter = {
                    all: [],
                    single: []
                };
                $rootScope.apiCall(1, '');
            }
        }

    }

    function CreateJobController($http, $timeout, $window, $uibModalInstance, App){
        
        var vm      = this,
            apiCall = ['get_job_functions', 'get_industries', 'get_employment_types', 'get_experiences'];

        vm.createJobResponse      = '';
        vm.disableCreateJobButton = false;
        vm.createJobInProgress = false;

        function init(){
            for (var i = 0; i < apiCall.length; i++) {
                $http({
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    method: 'GET',
                    url: App.base_url + apiCall[i]
                }).success(function (response) {
                    if (response.status_code == 200) {
                        var label = Object.keys(response.data)[0];
                        vm[label] = response.data[label];

                    }
                    else if (response.status_code == 400) {
                        $window.location = App.base_url + 'logout';
                    }
                });
            }
        }
        
        vm.postJob = function (createJobForm) {
            vm.errCond = true;
            if(createJobForm.$valid && vm.jobData.jobDescription.trim().length != 0){
                vm.createJobInProgress = true;
                vm.disableCreateJobButton = true;
                var postJobData = $('form[name="create_job"]').serialize();
                $http({
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    method: 'post',
                    data: postJobData + '&' + $.param({
                        job_period: 'immediate',
                        job_type: 'global'
                    }),
                    url: App.base_url + 'job_post_from_campaigns'
                }).success(function (response) {
                    if (response.status_code == 200) {
                        vm.createJobInProgress = false;
                        vm.createJobResponse   = response.message.msg[0];
                        $timeout(function(){
                            $uibModalInstance.close(response);
                        }, 1000)
                    }
                    else if (response.status_code == 400) {
                        $window.location = App.base_url + 'logout';
                    }
                });
            }
        }

        init();
    }

}());