(function () {
    "use strict";

    angular
            .module('app.company.profile', [])
            /*.directive('customOnChange', customOnChange)
             .directive('customOnChangeOne', customOnChangeOne)*/
            .controller('CompanyProfileController', CompanyProfileController)


    CompanyProfileController.$inject = ['$scope', '$state', '$window', '$http', 'CompanyDetails', 'CONFIG', 'App']


    // input[type=file] directive(onChange)
    /*function customOnChange() {
     return {
     restrict: 'A',
     link: function (scope, element, attrs) {
     var onChangeFunc = scope.$eval(attrs.customOnChange);
     element.bind('change', onChangeFunc);
     }
     };
     }*/

    // multiple images upload
    /*function customOnChangeOne() {
     return {
     restrict: 'A',
     link: function (scope, element, attrs) {
     var onChangeFunc = scope.$eval(attrs.customOnChangeOne);
     var index = attrs.customPara;
     console.log(attrs)
     element.bind('change', function customeName() {
     onChangeFunc(index)
     });
     }
     };
     }*/

    function CompanyProfileController($scope, $state, $window, $http, CompanyDetails, CONFIG, App) {


        var scope = this,
                bol = false;
        this.company = CompanyDetails.name;

        var referralSuccess = false, bonus_org_name = '', bonus_file_name = '';
        var bonus_file_path = '';

        var $referral_bonus = '';

        /* Fancy Box */
        $("#company-logo .fancybox").fancybox({
            helpers: {
                title: {
                    type: 'inside'
                }
            },
            maxWidth: 800
        });
        $(".image-group .fancybox").fancybox({
            helpers: {
                title: {
                    type: 'inside'
                }
            },
            prevEffect: 'none',
            nextEffect: 'none',
            maxWidth: 800
        });


        // GetIndustries
        var get_industries = $http({
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            method: 'GET',
            url: CONFIG.APP_DOMAIN + 'get_industries'
        })

        get_industries.success(function (response) {
            scope.industry_list = response.data.industries;

        })
        get_industries.error(function (response) {
            scope.industry_list = [];
        })

        // Posting Data to API
        this.files_error = false;
        scope.disabled = false;
        this.valid = function () {

            scope.disabled = true;
            scope.cont_load = true;

            var data = $('form[name="company_form_one"]').serialize() +
                    '&' + $('form[name="company_form_two"]').serialize() +
                    '&' + $('form[name="company_form_three"]').serialize();

            var create_company = $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                method: 'POST',
                url: CONFIG.APP_DOMAIN + 'update_company',
                data: data + '&' + $.param({timeZone: new Date().getTimezoneOffset()})
            });

            create_company.success(function (response) {
                if (response.status_code == 200) {
                    scope.company_code = response.data.company_code;
                    scope.go_2 = false;
                    scope.cont_load = false;
                    $window.scrollTo(0, 0);
                    scope.go_3 = true;
                }
                else if (response.status_code == 400) {
                    $window.location = CONFIG.APP_DOMAIN + 'logout';
                }
            });

            create_company.error(function (response) {
                scope.disabled = false;
                scope.cont_load = false;
                console.log(response);
            })
        }

        this.group_size = ['10-50', '50-100', '100-500', '500-1000', '1000-5000', '5000+'];
        if (CompanyDetails.employees_no >= 10 && CompanyDetails.employees_no <= 50)
            this.groupSize = this.group_size[0];
        else if (CompanyDetails.employees_no >= 50 && CompanyDetails.employees_no <= 100)
            this.groupSize = this.group_size[1];
        else if (CompanyDetails.employees_no >= 101 && CompanyDetails.employees_no <= 500)
            this.groupSize = this.group_size[2];
        else if (CompanyDetails.employees_no >= 501 && CompanyDetails.employees_no <= 1000)
            this.groupSize = this.group_size[3];
        else if (CompanyDetails.employees_no >= 1001 && CompanyDetails.employees_no <= 5000)
            this.groupSize = this.group_size[4];
        else
            this.groupSize = this.group_size[5];

        this.go_0 = true;

        this.comp1_show_error = false;
        this.comp2_show_error = false;
        this.comp3_show_error = false;

        this.jump = function (go, isValid) {
            if (go == 2) {
                if (!bol) {
                    setTimeout(function () {
                        companyLogo();
                    }, 10)
                }
            }
            if (!isValid) {
                if (go == 1)
                    this.comp1_show_error = true;
                if (go == 2)
                    this.comp2_show_error = true;
                if (go == 3)
                    this.comp3_show_error = true;
            }
            else {
                $window.scrollTo(0, 0);
                var dif_1 = go - 1;
                var dif_2 = go - 2;
                if (dif_1 >= 0) {
                    var prev_1 = 'go_' + dif_1;
                    this[prev_1] = false;
                }
                if (dif_2 >= 0) {
                    var prev_2 = 'go_' + dif_2;
                    this[prev_2] = false;
                }
                var same = 'go_' + go;
                this[same] = true;

                var sum_1 = go + 1;
                var sum_2 = go + 2;
                var post_1 = 'go_' + sum_1;
                var post_2 = 'go_' + sum_2;
                this[post_1] = false;
                this[post_2] = false;
            }
        }

        // Previous page jumping
        this.prev = function (prev, cur) {
            $window.scrollTo(0, 0);
            var prv = 'go_' + prev;
            this[prv] = true;

            var curr = 'go_' + cur;
            this[curr] = false;
        }

        scope.trash = function () {
            var $referral_bonus = $('#referral-bonus');
            $referral_bonus.find('.drag_img').html('');
            $referral_bonus.find('.qq-upload-list').html('');
            $referral_bonus.find('.qq-upload-list').css('z-index', '-1');
            $referral_bonus.find('.qq-upload-drop-area').css('display', 'none');
            $referral_bonus.find('.qq-upload-button').show();
        }


        this.upload_contacts = function () {
            $window.scrollTo(0, 0);
            $state.go('importContacts');
        }


        /* New qq-uploader */
        function companyLogo() {
            bol = true;
            // Company logo qq-uploader
            var $company_logo = $('#company-logo');
            App.Helpers.initUploader({
                id: "company-logo",
                dragText: "",
                uploadButtonText: "",
                size: (1 * 1024 * 1024),
                allowedExtensions: ["jpg", "jpeg", "png"],
                action: App.base_url + "file_upload",
                showFileInfo: false,
                shortMessages: true,
                remove: true,
                file_name: 'logo_org_name',
                path_name: 'logo_image',
                onSubmit: function (id, name) {
                    $company_logo.find('.qq-upload-list').css('z-index', '0');
                },
                onComplete: function (id, name, response) {
                    if (response.success) {
                        $company_logo.find('.qq-upload-list').css('z-index', '-1');
                        $company_logo.find('.qq-upload-drop-area').css('display', 'block');
                        $scope.$apply();
                        App.Helpers.loadImage({
                            target: $company_logo.find('.drag_img'),
                            css: 'img-thumbnail',
                            remove: true,
                            view: true,
                            url_prefix: App.API_DOMAIN,
                            url: response.filename,
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
                    $scope.$apply();
                },
                onRemoveComplete: function () {
                    $company_logo.find('.qq-upload-list').css('z-index', '-1');
                }
            });

            // Multiple image upload
            for (var i = 0; i < 4; i++) {
                window["$mul_images_" + i] = $('#multiple-images-' + i);
                calBack(i);
            }
            function calBack(index) {

                App.Helpers.initUploader({
                    id: "multiple-images-" + index,
                    dragText: "",
                    uploadButtonText: "",
                    size: (1 * 1024 * 1024),
                    allowedExtensions: ["jpg", "jpeg", "png"],
                    action: App.base_url + "file_upload",
                    showFileInfo: false,
                    shortMessages: true,
                    remove: true,
                    file_name: 'org_name[]',
                    path_name: 'photos[]',
                    onSubmit: function (id, name) {
                        eval("$mul_images_" + index).find('.qq-upload-list').css('z-index', '0');
                    },
                    onComplete: function (id, name, response) {
                        if (response.success) {
                            eval("$mul_images_" + index).find('.qq-upload-list').css('z-index', '-1');
                            eval("$mul_images_" + index).find('.qq-upload-drop-area').css('display', 'block');
                            $scope.$apply();
                            App.Helpers.loadImage({
                                target: eval("$mul_images_" + index).find('.drag_img'),
                                css: 'img-thumbnail',
                                remove: true,
                                view: true,
                                url_prefix: App.API_DOMAIN,
                                url: response.filename,
                                onComplete: App.Helpers.setImagePosition,
                                onError: function () {
                                    eval("$mul_images_" + index).find('.qq-upload-button').show();
                                }
                            });
                        }
                    },
                    showMessage: function (msg, obj) {
                        eval("$mul_images_" + index).closest('.form-group').find('div.error').hide();
                        eval("$mul_images_" + index).find('.qq-upload-list').css('z-index', '0');
                        $(obj._listElement).fadeIn();
                    },
                    onRemove: function () {
                        $scope.$apply();
                    },
                    onRemoveComplete: function () {
                        eval("$mul_images_" + index).find('.qq-upload-list').css('z-index', '-1');
                    }
                });
            }

            // Referral Bonus upload
            var $referral_bonus = $('#referral-bonus');
            App.Helpers.initUploader({
                id: "referral-bonus",
                dragText: "",
                uploadButtonText: "Upload a file",
                size: (10 * 1024 * 1024),
                allowedExtensions: ['csv', 'pdf', 'doc', 'docx'],
                action: App.base_url + "file_upload",
                showFileInfo: false,
                shortMessages: true,
                remove: true,
                file_name: 'referral_org_name',
                path_name: 'referral_bonus_file',
                onSubmit: function (id, name) {
                    $referral_bonus.find('.qq-upload-list').css('z-index', '0');
                },
                onComplete: function (id, name, response) {
                    if (response.success) {
                        $scope.$apply();
                        bonus_file_path = App.API_DOMAIN + response.filename;
                        $referral_bonus.find('.qq-upload-list').css('z-index', '-1');
                        $referral_bonus.find('.qq-upload-list .qq-upload-success').css('background', 'transparent');
                        $referral_bonus.find('.qq-upload-list .upload-success').hide();
                        $referral_bonus.find('.qq-upload-button').hide();
                        $referral_bonus.find('.drag_img').css('background', 'transparent');
                        $referral_bonus.find('.qq-upload-drop-area').css('display', 'block');
                        $referral_bonus.find('.qq-upload-drop-area .drag_img').html('<a href="' + App.base_url + 'viewer?url=' + bonus_file_path + '" class="view" target="_blank"><img src="public/images/Applied.svg"><p class="ellipsis" title="' + response.org_name + '">' + response.org_name + '&nbsp;</p></a>');
                        $referral_bonus.find('.drag_img').append('<a href="' + bonus_file_path + '" download class="download"><img src="public/images/material_icons/download.svg"></a><img src="public/images/material_icons/circle-close.svg" onclick="angular.element(this).scope().compCtrl.trash()" style="margin-top:-4px">');
                    }
                    else {
                        $referral_bonus.find('.qq-upload-button').show();
                        $referral_bonus.find('.qq-upload-fail').remove();
                        $referral_bonus.append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>" + response.msg + "</span></div>");
                    }
                },
                showMessage: function (msg, obj) {
                    $referral_bonus.closest('.form-group').find('div.error').hide();
                    $referral_bonus.find('.qq-upload-list').css('z-index', '0');
                    $(obj._listElement).fadeIn();
                },
                onRemove: function () {
                    $scope.$apply();
                },
                onRemoveComplete: function () {
                    $referral_bonus.find('.qq-upload-list').css('z-index', '-1');
                }
            })
        }



    }





}());
