(function () {
    "use strict";

    angular
            .module('app.contact', ['ui.grid', 'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav', 'ui.grid.selection', 'ui.grid.validate'])
            .controller('ContactsController', ContactsController)
            .controller('contactsInviteController', contactsInviteController)
            .controller('UploadContactsController', UploadContactsController)
            .controller('UploadSingleContactController', UploadSingleContactController)
            .directive('checkBucket', checkBucket)
            .service('buckets', buckets)

    ContactsController.$inject = ['$window', '$http', '$q', 'buckets', 'uiGridValidateService', '$uibModal', 'App', 'userPermissions', '$stateParams'];
    contactsInviteController.$inject = ['$scope', '$uibModalInstance', 'listContacts', '$http', '$window', 'userPermissions', 'App'];
    UploadContactsController.$inject = ['$scope', '$window', 'defaultFunction', 'getBuckets', '$uibModalInstance', '$state', '$http', '$uibModal', 'buckets', '$timeout', 'App'];
    UploadSingleContactController.$inject = ['$scope', '$window', 'defaultFunction', 'getBuckets', '$http', '$uibModalInstance', 'buckets', 'App'];

    // already existing bucket name
    function checkBucket() {
        return {
            require: 'ngModel',
            link: function (scope, elem, attr, ctrl) {
                elem.add(attr.id).on('blur', function () {
                    scope.$apply(function () {
                        var bkNames = scope.$eval(attr.arrayBucket);
                        var bol = false;
                        for (var i in bkNames) {
                            if (bkNames[i].bucket_name.toUpperCase() == attr.bucketName.toUpperCase()) {
                                ctrl.$setValidity('bucketmatch', false);
                                bol = true;
                            }
                        }
                        if (!bol) {
                            ctrl.$setValidity('bucketmatch', true);
                        }
                    });
                });
            }
        }
    }

    // bucket names service
    function buckets() {
        var bucket_names = {}

        this.setData = function (obj) {
            bucket_names = obj;
        }

        this.getData = function () {
            return bucket_names;
        }

        this.addProperty = function (obj) {
            bucket_names.push(obj)
        }
    }

    function ContactsController($window, $http, $q, buckets, uiGridValidateService, $uibModal, App, userPermissions, $stateParams) {

        var scope = this;
        this.loaderImg = false;
        this.loaderNoContacts = false;
        this.totalRecordsCount = 0;
        this.contactStatus = [{label: 'Active', color: '#0d8e68'}, {label: 'Inactive', color: '#888888'}, {label: 'Separated', color: '#c46968'}]

        //get bucketNames
        function bucketsCount() {
            var get_buckets = $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: App.base_url + 'buckets_list'
            })
            get_buckets.success(function (response) {
                if (response.status_code == 200) {
                    scope.bucketNames = response.data.buckets_list;
                    scope.totalRecords = response.data.total_count;
                    if (scope.activeBucket == 'ALL CONTACTS') {
                        scope.activeBucketCount = scope.totalRecords;
                    }
                    else {
                        for (var i in scope.bucketNames) {
                            if (scope.bucketNames[i].bucket_name == scope.activeBucket) {
                                scope.activeBucketCount = scope.bucketNames[i].count;
                            }
                        }
                    }
                    buckets.setData(scope.bucketNames);
                }
                // Session Destroy
                else if (response.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }
            })
            get_buckets.error(function (response) {
                console.log(response);
            })
        }
        bucketsCount();

        this.getActiveBucketCount = function (index) {
            scope.activeBucketCount = (index == -1) ? scope.totalRecords : scope.bucketNames[index].count;
        }


        var edit_feature;
        this.goDashboard = $stateParams.rowEdit;
        if (userPermissions.edit_contacts == 1 && $stateParams.rowEdit) {
            edit_feature = true;
        }
        else {
            edit_feature = false;
        }

        this.selectedContacts = [];
        this.gridOptions = {
            rowHeight: 70,
            cellEditableCondition: edit_feature,
            enableCellEditOnFocus: true,
            selectionRowHeaderWidth: 56,
            enableHorizontalScrollbar: 0,
            rowEditWaitInterval: -1,
            columnDefs: [
                {name: 'firstname', displayName: 'First Name', validators: {charValidation: ''}, cellTemplate: 'ui-grid/cellTitleValidator'},
                {name: 'lastname', displayName: 'Last Name', validators: {charValidationReq: ''}, cellTemplate: 'ui-grid/cellTitleValidator'},
                {name: 'emailid', displayName: 'Email', enableCellEdit: false, cellClass: 'grid-email', width: '20%',
                    cellTooltip: function (row, col) {
                        return row.entity.emailid
                    }
                },
                {name: 'phone', displayName: 'Mobile', validators: {numValidation: ''}, cellTemplate: 'ui-grid/cellTitleValidator'},
                {name: 'employeeid', displayName: 'ID', cellClass: 'grid-other-id', validators: {charOtherId: ''}, cellTemplate: 'ui-grid/cellTitleValidator'},
                {name: 'status',
                    displayName: 'Status',
                    editableCellTemplate: userPermissions.edit_contacts == 1 ? 'select-drop.html' : '',
                    sort: {direction: 'asc'},
                    enableSorting: true,
                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                        var text = grid.getCellValue(row, col).toLowerCase();
                        if (userPermissions.edit_contacts == 1) {
                            return (text == 'separated') ? 'separated-s' : ((text == 'active') ? 'active-s' : 'inactive-s');
                        }
                        else {
                            return '';
                        }
                    },
                    validators: {required: true, statusValidation: ''},
                    cellTemplate: 'ui-grid/cellTitleValidator'
                }
            ]
        };


        function gridValidtion(validatorName, regExp) {
            uiGridValidateService.setValidator(validatorName,
                    function (argument) {
                        return function (oldValue, newValue, rowEntity, colDef) {
                            var bol;
                            if (regExp == "") {
                                bol = validatorName == "statusValidation" ? (newValue != oldValue) : (newValue.length >= 1 && newValue.length <= 50);
                            }
                            else {
                                bol = regExp.test(newValue);
                            }
                            if (bol) {
                                rowUpdate(oldValue, newValue, rowEntity, colDef, validatorName);
                                return true;
                            }
                            else {
                                setTimeout(function () {
                                    rowEntity[colDef.name] = oldValue;
                                    uiGridValidateService.setValid(rowEntity, colDef);
                                }, 500)
                                return false;
                            }
                        };
                    },
                    function (argument) {
                        return 'You can only insert names starting with: "' + argument + '"';
                    }
            );
        }
        ;
        gridValidtion('charValidation', '');
        gridValidtion('charValidationReq', /^[a-zA-Z0-9- ]{0,100}$/);
        gridValidtion('charOtherId', /^[a-zA-Z0-9-]{0,100}$/);
        gridValidtion('numValidation', /^[-0-9]{0,15}$/);
        gridValidtion('statusValidation', '');


        var sort,
                colSortObj = '',
                colDefName = 'status';
        this.gridOptions.onRegisterApi = function (gridApi) {

            scope.gridApi = gridApi;

            gridApi.rowEdit.on.saveRow(null, scope.saveRow);

            gridApi.selection.on.rowSelectionChanged(null, function (row) {
                updateRowSelection(row);
            });
            gridApi.selection.on.rowSelectionChangedBatch(null, function (rows) {
                for (var i = 0; i < rows.length; i++) {
                    updateRowSelection(rows[i]);
                }
            });
            gridApi.core.on.sortChanged(null, function (grid, sortColumns) {
                sort = sortColumns[0].sort.direction == 'asc' ? '' : 'desc';
                colDefName = sortColumns[0].name;
                colSortObj = sortColumns;
                scope.getGridData('', '', '', scope.searchVal);
            });

            function updateRowSelection(row) {
                if (row.isSelected) {
                    if (scope.selectedContacts.indexOf(row.entity.record_id) == -1) {
                        scope.selectedContacts.push(row.entity.record_id);
                    }
                } else {
                    var index = scope.selectedContacts.indexOf(row.entity.record_id);
                    if (index > -1) {
                        scope.selectedContacts.splice(index, 1);
                    }
                }
            }
        };

        this.gridOptions.isRowSelectable = function (row) {
            return row.entity.status != 'Separated';
        }


        // search filter
        var time;
        this.srcSearch = 'search.svg';
        this.searchLoader = false;
        var inputPrev = '';
        this.searchRecords = function (arg, event) {

            arg = arg || '';
            if (event.keyCode === 32 && arg.length === 0 || inputPrev == arg) {
                return false;
            }
            inputPrev = arg;

            if (arg == "") {
                scope.srcSearch = 'search.svg';
                scope.searchVal = '';
            }
            else {
                scope.srcSearch = 'cross.svg';
            }
            scope.searchLoader = true;

            if (time != null) {
                clearInterval(time);
            }
            time = setTimeout(function () {
                scope.getGridData('', '', '', arg);
            }, 500);
        }

        var canceller,
                bucketId = 0;
        this.activeBucket = 'ALL CONTACTS';
        this.currentPage = 1;
        this.getGridData = function (bktName, bktID, pageNo, searchVal, flag) {
            if (flag == 1) {
                $('.modalSuccess').show();
                $('.modalSuccess').fadeOut(3000);
                scope.modalSuccessMsg = 'Contact Added Successfully';
            }
            else if (flag == 0) {
                $('.modalSuccess').show();
                $('.modalSuccess').fadeOut(3000);
                scope.modalSuccessMsg = 'Successfully Updated';
            }

            if (bktName != "") {
                colSortObj != "" ? colSortObj[0].sort.direction = '' : '';
                scope.gridApi.grid.columns[6].sort.direction = 'asc';
                sort = "";
                colDefName = 'status';
            }

            scope.loaderImg = true;
            scope.loaderNoContacts = false;

            bucketId = bktID || bucketId;
            scope.activeBucket = bktName || scope.activeBucket;
            scope.currentPage = pageNo || 1;

            if (searchVal == '') {
                scope.srcSearch = 'search.svg';
                scope.searchVal = scope.searchVal > 0 ? scope.searchVal : '';
            }

            if (canceller) {
                canceller.resolve();
            }

            canceller = $q.defer();

            var list = $.param({
                bucket_id: bucketId,
                page_no: scope.currentPage,
                search: scope.searchVal,
                sort: sort,
                col_name: colDefName
            });

            var get_buckets = $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                data: list,
                url: App.base_url + 'contact_list',
                timeout: canceller.promise
            })
            get_buckets.success(function (response) {
                if (response.status_code == 200) {

                    scope.gridOptions.data = response.data.Contacts_list;

                    scope.gridOptions.data.length == 0 ? (scope.loaderNoContacts = true) : '';

                    if (scope.goDashboard == 0) {
                        if (scope.gridApi.selection != undefined) {
                            scope.gridApi.selection.clearSelectedRows();
                        }
                    }
                    else {
                        scope.gridApi.selection.clearSelectedRows();
                    }

                    scope.totalRecordsCount = response.data.total_records[0].total_count;
                    scope.activeBucketCount = scope.totalRecordsCount;

                    scope.searchLoader = false;
                    scope.loaderImg = false;

                }
                // Session Destroy
                else if (response.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }
            });

            get_buckets.error(function (response) {
                //console.log(response);
            })
        }

        //inital gridData
        this.getGridData("", "", "", "");

        this.updateLoader = false;
        function rowUpdate(oldValue, newValue, rowEntity, colDef, validatorName) {
            if (newValue != oldValue) {
                scope.loaderImg = true;
                scope.hideLoader = true;
                scope.updateLoader = true;

                var list = $.param({
                    record_id: rowEntity.record_id,
                    other_id: rowEntity.employeeid,
                    firstname: rowEntity.firstname,
                    lastname: rowEntity.lastname,
                    contact_number: rowEntity.phone,
                    emailid: rowEntity.emailid,
                    status: rowEntity.status
                            //[colDef.name] : newValue
                });

                var get_buckets = $http({
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    method: 'POST',
                    data: list,
                    url: App.base_url + 'update_contacts_list'
                })

                get_buckets.success(function (response) {
                    if (response.status_code == 200) {

                        scope.updateLoader = false;
                        scope.hideLoader = false;
                        scope.loaderImg = false;

                        if (response.message.msg[0] == 'successfully updated') {
                            $('.updateSuccess').show();
                            $('.updateSuccess').fadeOut(3000);
                        }
                        else if (response.message.msg[0] == 'empid already exists') {
                            $('.existRecords').show();
                            scope.rowIdExistsMsg = 'Employee ID Already Exists'
                            $('.existRecords').fadeOut(3000);

                            if (!rowEntity['$$errors' + colDef.name]) {
                                rowEntity['$$errors' + colDef.name] = {};
                            }
                            rowEntity['$$errors' + colDef.name][validatorName] = true;
                            rowEntity['$$invalid' + colDef.name] = true;
                            rowEntity[colDef.name] = oldValue;
                            setTimeout(function () {
                                uiGridValidateService.setValid(rowEntity, colDef);
                            }, 500);
                        }
                        else if (response.message.msg[0] == 'failed to update') {
                            $('.updatefailure').show();
                            $('.updatefailure').fadeOut(3000);
                        }
                    }
                    // Session Destroy
                    else if (response.status_code == 400) {
                        //promise.reject();
                        $window.location = App.base_url + 'logout';
                    }
                });

                get_buckets.error(function (response) {
                    //console.log(response);
                })
            }
        }

        var cancellerStat;
        this.statusUpdate = function (state, status) {

            scope.loaderImg = true;
            scope.hideLoader = true;
            scope.updateLoader = true;

            if (cancellerStat) {
                cancellerStat.resolve();
            }
            cancellerStat = $q.defer();

            var list = $.param({
                action: state,
                record_id: scope.selectedContacts.toString(),
                status: status
            });

            var get_buckets = $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                data: list,
                url: App.base_url + 'other_edits_in_contact_list',
                timeout: canceller.cancellerStat
            })

            get_buckets.success(function (response) {
                if (response.status_code == 200) {
                    scope.searchVal = "";
                    scope.srcSearch = 'search.svg';
                    if (response.message.msg[0] == 'status changed successfully') {
                        for (var i = 0; i < scope.gridOptions.data.length; i++) {
                            for (var j = 0; j < scope.selectedContacts.length; j++) {
                                if (Number(scope.gridOptions.data[i].record_id) == Number(scope.selectedContacts[j])) {
                                    scope.gridOptions.data[i].status = status;
                                    break;
                                }
                            }
                        }
                        scope.gridApi.selection.clearSelectedRows();
                        scope.updateLoader = false;
                        scope.hideLoader = false;
                        scope.loaderImg = false;
                        $('.updateSuccess').show();
                        $('.updateSuccess').fadeOut(3000);
                        scope.gridOptions.data = angular.copy(scope.gridOptions.data);
                    }
                    else if (response.message.msg[0] == 'failed to update') {
                        $('.updatefailure').show();
                        $('.updatefailure').fadeOut('slow');
                    }
                }
                // Session Destroy
                else if (response.status_code == 400) {
                    //promise.reject();
                    $window.location = App.base_url + 'logout';
                }

                scope.statusName = "";
            });

            get_buckets.error(function (response) {
                //console.log(response);
            })
        }


        //invite
        this.invite = function () {
            if (scope.selectedContacts.length == 0) {
                $('.zeroRecords').show();
                $('.zeroRecords').fadeOut(3000);
                return;
            }

            // invite contacts modal
            $uibModal.open({
                animation: false,
                keyboard: false,
                backdrop: 'static',
                templateUrl: 'templates/dialogs/custom-msg.phtml',
                openedClass: "import_verify",
                controller: 'contactsInviteController',
                size: 'sm',
                controllerAs: "ctrl",
                resolve: {
                    listContacts: function () {
                        var obj = {};
                        obj.goDashboard = !scope.goDashboard;
                        obj.selectedCts = scope.selectedContacts;
                        obj.resetSelectedCts = function () {
                            scope.gridApi.selection.clearSelectedRows();
                        }
                        return obj;
                    }
                }
            });
        }


        this.skip = function () {
            if (userPermissions.dashboard == '1') {
                $window.location = App.base_url + 'dashboard';
            }
            else {
                $window.location = App.base_url + 'job';
            }
        }

        // buckets modal
        this.bucketsModal = function () {

            $uibModal.open({
                animation: false,
                backdrop: 'static',
                keyboard: false,
                templateUrl: 'templates/dialogs/new-file-upload.phtml',
                openedClass: "bucket-modal",
                controller: 'UploadContactsController',
                controllerAs: "UploadContCtrl",
                resolve: {
                    defaultFunction: function () {
                        return scope.getGridData;
                    },
                    getBuckets: function () {
                        return bucketsCount;
                    }
                }
            });
        }

        // new contact modal
        this.contactModal = function () {

            $uibModal.open({
                animation: false,
                backdrop: 'static',
                keyboard: false,
                templateUrl: 'templates/dialogs/new-contact-upload.phtml',
                openedClass: "contact-modal",
                controller: 'UploadSingleContactController',
                controllerAs: "SingleContCtrl",
                resolve: {
                    defaultFunction: function () {
                        return scope.getGridData;
                    },
                    getBuckets: function () {
                        return bucketsCount;
                    }
                }
            });
        }

    }

    function contactsInviteController($scope, $uibModalInstance, listContacts, $http, $window, userPermissions, App) {

        this.successMsg = false;

        this.subject = "MintMesh Enterprise Invitation";
        this.body = "We bring this powerful referral  platform to you. Please download the app and sign up. We are excited to have you be a part of our success here at MintMesh Enterprise.";

        var scope = this;
        this.invite = function () {
            scope.invite_cond = true;
            var list = listContacts.selectedCts.toString();
            var paramas = $.param({
                action: 'invite',
                invite_contacts: list,
                email_subject: scope.subject,
                email_body: scope.body
            });
            var invite_contacts = $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: App.base_url + 'other_edits_in_contact_list',
                data: paramas
            })
            invite_contacts.success(function (response) {
                if (response.status_code == 200) {
                    scope.invite_cond = false;
                    scope.successMsg = true;
                    listContacts.resetSelectedCts();
                }
                else if (response.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }
            })
            invite_contacts.error(function (response) {
                console.log(response)
                scope.invite_cond = false;
            })

        };

        this.jumpPage = function () {
            $uibModalInstance.dismiss('cancel');

            if (userPermissions.dashboard == '1' && listContacts.goDashboard) {
                $window.location = App.base_url + 'dashboard';
            }
            else if (userPermissions.dashboard == '0' && listContacts.goDashboard) {
                $window.location = App.base_url + 'job';
            }
        }

        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

            $uibModalInstance.dismiss('cancel');

        })



    }

    function UploadContactsController($scope, $window, defaultFunction, getBuckets, $uibModalInstance, $state, $http, $uibModal, buckets, $timeout, App) {

        var scope = this;
        this.currentState = $state.params.importContacts;

        if (scope.currentState) {
            scope.loader = true;
            var get_buckets = $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: App.base_url + 'buckets_list'
            })
            get_buckets.success(function (response) {
                if (response.status_code == 200) {
                    scope.bucketNames = response.data.buckets_list;
                    buckets.setData(scope.bucketNames);
                    scope.bucketsList = buckets.getData();
                    scope.loader = false;
                    calBuckets();
                }
                // Session Destroy
                else if (response.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }
            })
            get_buckets.error(function (response) {
                console.log(response);
            })
        }
        else {
            scope.bucketsList = buckets.getData();
            setTimeout(function () {
                dynamicUploader(scope.bucketsList.length)
            }, 100);
            scope.newBucketModal = false;
        }

        function calBuckets() {
            $scope.$watch(scope.loaded, function () {
                if (scope.loaded) {
                    setTimeout(function () {
                        dynamicUploader(scope.bucketsList.length);
                    }, 100);
                }
            })
        }

        // download sample template
        this.downloadSample = function () {
            window.location.href = App.base_url + 'downloadcsv';
        }

        // color picker
        var bucketColor = ["#229A77", "#21A4AC", "#EE8F3B", "#2A99E0", "#154c50", "#103954", "#342158", "#5B5B29", "#004D40", "#6f2b25"];

        this.colorPicker = function (ind) {
            return bucketColor[String(ind).slice(-1)];
        }


        // qq uploader
        scope.footer = false;
        function dynamicUploader(length) {
            for (var i = 0; i < length; i++) {
                uploader(i, false);
            }
        }

        var uploadData = [];
        function uploader(index, status) {
            var count = scope.bucketsList[index].count != undefined ? scope.bucketsList[index].count + ' contact(s)' : '';
            window["$contacts_upload_" + index] = $('.upload-bucket').eq(index);
            var uploader = new qq.FileUploader({
                element: document.getElementsByClassName('upload-bucket')[index],
                dragText: "",
                uploadButtonText: "<span class='align-title'><p>" + scope.bucketsList[index].bucket_name.toUpperCase() + "</p><span>" + (scope.currentState ? '' : count) + "</span></span>",
                multiple: false,
                sizeLimit: (25 * 1024 * 1024),
                allowedExtensions: ["XLSX", "CSV", "XLS"],
                action: App.base_url + 'contacts_file_upload',
                onSubmit: function (id, name) {
                    scope.errorUpload = false;
                    $scope.$apply();
                    eval("$contacts_upload_" + index).find('.drag_txt').hide();
                    eval("$contacts_upload_" + index).find('.qq-upload-list').show();
                    eval("$contacts_upload_" + index).find('.qq-upload-list').css('z-index', '0');
                },
                onComplete: function (id, name, response) {
                    if (response.success) {
                        scope.footer = true;
                        $scope.$apply();
                        uploadData.push({
                            ind: index,
                            org_name: response.org_name,
                            filename: response.filename
                        })
                        eval("$contacts_upload_" + index).find('.qq-upload-fail').remove();
                        eval("$contacts_upload_" + index).find('.qq-upload-success').hide();
                        eval("$contacts_upload_" + index).find('.qq-upload-drop-area').css({
                            'display': 'block',
                            'background': 'transparent'
                        });
                        eval("$contacts_upload_" + index).find('.drag_img').css({'background': 'transparent', 'display': 'none'});
                        eval("$contacts_upload_" + index).find('.qq-upload-list').css('z-index', '-1');
                        eval("$contacts_upload_" + index).find('.qq-upload-drop-area').append('<div class="file-name"><p class="name">' + response.org_name + '</p></div>');
                        eval("$contacts_upload_" + index).find('.qq-upload-drop-area .file-name').append('<div class="overlay"></div><i class="fa fa-trash-o icon-trash" onclick="angular.element(this).scope().UploadContCtrl.trash(' + index + ')"></i>');
                        eval("$contacts_upload_" + index).find('.qq-upload-list li.qq-upload-success').hide();
                        eval("$contacts_upload_" + index).find('.qq-upload-list').append("<li><input type='hidden' name='contacts[" + scope.bucketsList[index].bucket_id + "]' value='" + response.filename + "' /></li>").show();
                    }
                    else {
                        for (var i = 0; i < scope.bucketsList.length; i++) {
                            eval("$contacts_upload_" + i).find('.qq-upload-fail').remove();
                        }
                        eval("$contacts_upload_" + index).find('.qq-upload-list').css('z-index', '-1');
                        eval("$contacts_upload_" + index).append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>" + response.msg + "</span></div>");
                    }
                },
                showMessage: function (msg) {
                    for (var i = 0; i < scope.bucketsList.length; i++) {
                        eval("$contacts_upload_" + i).find('.qq-upload-fail').remove();
                    }
                    eval("$contacts_upload_" + index).append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>" + msg + "</span></div>");
                }

            })

            if (status) {
                successBucket(index, org_name, filename);
            }
        }


        // new mock functionality
        this.newBucket = function () {
            if (scope.currentState) {
                $uibModal.open({
                    animation: false,
                    backdrop: 'static',
                    keyboard: false,
                    templateUrl: 'templates/dialogs/new-bucket-import-contacts.phtml',
                    openedClass: "bucket-modal import-contacts",
                    scope: $scope
                });
            }
            else {
                scope.newBucketModal = true;
            }
            scope.new_bucket.bucketName = '';
            newBucketUpload();
        }

        /* New bucket qq-uploader */
        var $new_bucket, org_name, filename;
        scope.new_bucket = {};
        function newBucketUpload() {
            setTimeout(function () {
                $new_bucket = $('#new-bucket');
                var uploader = new qq.FileUploader({
                    element: document.getElementById('new-bucket'),
                    dragText: "",
                    uploadButtonText: "<span class='name'>Browse File</span>",
                    multiple: false,
                    sizeLimit: (25 * 1024 * 1024),
                    allowedExtensions: ["XLSX", "CSV", "XLS"],
                    action: App.base_url + 'contacts_file_upload',
                    onSubmit: function (id, name) {
                        $('.bucket-modal .modal-footer .disabled').css('pointer-events', 'none');
                        scope.errorUpload = false;
                        $scope.$apply();
                        $new_bucket.find('.drag_txt').hide();
                        $new_bucket.find('.qq-upload-button').hide();
                        $new_bucket.find('.qq-upload-list').css('z-index', '0');
                        $new_bucket.find('.qq-upload-list').show();
                    },
                    onComplete: function (id, name, response) {
                        if (response.success) {
                            scope.footer = true;
                            $scope.$apply();
                            $('.bucket-modal .modal-footer .disabled').css('pointer-events', 'auto');
                            org_name = response.org_name;
                            filename = response.filename;
                            $new_bucket.find('.qq-upload-fail').remove();
                            $new_bucket.find('.qq-upload-success').hide();
                            $new_bucket.find('.drag_img').css({'background': 'transparent', 'display': 'none'});
                            $new_bucket.find('.qq-upload-list').css('z-index', '-1');
                            $new_bucket.find('.qq-upload-drop-area').css('display', 'block');
                            $new_bucket.find('.qq-upload-drop-area').append('<div class="file-name"><img src="public/images/Applied.svg" alt="file"><p class="name">' + response.org_name + '</p><img src="public/images/close-popup-grey.svg" alt="cancel" onclick="angular.element(this).scope().UploadContCtrl.delete()"></div>');
                        }
                        else {
                            $scope.$apply();
                            $new_bucket.find('.qq-upload-button').show();
                            $new_bucket.find('.qq-upload-list').css('z-index', '-1');
                            $new_bucket.find('.qq-upload-fail').remove();
                            $new_bucket.append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>" + response.msg + "</span></div>");
                        }
                    },
                    showMessage: function (msg) {
                        $scope.$apply();
                        $new_bucket.find('.qq-upload-fail').remove();
                        $new_bucket.append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>" + msg + "</span></div>");
                    }
                })
            }, 100)
        }

        // create new bucket and upload file
        scope.new_bucket.succesLoader = false;
        this.new_bucket.upload = function (isValid) {

            if (!isValid) {
                scope.new_bucket.errorFromData = true;
            }
            else {
                $('.bucket-modal .modal-footer .disabled').css('pointer-events', 'none');
                scope.new_bucket.errorFromData = false;
                scope.new_bucket.succesLoader = true;

                var params = $.param({
                    bucket_name: scope.new_bucket.bucketName
                })

                var createBucket = $http({
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    method: 'POST',
                    url: App.base_url + 'create_bucket',
                    data: params
                })
                createBucket.success(function (response) {
                    $('.bucket-modal .modal-footer .disabled').css('pointer-events', 'auto');
                    scope.new_bucket.succesLoader = false;
                    if (response.status_code == 200) {
                        if ($new_bucket.find('li.qq-upload-success').length == 0)
                            response.data.count = 0;

                        buckets.addProperty(response.data);

                        if (!scope.currentState) {
                            scope.newBucketModal = false;
                        }
                        else {
                            $timeout(function () {
                                angular.element('#close-me').triggerHandler('click');
                            });
                        }

                        var cond = $new_bucket.find('.qq-upload-list li').hasClass('qq-upload-success');
                        setTimeout(function () {
                            uploader(scope.bucketsList.length - 1, cond);
                        }, 100);

                    }
                    else if (response.status_code == 400) {
                        $window.location = App.base_url + 'logout';
                    }
                })
                createBucket.error(function (response) {
                    $('.bucket-modal .modal-footer .disabled').css('pointer-events', 'auto');
                })
            }
        }


        // back function
        this.back = function () {
            scope.newBucketModal = false;
            scope.errorUpload = false;
            scope.new_bucket.errorFromData = false;
        }

        // trash function
        this.trash = function (index) {
            eval("$contacts_upload_" + index).find('.qq-upload-drop-area').css('display', 'none');
            eval("$contacts_upload_" + index).find('.qq-upload-drop-area .file-name').remove();
            eval("$contacts_upload_" + index).find('.qq-upload-list li').remove();
            eval("$contacts_upload_" + index).find('.qq-upload-list').css('z-index', '-1');
        }

        // delete new bucket file
        this.delete = function () {
            $new_bucket.find('.file-name').remove();
            $new_bucket.find('.qq-upload-list li').remove();
            $new_bucket.find('.qq-upload-list').css('z-index', '-1');
            $new_bucket.find('.qq-upload-drop-area').css('display', 'none');
            $new_bucket.find('.qq-upload-button').show();
        }

        // new bucket after success
        function successBucket(index, name, file) {
            window["$contacts_upload_" + index] = $('.upload-bucket').eq(index);
            eval("$contacts_upload_" + index).find('.qq-upload-fail').remove();
            eval("$contacts_upload_" + index).find('.qq-upload-success').hide();
            eval("$contacts_upload_" + index).find('.qq-upload-drop-area').css({
                'display': 'block',
                'background': 'transparent'
            });
            eval("$contacts_upload_" + index).find('.qq-upload-list').css('z-index', '-1');
            eval("$contacts_upload_" + index).find('.qq-upload-drop-area').append('<div class="file-name"><p class="name">' + name + '</p></div>');
            eval("$contacts_upload_" + index).find('.qq-upload-drop-area .file-name').append('<div class="overlay"></div><i class="fa fa-trash-o icon-trash" onclick="angular.element(this).scope().UploadContCtrl.trash(' + index + ')"></i>');
            eval("$contacts_upload_" + index).find('.qq-upload-list li.qq-upload-success').hide();
            eval("$contacts_upload_" + index).find('.qq-upload-list').append("<li><input type='hidden' name='contacts[" + scope.bucketsList[index].bucket_id + "]' value='" + file + "' /></li>").show();
        }

        // upload to db
        scope.uploadLoader = false;
        scope.errorUpload = false;
        this.uploadContacts = function () {
            scope.uploadLoader = true;
            scope.errorUpload = false;
            $('.bucket-modal .modal-footer .disabled').css('pointer-events', 'none');
            var param = $(' form[name="buckets_form"]').serialize();

            var upload_contacts = $http({
                headers: {
                    "content-type": 'application/x-www-form-urlencoded'
                },
                method: 'POST',
                url: App.base_url + 'upload_contacts',
                data: param
            });

            upload_contacts.success(function (response) {
                $('.bucket-modal .modal-footer .disabled').css('pointer-events', 'auto');
                scope.uploadLoader = false;
                scope.errorUpload = false;
                if (response.status_code == 200) {
                    if (scope.currentState) {
                        $window.scrollTo(0, 0);
                        $state.go('importContactsList');
                    }
                    else {
                        defaultFunction('', '', '', '', 0);
                        getBuckets();
                        $uibModalInstance.dismiss('cancel');
                    }
                }
                else if (response.status_code == 403) {
                    scope.errorUpload = true;
                }
                else if (response.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }
            })
            upload_contacts.error(function (response) {
                //console.log(response)
                scope.uploadLoader = false;
                scope.errorUpload = false;
                $('.bucket-modal .modal-footer .disabled').css('pointer-events', 'auto');
            })
        }


        // on state change modal close
        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if (!scope.currentState) {
                $uibModalInstance.dismiss('cancel');
            }
        })
    }

    function UploadSingleContactController($scope, $window, defaultFunction, getBuckets, $http, $uibModalInstance, buckets, App) {

        var scope = this;

        scope.bucketList = buckets.getData();

        scope.statusText = ["Active", "Inactive", "Separated"];

        // closing angular material select box when blur
        scope.closeDropdown = function () {
            $('body').find('.md-select-menu-container').removeClass('md-leave');
            if ($('body').find('.md-select-menu-container').hasClass('md-active')) {
                $('body').find('.md-select-menu-container').removeClass('md-active md-clickable');
                $('body').find('.md-select-menu-container').addClass('md-leave');
            }

        }

        scope.errCond = false;
        scope.uploadLoader = false;
        scope.backendError = false;
        scope.add = function (isValid) {
            scope.backendError = false;
            if (!isValid) {
                scope.errCond = true;
            }
            else {
                scope.uploadLoader = true;
                $('.contact-modal .modal-footer .disabled').css('pointer-events', 'none');

                var data = $('form[name="upload_contact_form"]').serialize();

                // add single contact
                var add_contact = $http({
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    method: 'POST',
                    data: data,
                    url: App.base_url + 'add_contact'
                })
                add_contact.success(function (response) {
                    scope.uploadLoader = false;
                    $('.contact-modal .modal-footer .disabled').css('pointer-events', 'auto');
                    if (response.status_code == 200) {
                        var obj = buckets.getData();
                        for (var i = 0; i < obj.length; i++) {
                            if (obj[i].bucket_id == scope.newContact.bucket) {
                                defaultFunction(obj[i].bucket_name, scope.newContact.bucket, '', '', 1);
                                break;
                            }
                        }
                        getBuckets();
                        $uibModalInstance.dismiss('cancel');
                    }
                    else if (response.status_code == 403) {
                        scope.backendError = true;
                        scope.backendMsg = response.message.msg[0];
                    }
                    else if (response.status_code == 400) {
                        $window.location = App.base_url + 'logout';
                    }
                })
                add_contact.error(function (response) {
                    console.log(response);
                    scope.uploadLoader = false;
                    $('.contact-modal .modal-footer .disabled').css('pointer-events', 'auto');
                })

            }
        }


        // on state change modal close
        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $uibModalInstance.dismiss('cancel');
        })

    }




}());