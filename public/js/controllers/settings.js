(function () {
    "use strict";
    angular
            .module('app.settings', ['ngAutocomplete'])
            .controller('SettingsController', SettingsController)
            .controller('SettingsCompanyProfileController', SettingsCompanyProfileController)
            .controller('MyProfileController', MyProfileController)
            .controller('UserGroupController', UserGroupController)
            .controller('ConfigManagerController', ConfigManagerController)
            .controller('IntManagerController', IntManagerController)
            .service('permissionsService', permissionsService)
            .directive('pwMatch', pwMatch)

    SettingsController.$inject = [];
    SettingsCompanyProfileController.$inject = ['$window', 'CompanyDetails', '$http', 'CONFIG'];
    MyProfileController.$inject = ['$http', '$scope', '$window', '$uibModal', 'UserDetails', 'CONFIG', 'App'];
    UserGroupController.$inject = ['$scope', '$window', '$element', 'CONFIG', '$http', '$q', 'permissionsService', 'userPermissions', 'App'];
    ConfigManagerController.$inject = ['$window', '$scope', '$timeout', '$http', 'App'];
    IntManagerController.$inject = ['$scope', '$window', '$state','$timeout', '$http', 'App'];

    function permissionsService() {
        var permissionData = {};
        this.setPermissions = function (data) {
            permissionData = data;
        }

        this.getPermissions = function () {
            return permissionData
        }

        this.addPermissions = function (prop, val) {
            permissionData[prop] = val;
        }

    }

    function pwMatch() {
        return {
            require: 'ngModel',
            link: function (scope, elem, attrs, ctrl) {
                var rePassword = '#' + attrs.pwMatch;
                elem.add(rePassword).on('keyup', function () {
                    scope.$apply(function () {
                        var v = elem.val() === $(rePassword).val();
                        ctrl.$setValidity('pwmatch', v);
                    });
                });
            }
        }

    }

    function SettingsController() {

    }

    function SettingsCompanyProfileController($window, CompanyDetails, $http, CONFIG) {

        var vm = this;
        var APP_URL = CONFIG.APP_DOMAIN;
        vm.companyDetails = {};
        vm.industry_list = {};
        vm.number_of_employees = ["10-50", "50-100", "100-500", "500-1000", "1000-5000", "5000+"];
        $http({
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            method: 'GET',
            url: CONFIG.APP_DOMAIN + 'get_industries'
        })
                .then(function (response) {
                    vm.industry_list = response.data.data.industries;
                }, function (response) {
                    vm.industry_list = [];
                })

        $http({
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            method: 'POST',
            data: $.param({
                company_code: CompanyDetails.company_code
            }),
            url: APP_URL + 'view_company_details'
        })
                .then(function (response) {
                    if (response.data.status_code == 200) {
                        vm.companyDetails = response.data.data.companyDetails
                    }
                    else if (response.data.status_code == 400) {
                        $window.location = CONFIG.APP_DOMAIN + 'logout';
                    }

                }, function (response) {

                })

    }

    function MyProfileController($http, $scope, $window, $uibModal, UserDetails, CONFIG, App) {

        var vm = this,
                $display_pic, image_path = '';
        vm.errCond = false;
        vm.loader = false;
        vm.modalLoader = false;
        vm.message = false;
        vm.has_image = false;
        vm.changeFound = false;

        vm.myProfile = angular.copy(UserDetails);
        vm.passwords = {};
        vm.backendMsg = '';
        vm.successMsg = '';
        vm.modalInstance = '';
        vm.setPassword = setPassword;
        vm.saveChanges = saveChanges;
        vm.changePassword = changePassword;
        if (UserDetails.user_dp != null && UserDetails.user_dp != '') {
            vm.myProfile.user_dp = UserDetails.user_dp;
        }
        else {
            vm.myProfile.user_dp = '';
        }

        // Reseting errors
        function resetErrors() {
            vm.passwords = {};
            vm.backendMsg = '';
            vm.modalLoader = false;
            vm.errCond = false;
        }

        //  update user profile and company logo
        function saveChanges(isValid) {
            if (!isValid) {
                vm.errCond = true;
            }
            else {
                vm.errCond = false;
                vm.loader = true;
                var formData = $('form[name="my_profile_form"]').serialize();
                angular.element('.disabled').css('pointer-events', 'none');
                var updateUser = $http({
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    method: 'POST',
                    url: CONFIG.APP_DOMAIN + 'update_user',
                    data: formData
                })

                updateUser.success(function (response) {
                    angular.element('.disabled').css('pointer-events', 'auto');
                    vm.loader = false;
                    if (response.status_code == 200) {
                        angular.extend(UserDetails, vm.myProfile);
                        angular.element('header .user_dp + .user_name').text(UserDetails.user_name);
                        if (response.data.hasOwnProperty('user_dp')) {
                            if (response.data.user_dp != '') {
                                UserDetails.user_dp = response.data.user_dp;
                                image_path = response.data.user_dp;
                                App.Helpers.loadImage({
                                    target: $display_pic.find('.drag_img'),
                                    css: 'img-circle',
                                    remove: true,
                                    url_prefix: false,
                                    url: image_path,
                                    onComplete: function () {
                                        $display_pic.find('.qq-upload-list').html('');
                                        $display_pic.find('.qq-upload-list').append("<li><input type='hidden' name='photo_org_name_s3' value='" + image_path.split('/').pop() + "' /><input type='hidden' value='" + image_path + "' name='photo_s3'/></li>").show();
                                    },
                                    onError: function () {
                                        $display_pic.find('.qq-upload-button').show();
                                    }
                                });
                            }
                            else {
                                UserDetails.user_dp = '';
                            }
                        }
                        else {
                            UserDetails.user_dp = '';
                        }
                        $scope.my_profile_form.$setPristine();
                        vm.changeFound = false;
                        vm.message = true;
                        vm.successMsg = response.message.msg[0];
                        setTimeout(function () {
                            vm.message = false;
                            $scope.$apply()
                        }, 2000);
                    }
                    else if (response.status_code == 400) {
                        $window.location = CONFIG.APP_DOMAIN + 'logout';
                    }
                })

                updateUser.error(function (response) {
                    console.log(response)
                })
            }
        }

        // set password
        function changePassword(isValid) {
            vm.errCond = false;
            vm.backendMsg = false;
            if (!isValid) {
                vm.errCond = true;
            }
            else {
                vm.errCond = false;
                vm.modalLoader = true;
                var formData = $('form[name="change_password_form"]').serialize();
                angular.element('.disabled').css('pointer-events', 'none');
                var changePassword = $http({
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    method: 'POST',
                    url: CONFIG.APP_DOMAIN + 'change_password',
                    data: formData
                })

                changePassword.success(function (response) {
                    vm.modalLoader = false;
                    angular.element('.disabled').css('pointer-events', 'auto');
                    if (response.status_code == 200) {
                        vm.modalInstance.dismiss();
                        vm.message = true;
                        vm.successMsg = response.message.msg[0];
                        setTimeout(function () {
                            vm.message = false;
                            $scope.$apply()
                        }, 3000);
                    }
                    else if (response.status_code == 403) {
                        vm.backendMsg = response.message.msg[0];
                    }
                    else if (response.status_code == 400) {
                        $window.location = CONFIG.APP_DOMAIN + 'logout';
                    }
                })

                changePassword.error(function (response) {
                    console.log(response)
                })
            }
        }

        // modal window for set passwords
        function setPassword() {
            resetErrors();
            vm.modalInstance = $uibModal.open({
                animation: false,
                keyboard: false,
                backdrop: 'static',
                templateUrl: 'templates/settings/set-password.phtml',
                openedClass: "set-password",
                scope: $scope
            });
        }


        // qq-uploader
        var $display_pic = $('#display_pic');
        App.Helpers.initUploader({
            id: "display_pic",
            dragText: "",
            uploadButtonText: "",
            size: (10 * 1024 * 1024),
            allowedExtensions: ["jpg", "jpeg", "png"],
            action: App.base_url + "file_upload",
            showFileInfo: false,
            shortMessages: true,
            remove: true,
            file_name: 'photo_org_name',
            path_name: 'photo',
            onSubmit: function (id, name) {
                $display_pic.find('.qq-upload-list').css('z-index', '0');
            },
            onComplete: function (id, name, response) {
                if (response.success) {
                    $display_pic.find('.qq-upload-list').css('z-index', '-1');
                    $display_pic.find('.qq-upload-drop-area').css({
                        'display': 'block',
                        'background': 'transparent'
                    });
                    $display_pic.find('.drag_img').css('background', 'transparent');
                    vm.has_image = true;
                    vm.changeFound = true;
                    $scope.$apply();
                    App.Helpers.loadImage({
                        target: $display_pic.find('.drag_img'),
                        css: 'img-circle',
                        remove: true,
                        url_prefix: App.pre_path,
                        url: response.filename.split('/').slice(-2).join('/'),
                        onComplete: App.Helpers.setImagePosition,
                        onError: function () {
                            $display_pic.find('.qq-upload-drop-area').hide();
                            $display_pic.find('.qq-upload-button').show();
                        }
                    });
                }
            },
            showMessage: function (msg, obj) {
                $display_pic.closest('.form-group').find('div.error').hide();
                $display_pic.find('.qq-upload-list').css('z-index', '0');
                $(obj._listElement).fadeIn();
            },
            onRemove: function () {
                vm.has_image = false;
                vm.changeFound = true;
                $scope.$apply();
            },
            onRemoveComplete: function () {
                $display_pic.find('.qq-upload-list').css('z-index', '-1');
            }
        });

        if (vm.myProfile.user_dp != '') {
            $display_pic.find('.qq-upload-drop-area').css({
                'display': 'block',
                'background': 'transparent'
            });
            $display_pic.find('.drag_img').css('background', 'transparent');
            vm.has_image = true;
            image_path = vm.myProfile.user_dp;
            App.Helpers.loadImage({
                target: $display_pic.find('.drag_img'),
                css: 'img-circle',
                remove: true,
                url_prefix: false,
                url: vm.myProfile.user_dp,
                onComplete: function () {
                    $display_pic.find('.qq-upload-list').append("<li><input type='hidden' name='photo_org_name_s3' value='" + image_path.split('/').pop() + "' /><input type='hidden' value='" + image_path + "' name='photo_s3'/></li>").show();
                },
                onError: function () {
                    $display_pic.find('.qq-upload-drop-area').hide();
                    $display_pic.find('.qq-upload-button').show();
                }
            });
        }

    }


    function UserGroupController($scope, $window, $element, CONFIG, $http, $q, permissionsService, userPermissions, App) {

        var vm = this,
                APP_URL = CONFIG.APP_DOMAIN,
                image_path = '', org_name;

        // google api for location field
        this.geo_location = '';
        this.geo_options = null;
        this.geo_details = '';
        vm.newUser = false;
        vm.errCond = false;
        vm.loader = false;
        vm.group = true;
        vm.changeFound = {
            group: false,
            person: false
        };
        vm.readable = false;
        vm.personDetails = {};
        vm.permissions = {};
        vm.backendError = '';
        vm.tab = '';
        vm.subTab = '';
        vm.statusText = ['Active', 'Inactive'];
        vm.changePermission = changePermission;
        vm.getGroupData = getGroupData;
        vm.getPersonData = getPersonData;
        vm.addNew = addNew;
        vm.createGroup = createGroup;
        vm.addPerson = addPerson;
        vm.resendActivation = resendActivation;
        vm.permission_template = "templates/settings/permissions_template.phtml";
        vm.group_template = "templates/settings/group-template.phtml";
        vm.person_template = "templates/settings/person-template.phtml";
        // color picker
        var colorCode = ["#21A4AC", "#EE8F3B", "#2A99E0", "#154c50", "#103954", "#342158", "#5B5B29", "#004D40", "#229A77", "#6f2b25"];
        vm.colorPicker = function (ind) {
            return colorCode[String(ind).slice(-1)];
        }

        vm.pageLoader = false;

        var canceller = $q.defer();
        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if (toState.name != 'app.settings.userGroups')
                canceller.resolve()
        });
        // fab button materialize js
        $('.fixed-action-btn').hover(function () {
            $(this).addClass('active');
        }, function () {
            $(this).removeClass('active');
        })


        vm.permission_switches = {
            2: [
                {id: 1, label: 'Yes'},
                {id: 0, label: 'No'}
            ],
            3: [
                {id: 0, label: 'None'},
                {id: 1, label: 'View'},
                {id: 2, label: 'Edit'}
            ],
            4: [
                {id: 1, label: 'Manager'},
                {id: 2, label: 'Employee'},
                {id: 3, label: 'Client'},
                {id: 4, label: 'Others'}
            ]
        }


        // reset previous errors
        function resetErrors() {
            vm.errCond = false;
            vm.backendError = '';
            image_path = '';
            vm.message = false;
            vm.changeFound = {
                group: false,
                person: false
            };
        }


        // job title autocomplete
        vm.getServices = function (userInputString, timeoutPromise) {
            var services = [];

            return $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                data: $.param({search: userInputString}),
                url: CONFIG.APP_DOMAIN + 'company_all_contacts',
                timeout: timeoutPromise
            })
                    .then(function (response) {
                        services = response.data.data;
                        return  {"data": services}
                    })
        }

        vm.selectedEmail = function (obj) {
            if (obj != undefined && obj.hasOwnProperty('originalObject')) {
                vm.personDetails.fullname = obj.originalObject.firstname + ' ' + obj.originalObject.lastname;
                vm.personDetails.status = obj.originalObject.status;
            }
            else {
                vm.personDetails.fullname = '';
                vm.personDetails.status = '';
            }
        }


        // user permissions API
        function UserPermissions() {
            $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: APP_URL + 'permissions'
            })
                    .then(function (response) {
                        if (response.data.status_code == 200) {
                            permissionsService.setPermissions(response.data.data.permissions);
                            getGroups();
                        }
                        else if (response.data.status_code == 400) {
                            $window.location = CONFIG.APP_DOMAIN + 'logout';
                        }

                    }, function (response) {
                        console.log(response)
                    })
        }

        UserPermissions();
        // get groups API
        function getGroups() {
            $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: APP_URL + 'get_groups',
                timout: canceller.promise
            })
                    .then(function (response) {
                        if (response.data.status_code == 200) {
                            vm.pageLoader = true;
                            vm.groupsList = response.data.data.groups;
                            vm.groupNames = vm.groupsList;
                            getGroupData(0);
                        }
                        else if (response.data.status_code == 403) {
                            vm.backendError = response.data.message.msg[0];
                        }
                        else if (response.data.status_code == 400) {
                            $window.location = CONFIG.APP_DOMAIN + 'logout';
                        }

                    }, function (response) {
                        console.log(response)
                    })
        }

        // get group details
        function getGroupData(id) {
            resetErrors();
            vm.tab = id;
            vm.subTab = -1;
            vm.newUser = false;
            vm.group = true;
            vm.title = vm.groupsList[id].name;
            vm.permissionsList = permissionsService.getPermissions();
            vm.groupData = angular.copy(vm.groupsList[id]);
            vm.permissions = angular.copy(vm.groupsList[id].permissions);
            if (vm.groupData.is_primary != 1 && userPermissions.is_primary == 1) {
                setTimeout(function () {
                    $('form[name="new_group_form"] input[type="text"]:first').focus()
                }, 10);
            }

            if (userPermissions.is_primary == 0 || vm.groupData.is_primary == 1) {
                vm.readable = true;
            }
            else {
                vm.readable = false;
            }
        }

        // change permissions
        function changePermission(permission, btn, parent_id) {
            vm.changeFound.group = true;
            if (permission.type == 'check') {
                if (parent_id) {
                    vm.permissions[parent_id + '_' + permission.id] = btn.target.checked;
                } else {
                    vm.permissions[permission.id] = btn.target.checked;
                }

                angular.forEach(permission.children, function (c) {
                    vm.permissions[permission.id + '_' + c.id] = btn.target.checked;
                });
            } else {
                if (parent_id) {
                    vm.permissions[parent_id + '_' + permission.id] = btn.id;
                } else {
                    vm.permissions[permission.id] = btn.id;
                }

                angular.forEach(permission.children, function (c) {
                    vm.permissions[permission.id + '_' + c.id] = btn.id >= 1 ? 1 : 0;
                });
            }
        }
        // get user details
        function getPersonData(index) {
            resetErrors();
            vm.subTab = index;
            vm.group = false;
            vm.newPerson = false;
            setTimeout(function () {
                qquploader(1, vm.groupData.users[index].photo);
            }, 100);
            vm.personDetails = angular.copy(vm.groupsList[vm.tab].users[index]);
            vm.personDetails.group_id = vm.groupData.group_id;
            if (userPermissions.is_primary == 1) {
                vm.readable = false;
                setTimeout(function () {
                    $('form[name="new_user_form"] input[name="designation"]').focus();
                }, 100);
            }
            else {
                vm.readable = true;
            }
        }


        // add New group or person
        function addNew(cond) {
            resetErrors();
            vm.readable = false;
            if (cond == 'group') {
                vm.group = true;
                vm.newUser = true;
                vm.tab = -1;
                vm.groupData = {};
                vm.admin = permissionsService.getPermissions();
                for (var i = 0; i < vm.admin.length; i++) {
                    vm.permissions[vm.admin[i].id] = 0;
                    if (vm.admin[i].children.length > 0) {
                        vm.permissions[vm.admin[i].id] = 0;
                        for (var j = 0; j < vm.admin[i].children.length; j++) {
                            vm.permissions[vm.admin[i].id + '_' + vm.admin[i].children[j].id] = 0;
                        }
                    }
                }
                setTimeout(function () {
                    $('form[name="new_group_form"] input[type="text"]:first').focus();
                }, 100);
            }
            else {
                vm.group = false;
                vm.newPerson = true;
                vm.subTab = -1;
                vm.personDetails = {};
                vm.personDetails.group_id = vm.tab != -1 ? vm.groupNames[vm.tab].group_id : '';

                $scope.$broadcast('angucomplete-alt:clearInput', 'ex1');
                // qq uploader
                setTimeout(function () {
                    qquploader();
                }, 100);
                setTimeout(function () {
                    $('form[name="new_user_form"] input[name="emailid"]').focus();
                }, 100);
            }
        }

        //  edit or add group
        function createGroup(isValid, id, flag) {
            flag = flag == true ? 0 : 1;
            if (!isValid) {
                vm.errCond = true;
            }
            else {
                vm.errCond = false;
                vm.loader = true;
                angular.element('.disabled').css('pointer-events', 'none');
                var data = $('form[name="new_group_form"]').serialize();
                $http({
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    method: 'POST',
                    data: data + '&' + $.param({
                        action: flag,
                        group_id: id
                    }),
                    url: APP_URL + 'add_group'
                })
                        .then(function (response) {
                            vm.loader = false;
                            angular.element('.disabled').css('pointer-events', 'auto');
                            if (response.data.status_code == 200) {
                                vm.backendError = '';
                                if (vm.changeFound.group) {
                                    vm.changeFound.group = false;
                                }
                                var formController = $element.find('form[name="new_group_form"]').eq(0).controller('form');
                                formController.$setPristine();
                                if (flag == 0) {
                                    getGroups();
                                }
                                else {
                                    vm.groupsList[vm.tab] = angular.copy(vm.groupData);
                                    vm.groupsList[vm.tab].permissions = angular.copy(vm.permissions);
                                    vm.title = vm.groupsList[vm.tab].name;
                                }
                                vm.message = true;
                                vm.backendMsg = response.data.message.msg[0];
                                setTimeout(function () {
                                    vm.message = false;
                                    $scope.$apply()
                                }, 3000);
                            }
                            else if (response.data.status_code == 403) {
                                vm.backendError = response.data.message.msg[0];
                            }
                            else if (response.data.status_code == 400) {
                                $window.location = CONFIG.APP_DOMAIN + 'logout';
                            }
                        }, function (response) {
                            console.log(response)
                        })
            }
        }

        // add single person
        function addPerson(isValid, userId, flag) {
            flag = flag == true ? 0 : 1;
            vm.backendError = '';
            if (!isValid) {
                vm.errCond = true;
            }
            else {
                vm.errCond = false;
                vm.loader = true;
                angular.element('.disabled').css('pointer-events', 'none');
                var formData = $('form[name="new_user_form"]').serialize();
                $http({
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    method: 'POST',
                    data: formData + '&' + $.param({
                        action: flag,
                        user_id: userId
                    }),
                    url: APP_URL + 'add_user'
                })
                        .then(function (response) {
                            vm.loader = false;
                            angular.element('.disabled').css('pointer-events', 'auto');
                            if (response.data.status_code == 200) {
                                vm.backendError = '';
                                if (vm.changeFound.person) {
                                    vm.changeFound.person = false;
                                }
                                var formController = $element.find('form[name="new_user_form"]').eq(0).controller('form');
                                formController.$setPristine();
                                if (flag == 0) {
                                    getGroups();
                                }
                                else {
                                    if (vm.groupsList[vm.tab].group_id != vm.personDetails.group_id) {
                                        for (var i = 0; i < vm.groupsList.length; i++) {
                                            if (vm.groupsList[i].group_id == vm.personDetails.group_id) {
                                                var obj = vm.personDetails;
                                                vm.groupsList[i].users.push(obj);
                                                vm.groupsList[i].count_of_users++;
                                                vm.groupsList[vm.tab].users.splice(vm.subTab, 1);
                                                vm.groupsList[vm.tab].count_of_users--;
                                                vm.subTab = -1;
                                                vm.getGroupData(vm.tab);
                                            }
                                        }
                                    }
                                    else {
                                        vm.groupsList[vm.tab].users[vm.subTab] = angular.copy(vm.personDetails);
                                        vm.groupsList[vm.tab].users[vm.subTab].photo = angular.copy(response.data.data.photo);
                                    }
                                    if (response.data.data.photo != '') {
                                        image_path = response.data.data.photo;
                                        org_name = response.data.data.photo.split('/').pop();
                                        App.Helpers.loadImage({
                                            target: $('#display_pic').find('.drag_img'),
                                            css: 'img-circle',
                                            remove: true,
                                            url_prefix: false,
                                            url: image_path,
                                            onComplete: function () {
                                                $('#display_pic').find('.qq-upload-list').html('');
                                                $('#display_pic').find('.qq-upload-list').append("<li><input type='hidden' name='photo_org_name_s3' value='" +
                                                        org_name + "' /><input type='hidden' value='" + image_path +
                                                        "' name='photo_s3'/></li>").show();
                                            },
                                            onError: function () {
                                                $('#display_pic').find('.qq-upload-drop-area').hide();
                                                $('#display_pic').find('.qq-upload-button').show();
                                            }
                                        });
                                    }
                                }
                                vm.message = true;
                                vm.backendMsg = response.data.message.msg[0];
                                setTimeout(function () {
                                    vm.message = false;
                                    $scope.$apply()
                                }, 3000);
                            }
                            else if (response.data.status_code == 403) {
                                if (response.data.message.hasOwnProperty('emailid')) {
                                    vm.backendError = response.data.message.emailid[0];
                                }
                                else {
                                    vm.backendError = response.data.message.msg[0];
                                }
                            }
                            else if (response.data.status_code == 400) {
                                $window.location = CONFIG.APP_DOMAIN + 'logout';
                            }
                        }, function (response) {
                            console.log(response)
                        })
            }
        }

        // resend activation
        function resendActivation(el) {
            $('.' + el.target.className).eq(vm.subTab).css('pointer-events', 'none');
            $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: CONFIG.APP_DOMAIN + 'resend_activation_link',
                data: $.param({
                    emailid: vm.personDetails.emailid
                }),
            })
                    .then(function (response) {
                        $('.' + el.target.className).eq(vm.subTab).css('pointer-events', 'auto');
                        if (response.data.status_code == 200) {
                            vm.groupsList[vm.tab].users[vm.subTab].expired = 0;
                            vm.personDetails.expired = 0;
                            $('#resend_activation').modal();
                        }
                        else if (response.data.status_code == 400) {
                            $window.location = CONFIG.APP_DOMAIN + 'logout';
                        }

                    })
        }


        // qq-uploader
        function qquploader(flag, img) {
            var $display_pic = $('#display_pic');
            App.Helpers.initUploader({
                id: "display_pic",
                dragText: "",
                uploadButtonText: "",
                size: (10 * 1024 * 1024),
                allowedExtensions: ["jpg", "jpeg", "png"],
                action: App.base_url + "file_upload",
                showFileInfo: false,
                shortMessages: true,
                remove: true,
                file_name: 'photo_org_name',
                path_name: 'photo',
                onSubmit: function (id, name) {
                    $display_pic.find('.qq-upload-list').css('z-index', '0');
                },
                onComplete: function (id, name, response) {
                    if (response.success) {
                        $display_pic.find('.qq-upload-list').css('z-index', '-1');
                        $display_pic.find('.qq-upload-drop-area').css({
                            'display': 'block',
                            'background': 'transparent'
                        });
                        $display_pic.find('.drag_img').css('background', 'transparent');
                        vm.textCondition = true;
                        vm.changeFound.person = true;
                        $scope.$apply();
                        App.Helpers.loadImage({
                            target: $display_pic.find('.drag_img'),
                            css: 'img-circle',
                            remove: true,
                            url_prefix: App.pre_path,
                            url: response.filename.split('/').slice(-2).join('/'),
                            onComplete: App.Helpers.setImagePosition,
                            onError: function () {
                                $display_pic.find('.qq-upload-drop-area').hide();
                                $display_pic.find('.qq-upload-button').show();
                            }
                        });
                    }
                },
                showMessage: function (msg, obj) {
                    $display_pic.closest('.form-group').find('div.error').hide();
                    $display_pic.find('.qq-upload-list').css('z-index', '0');
                    $(obj._listElement).fadeIn();
                },
                onRemove: function () {
                    vm.has_image = false;
                    vm.changeFound.person = true;
                    $scope.$apply();
                },
                onRemoveComplete: function () {
                    $display_pic.find('.qq-upload-list').css('z-index', '-1');
                }

            });
            if (flag == 1 && img != '') {
                vm.textCondition = true;
                $scope.$apply();
                image_path = img;
                org_name = img.split('/').pop();
                $display_pic.find('.qq-upload-drop-area').css({
                    'display': 'block',
                    'background': 'transparent'
                });
                $display_pic.find('.drag_img').css('background', 'transparent');
                App.Helpers.loadImage({
                    target: $display_pic.find('.drag_img'),
                    css: 'img-circle',
                    remove: true,
                    url_prefix: false,
                    url: image_path,
                    onComplete: function () {
                        $display_pic.find('.qq-upload-list').append("<li><input type='hidden' name='photo_org_name_s3' value='" +
                                org_name + "' /><input type='hidden' value='" + image_path +
                                "' name='photo_s3'/></li>").show();
                    },
                    onError: function () {
                        $display_pic.find('.qq-upload-drop-area').hide();
                        $display_pic.find('.qq-upload-button').show();
                    }
                });
            }
        }

    }


    function ConfigManagerController($window, $scope, $timeout, $http, App) {
        var vm = this;
        vm.show_error = false;
        vm.uploadSuccess = false;
        vm.spinner = false;
        vm.hasRecord = false;
        vm.changeOccured = false;
        vm.emailsList = [
            {id: 1, email_id: 'adams@infosys.com'},
            {id: 2, email_id: 'adwin.ams@infosys.com'},
            {id: 3, email_id: 'adward.ad123@infosys.com'}
        ]
        vm.loader = true;
        vm.ssoDetails = {};

        vm.save = save;
        vm.trash = trash;

        setTimeout(function () {
            $('#selectJob').chosen()
        }, 1);


        function save(isValid) {
            if (!isValid || !vm.uploadSuccess) {
                vm.show_error = true;
                return
            }
            else {
                vm.show_error = false;
                vm.spinner = true;
                var params = angular.element('form[name="single_signin"]').serialize();

                $http({
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    method: 'POST',
                    data: params + '&' + $.param({action: vm.hasRecord ? 'edit' : 'add'}),
                    url: App.base_url + 'add_configuration'
                })
                        .then(function (response) {
                            vm.spinner = false;
                            if (response.data.status_code == 200) {
                                vm.sucMsg = response.data.message.msg[0];
                                $('.suc').fadeIn();
                                success(response.data.data)
                                $timeout(function () {
                                    $('.suc').fadeOut();
                                    vm.changeOccured = false;
                                    $scope.single_signin.$setPristine();
                                }, 1000);
                            }
                        }, function (response) {

                        })
            }
        }

        function getConfiguration() {
            $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: App.base_url + 'get_configuration'
            })
                    .then(function (response) {
                        vm.loader = false;
                        if (response.data.status_code == 200) {
                            success(response.data.data)
                        }
                        else if (response.data.status_code == 403) {

                        }
                        else {
                            $window.location = App.base_url + 'logout';
                        }
                    }, function (response) {

                    })
        }
        getConfiguration();

        function success(data) {
            vm.ssoDetails = data;
            vm.SSOCheckbox = data.status == 0 ? false : true;
            vm.hasRecord = true;
            if (vm.ssoDetails.certificate != '') {
                var obj = {
                    org_name: vm.ssoDetails.idp_file_name,
                    filename: vm.ssoDetails.certificate
                }
                hasFile(obj, true);
            }
        }

        function trash() {
            vm.uploadSuccess = false;
            vm.changeOccured = true;
            $scope.$apply();
            $upload.find('.qq-upload-drop-area').css('display', 'none');
            $upload.find('.qq-upload-drop-area').html('');
            $upload.find('.qq-upload-list').html('');
        }

        function hasFile(obj, flag) {
            vm.uploadSuccess = true;
            var status = '';
            if (flag) {
                status = 'init';
                $upload.find('.qq-upload-list').html('<input name="certificate_path_s3" type="hidden" value="' + obj.filename + '" ><input name="certificate_org_name" type="hidden" value="' + obj.org_name + '" >')
            }
            else {
                status = 'upload';
                $upload.find('.qq-upload-list').html('<input name="certificate_path" type="hidden" value="' + obj.filename + '" ><input name="certificate_org_name" type="hidden" value="' + obj.org_name + '" >');
            }
            $upload.find('.qq-upload-list').css('z-index', '-1');
            $upload.find('.qq-upload-drop-area').css('background', '#fff');
            $upload.find('.qq-upload-drop-area').css('display', 'block');
            $upload.find('.qq-upload-drop-area').html(template(obj, status));
            upload('change');
        }

        // Upload File
        var $upload = $('#upload');
        function template(obj, flag) {
            var url = '';
            if (flag == 'upload')
                url = App.API_DOMAIN + obj.filename;
            else
                url = obj.filename;
            return  '<div class="up-tmp">' +
                    '  <div class="box clearfix" layout="row">' +
                    '      <img src="public/images/pdf.png" class="avatar pull-left">' +
                    '      <div class="content pull-left">' +
                    '          <p>' + obj.org_name + '</p>' +
                    '      </div>' +
                    '      <i class="material-icons pull-right" onclick="angular.element(this).scope().ConfigMngCtrl.trash()">close</i>' +
                    '  </div>' +
                    '  <div class="action clearfix">' +
                    '      <var style="padding-right: 10px;" id="change">Change</var>' +
                    '      <var style="padding-left: 10px;"><a href="' + App.base_url + 'viewer?url=' + url + '" class="view" target="_blank">View Details</a></var>' +
                    '      <var class="pull-right">(Maximum size is 10MB)</var>' +
                    '  </div>' +
                    '</div>'
        }

        function upload(id) {
            if (id == 'change')
                $timeout(function () {
                    $('#change input[type="file"]').attr('title', ' ');
                }, 100);
            App.Helpers.initUploader({
                id: id,
                dragText: "",
                uploadButtonText: id == 'upload' ? "Upload a file" : 'Change',
                size: (10 * 1024 * 1024),
                allowedExtensions: ['csv', 'pdf', 'doc', 'docx', 'cer'],
                action: App.base_url + "file_upload",
                showFileInfo: false,
                shortMessages: true,
                remove: true,
                file_name: 'certificate_org_name',
                path_name: 'certificate_path',
                onSubmit: function (id, name) {
                    $upload.find('.qq-upload-drop-area').html();
                    $upload.find('.qq-upload-list').css('z-index', '0');
                },
                onComplete: function (id, name, response) {
                    if (response.success) {
                        $upload.find('.qq-upload-list').html('');
                        vm.changeOccured = true;
                        $scope.$apply();
                        hasFile(response, false);
                    }
                    else {
                        vm.uploadSuccess = false;
                        $scope.$apply();
                        $upload.find('.qq-upload-button').show();
                        $upload.find('.qq-upload-fail').remove();
                        $upload.append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>" + response.msg + "</span></div>");
                    }
                },
                showMessage: function (msg, obj) {
                    vm.uploadSuccess = false;
                    $upload.find('.qq-upload-list').css('z-index', '0');
//                $(obj._listElement).fadeIn();
                },
                onRemove: function () {
//                vm.update = true;
//                $scope.$apply();
                },
                onRemoveComplete: function () {
                    $upload.find('.qq-upload-list').css('z-index', '-1');
                }
            })
        }

        upload('upload');
    }

    function IntManagerController($scope, $window, $state, $timeout, $http, App) {

        var vm = this;

        vm.loader = true;
        vm.zenefitsInProgress = false;
        vm.mintmeshPartnes = [];
        vm.showSynWithZenefits = false;
        vm.show_error = false;
        vm.partnerDetails = {};

        //vm.addPartner = addPartner;
        vm.getPartnersData = getPartnersData;
        vm.update = update;

        function dropDown() {
            /*$http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: App.base_url + 'get_hcm_partners'
            })
            .then(function (response) {
                if (response.data.status_code == 200) {
                    vm.mintmeshPartnes = response.data.data;
                    getPartnersData(0)
                }
                else if (response.data.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }
            }, function (response) {

            })*/
            vm.mintmeshPartnes = [{hcm_name : 'SuccessFactors', hcm_id : 1}, {hcm_name : 'Zenefits', hcm_id : 2}, {hcm_name : 'iCIMS', hcm_id : 3}];
            //vm.mintmeshPartnes = [{hcm_name : 'SuccessFactors', hcm_id : 1}];
           if($state.params.tab == 'zenefits'){
                getPartnersData(1);
           }else{
                getPartnersData(0);
           }    
        }

        function getPartnersData(i) {
            vm.show_error = false;
            vm.activeIndex = i;
            getPartners(vm.mintmeshPartnes[i].hcm_id);
        }

        function getPartners(id) {
            var url;
            vm.loader = true;
            vm.zenefitsInProgress = true;
            if (id == 2) {
                url = 'get_zenefits_hcm_list';
            }else if(id == 1){
                url = 'get_hcm_list';
            }else if(id == 3){
                 url = 'get_icims_hcm_list';
            }
            $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: App.base_url + url,
                data: $.param({hcm_id : id})
            })
                    .then(function (response) {
                        var status = response.data.status_code;
                        vm.showSynWithZenefits = false;
                        vm.loader = false;
                        if (status == 200) {
                            vm.partnerDetails = response.data.data[0];
                            vm.checkbox = vm.partnerDetails.hcm_status == 'enable' ? true : false;
                            vm.startRunJob = vm.checkbox;
                            if(url == 'get_zenefits_hcm_list' && vm.partnerDetails){
                                vm.showSynWithZenefits = !vm.partnerDetails.hasOwnProperty('hcm_access_token');
                            }
                            if(url == 'get_zenefits_hcm_list'){
                               vm.zenefitsInProgress = false; 
                            }
                        }
                        else if (status == 403) {
                            vm.partnerDetails.hcm_id = vm.mintmeshPartnes[vm.activeIndex].hcm_id;
                            vm.checkbox = false;
                            vm.startRunJob = false;
                            if(url == 'get_zenefits_hcm_list'){
                                vm.showSynWithZenefits = true;
                                vm.zenefitsInProgress = false; 
                            }
                        }
                    }, function (response) {
                        console.log(response)
                    })
        }

        function update(isValid) {
            if (!isValid) {
                vm.show_error = true;
                return;
            }
            vm.loading = true;
            var data = $('form[name="suc_fac_form"]').serialize();
            var flag = vm.checkbox == false ? 'disable' : 'enable';
            if (flag != vm.partnerDetails.hcm_status) {
                data = data + '&hcm_run_status=' + flag;
            }
            addEditPartner(data, function (data) {
                vm.loading = false;
                angular.extend(vm.partnerDetails, data)
                vm.checkbox = data.hcm_status == 'enable' ? true : false;
                vm.startRunJob = vm.checkbox;
            });
        }

        function addEditPartner(data, callback) {
            
            var url;
            if (vm.activeIndex == 1) {
                url = 'add_edit_zenefits_hcm';
            }else{
                url = 'add_edit_hcm';
            }

            $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                data: data,
                url: App.base_url + url
            })
                    .then(function (response) {
                        if (callback != undefined) {
                            vm.sucMsg = response.data.message.msg[0];
                            $('.suc').fadeIn();
                            callback(response.data.data);
                            $timeout(function () {
                                $('.suc').fadeOut();
                                $scope.suc_fac_form.$setPristine();
                            }, 1000);
                            return;
                        }
                        vm.sucMsg = response.data.message.msg[0];
                    }, function (response) {
                        console.log(response)
                    })
        }

        function init() {
            dropDown();
        }

        init();

    }



}());