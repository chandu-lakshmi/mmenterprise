(function() {
"use strict";

angular.module('app.import.contacts', ['ui.grid'])

// Required input[type=file]
.directive('validFile', function() {
    return {
        require: 'ngModel',
        link: function(scope, el, attrs, ngModel) {
            //change event is fired when file is selected
            el.bind('change', function() {
                scope.$apply(function() {
                    ngModel.$setViewValue(el.val());
                    ngModel.$render();
                })
            })
        }
    }
})

// Restriction for already existing bucket names
.directive('bucketNameChk', [function() {
    return {
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {
            elem.add(attr.id).on('blur', function() {
                scope.$apply(function() {
                    var bkNames = scope.$eval(attr.myBucket);
                    var bol = false;
                    for(var i in bkNames){
                        if(bkNames[i].bucket_name==attr.myName){
                            ctrl.$setValidity('bucketmatch', false);
                            bol=true;
                        }
                    }
                    if(!bol){
                         ctrl.$setValidity('bucketmatch', true);
                    }
                });
            });
        }
    }
}])

.controller('ImportContactsController', ['$state', '$window', '$uibModal', '$http', '$rootScope', 'CONFIG', function($state, $window, $uibModal, $http, $rootScope, CONFIG) {

    var scope = this;
    this.loader = true;

    // get bucket names
    var get_buckets = $http({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        method: 'POST',
        url: CONFIG.APP_DOMAIN+'buckets_list'
    })
    get_buckets.success(function(response){
        if(response.status_code == 200){
            scope.bucketsName = response.data.buckets_list;
            scope.loader = false;
        }
        // Session Destroy
        else if(response.status_code == 400){
            $window.location = CONFIG.APP_DOMAIN+'logout';
        }
    });
    get_buckets.error(function(response){
        console.log(response);
    })


    var bucketColor = ["#229A77", "#21A4AC", "#EE8F3B", "#2A99E0", "#154c50", "#103954", "#342158", "#5B5B29", "#004D40", "#6f2b25"];

    this.fileNames = [];

    this.getColor = function(ind) {
        return bucketColor[String(ind).slice(-1)];
    }

    this.gridView = function() {
        $window.scrollTo(0, 0);
        $state.go('importContactsList');
    }

    // Download sample template
    this.downloadSample = function(){
        window.location.href = CONFIG.APP_DOMAIN+'downloadcsv';
    }

    scope.path = CONFIG.APP_DOMAIN+'public/downloads/sample_template.xlsx';

    $rootScope.successUpload = function(bucName,bol,fileName){
        scope.index = scope.bucketsName.indexOf(bucName)
        scope.buckMatch = bucName;
        scope.fileName = fileName;
    }


    this.fileUploadModal = function(bucketName, color, index) {

        if (bucketName == "+Add Your Own") {
            bucketName = "Add Your Own";
        }

        $uibModal.open({
            animation: false,
            backdrop: 'static',
            keyboard: false,
            templateUrl: 'templates/dialogs/fileUpload.phtml',
            openedClass: "bucket",
            resolve: {
                bucket: function() {
                    var bucket = {};
                    bucket.color = color;
                    bucket.name = bucketName;
                    bucket.id = index;
                    bucket.fileNames = scope.fileNames;
                    bucket.All =  scope.bucketsName;
                    return bucket;
                }
            },
            controller: 'fileUpload',
            controllerAs: "fileUp"
        });
    }

}])

.controller("fileUpload", ["$uibModalInstance", "$window", "$scope", "bucket", "$rootScope", "$http", "CONFIG", function($uibModalInstance, $window, $scope, bucket, $rootScope, $http, CONFIG) {

    var scope = this;

    this.bucket = bucket;

    var color = this.bucket.color;
    var bucketName = this.bucket.name;

    this.newBucket = false;
    this.emptyVal = false;
    this.new_bucket_flag = 0;

    this.bucketNames = this.bucket.All;

    var bucket_id = 0;
    var bol = false;
    for(var i = 0; i < this.bucketNames.length; i++){
        if (scope.bucketNames[i].bucket_name == bucketName){
            bucket_id = scope.bucketNames[i].bucket_id;
            bol = true;
        }
    }

    if(!bol){
        bucket_id = scope.bucketNames.length + 1;
    }

    if (bucketName == "Add Your Own") {
        scope.newBucket = true;
        scope.new_bucket_flag = 1;
    }

    this.obj = {
        "border": "1px solid " + color,
        "color": color
    }


    this.upload_load_cond = false;
    this.success_upload = false;

    this.onfileSubmit = function(valid) {

        if (!valid) {
            scope.upload_load_cond = false;
            scope.error_msg_show = true;
        } else {
            scope.disabled = true;
            this.upload_load_cond = true;

            // Sending data to post call
            var bucket_data = new FormData();
            var files = $('input[type=file]#fileUploads')[0].files[0];
            bucket_data.append("contacts_file", files);
            bucket_data.append("is_bucket_new", scope.new_bucket_flag);

            if (scope.newBucket) {
                bucket_data.append("bucket_name", scope.customName);
                scope.name = scope.customName;
                scope.bucket.name = scope.customName;
            } else {
                bucket_data.append("bucket_name", bucketName);
                scope.name = bucketName;
            }

            bucket_data.append("bucket_id", bucket_id);

            // Contacts Upload Ajax Call
            var upload_contacts = $http({
                headers: {
                    'Content-Type': undefined
                },
                method: 'POST',
                url: CONFIG.APP_DOMAIN+'contacts_upload',
                data: bucket_data
            });

            upload_contacts.success(function(response) {
                if (response.status_code == 200) {
                    bucket.fileNames[bucket_id-1] = files.name;
                    scope.upload_load_cond = false;

                    if (scope.newBucket) {
                        var obj = {"bucket_id":bucket_id,"bucket_name":scope.customName};
                        scope.bucketNames.push(obj);
                    }

                    scope.success_upload = true;
                    scope.success = true;
                    scope.success = response.message[0];
                    $rootScope.successUpload(scope.name,scope.success_upload,$('input[type=file]#fileUploads')[0].files[0].name);

                } else if (response.status_code == 403) {
                    scope.disabled = false;
                    scope.upload_load_cond = false;
                    scope.success = false;
                    if (response.message.hasOwnProperty('contacts_file')) {
                        scope.inValidFile = response.message.contacts_file[0];
                    } else {
                        scope.inValidFile = response.message[0];
                    }
                } else if(response.status_code == 400){
                    $window.location = CONFIG.APP_DOMAIN + 'logout';
                }
            });

            upload_contacts.error(function(response) {
                console.log(response);
            })
        }
    }

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

        $uibModalInstance.dismiss('cancel');

    })
}])

// .controller('ImportContactsListController', ['$rootScope', '$q', '$window', '$state', '$scope', '$http', '$log', '$timeout', 'uiGridConstants', '$uibModal', 'CONFIG', function($rootScope, $q, $window, $state, $scope, $http, $log, $timeout, uiGridConstants, $uibModal, CONFIG) {

//     var scope = this;
//     scope.loadingTabs = true;

//     //scope.loadingInitGrid = true;
//     this.currentTab = 'all';
//     this.getActive = function(param){   
//         scope.currentTab = param;
//     }

//     // For getting bucket names
//     var get_buckets = $http({
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
//         },
//         method: 'POST',
//         url: CONFIG.APP_DOMAIN + 'buckets_list'
//     })
//     get_buckets.success(function(response) {
//         scope.bucket_names = response.data;
//         scope.loadingTabs = false;
//     });
//     get_buckets.error(function(response) {
//         console.log(response);
//     })

//     var selectedContacts = [];

//     var API_CALL = CONFIG.APP_DOMAIN+'contact_list';
//     var bucketId,canceller;


//     this.gridOptions = {
//         enableRowSelection: true,
//         enableSelectAll: true,
//         selectionRowHeaderWidth: 35,
//         rowHeight: 35,
//         showGridFooter:true
//     };
 
//     this.gridOptions.columnDefs = [
//         { name: 'id' },
//         { name: 'name'},
//         { name: 'age', displayName: 'Age (not focusable)', allowCellFocus : false },
//         { name: 'address' }
//     ];

//     this.gridOptions.data = [
//         { id : '2', name : 'jaya', age : 24, address : 'hyd'}
//     ];
//     // this.importContactGrid = function(url, id, type) {
//     //     bucketId = id;
//     //     scope.gridNoData = false;
//     //     scope.loading = true;

//     //     $scope.gridOptions = {
//     //         infiniteScrollRowsFromEnd: 50,
//     //         enableFullRowSelection: true,
//     //         infiniteScrollUp: true,
//     //         infiniteScrollDown: true,
//     //         enableHorizontalScrollbar: 1,
//     //         rowHeight: 40,

//     //         columnDefs: [{
//     //             name: 'employeeid',
//     //             displayName: 'Employee ID/Other ID'
//     //         }, {
//     //             name: 'firstname',
//     //             displayName: 'First Name'
//     //         }, {
//     //             name: 'lastname',
//     //             displayName: 'Last Name'
//     //         }, {
//     //             name: 'emailid',
//     //             displayName: 'Email ID '
//     //         }, {
//     //             name: 'phone',
//     //             displayName: 'Cell Phone'
//     //         }, {
//     //             name: 'status',
//     //             displayName: 'Status'
//     //         }, ],

//     //         data: 'data',

//     //         onRegisterApi: function(gridApi) {
//     //             gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.getDataDown);
//     //             //gridApi.infiniteScroll.on.needLoadMoreDataTop($scope, $scope.getDataUp);
//     //             $scope.gridApi = gridApi;

//     //             gridApi.selection.on.rowSelectionChanged($scope, function(row) {
//     //                 updateRowSelection(row);
//     //             });

//     //             gridApi.selection.on.rowSelectionChangedBatch($scope, function(rows) {
//     //                 for (var i = 0; i < rows.length; i++) {
//     //                     updateRowSelection(rows[i]);
//     //                 }
//     //             });
//     //         }
//     //     };

//     //     function updateRowSelection(row) {

//     //         if (row.isSelected) {
//     //             if (selectedContacts.indexOf(row.entity.record_id) == -1) {
//     //                 selectedContacts.push(row.entity.record_id);
//     //             }
//     //         } else {
//     //             var index = selectedContacts.indexOf(row.entity.record_id);
//     //             if (index > -1) {
//     //                 selectedContacts.splice(index, 1);
//     //             }
//     //         }
//     //     }

//     //     if(canceller){
//     //         canceller.resolve();
//     //     }

//     //     canceller = $q.defer();

//     //     $scope.data = [];

//     //     $scope.firstPage = 0;
//     //     $scope.lastPage = 0;

//     //     $scope.page_no = 1;

//     //     $scope.getFirstData = function() {
//     //         var list = $.param({
//     //             bucket_id: bucketId,
//     //             page_no: $scope.page_no
//     //         });
//     //         return $http({
//     //             headers: {
//     //                 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
//     //             },
//     //             method: 'POST',
//     //             url: url,
//     //             data: list,
//     //             timeout : canceller.promise
//     //         })

//     //         .then(function(response) {

//     //             // Session Destroy
//     //             if(response.status_code == 400){
//     //                 $window.location = CONFIG.APP_DOMAIN+'logout';
//     //             }

//     //             scope.totalRows = response.data.data.total_records[0].total_count;

//     //             scope.total_pages = Math.ceil(scope.totalRows / 50);
//     //             var newData = $scope.getPage(response.data.data.Contacts_list);
//     //             if(newData.length==0){
//     //                 scope.loading = false;
//     //                 scope.gridNoData = true;
//     //                 return false;
//     //             }
                
//     //             var selectedCount = 0;
//     //             $scope.gridApi.grid.selection.selectAll = false;
//     //             scope.loading = false;
                
//     //             setTimeout(function() {
//     //                 for (var i = 0; i < selectedContacts.length; i++) {
//     //                     for (var j = 0; j < newData.length; j++) {
//     //                         if (selectedContacts[i] == newData[j].other_id) {
//     //                             $scope.gridApi.selection.selectRow(newData[j])
//     //                             selectedCount++;
//     //                             break;
//     //                         }
//     //                     }
//     //                 }
//     //                 if (newData.length == selectedCount && newData.length != 0) {
//     //                     $scope.gridApi.grid.selection.selectAll = true;
//     //                 }
//     //             })
//     //             $scope.data = $scope.data.concat(newData);
//     //         })

//     //     };

//     //     $scope.getDataDown = function() {

//     //         $scope.page_no++;

//     //         var list = $.param({
//     //             bucket_id: bucketId,
//     //             page_no: $scope.page_no
//     //         });
//     //         return $http({
//     //             headers: {
//     //                 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
//     //             },
//     //             method: 'POST',
//     //             url: url,
//     //             data: list,
//     //             timeout : canceller.promise
//     //         })

//     //         .then(function(response) {

//     //             // Session Destroy
//     //             if(response.status_code == 400){
//     //                 $window.location = CONFIG.APP_DOMAIN+'logout';
//     //             }

//     //             $scope.lastPage++;
//     //             var newData = $scope.getPage(response.data.data.Contacts_list);
//     //             $scope.gridApi.infiniteScroll.saveScrollPercentage();
//     //             $scope.data = $scope.data.concat(newData);

//     //             return $scope.gridApi.infiniteScroll.dataLoaded($scope.firstPage > 0, $scope.page_no < scope.total_pages).then(function() {
//     //                 //$scope.checkDataLength('up');
//     //             });

//     //         })
//     //         .catch(function(error) {
//     //             return $scope.gridApi.infiniteScroll.dataLoaded();
//     //         });

//     //     };

        

//     //     $scope.getPage = function(data) {
//     //         var res = [];
//     //         for (var i = (0 * 50); i < (0 + 1) * 50 && i < data.length; ++i) {
//     //             res.push(data[i]);
//     //         }
//     //         return res;
//     //     };


//     //     $scope.getFirstData().then(function() {
//     //         $timeout(function() {
//     //             // timeout needed to allow digest cycle to complete,and grid to finish ingesting the data
//     //             // you need to call resetData once you've loaded your data if you want to enable scroll up,
//     //             // it adjusts the scroll position down one pixel so that we can generate scroll up events
//     //             $scope.gridApi.infiniteScroll.resetScroll($scope.firstPage > 0, $scope.page_no < scope.total_pages);
//     //         });
//     //     });

//     // }
//     //     //default calling all contacts
//     // scope.importContactGrid(API_CALL, 0, "all");

//     this.getInfo = function(id, type) {
//         scope.loading = true;
//         scope.importContactGrid(API_CALL, id, type);
//     }

   
//     this.jumpPage = function(){
//         $window.location = CONFIG.APP_DOMAIN+'dashboard';
//     }

//     this.importSelect = function() {
//         if(selectedContacts.length == 0){
//             //model for zero records selected
//             $uibModal.open({
//                 animation: true,
//                 templateUrl: 'templates/dialogs/invite_zero.phtml',
//                 openedClass: "import-zero",
//                 size:'sm',
//                 controller: 'InviteZero'
//             });
//         }
//         else{
//             $uibModal.open({
//                 animation: true,
//                 keyboard: false,
//                 backdrop: 'static',
//                 templateUrl: 'templates/dialogs/custom-msg.phtml',
//                 openedClass: "import_verify",
//                 controller: 'modalCtrl',
//                 size:'sm',
//                 controllerAs: "ctrl",
//                 resolve: {
//                 listContacts: function() {
//                     return selectedContacts;
//                 }
//             }
//             });
//         }
//     }

//     this.backtoUploadCon = function() {
//         $scope.data = [];
//         $window.scrollTo(0, 0);
//         $state.go('importContacts');
//     }

    

// }])
// .controller('InviteZero',["$scope", "$uibModalInstance", function($scope, $uibModalInstance){
    
//     $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
//         $uibModalInstance.dismiss('cancel');

//     })
// }])

.controller('InviteContacts', ['$window', '$state', '$scope', '$http', '$log', '$timeout', 'uiGridConstants', '$uibModal', function($window, $state, $scope, $http, $log, $timeout, uiGridConstants, $uibModal) {

    $scope.gridOptions = {
        enableRowSelection: true,
        enableHorizontalScrollbar: 0,
        enableVerticalScrollbar: 0,
        enableSelectAll: true,
        selectionRowHeaderWidth: 35,
        rowSelection: true,
        rowHeight: 35
    };
    $scope.gridOptions.enableHorizontalScrollbar = uiGridConstants.scrollbars.NEVER;
    $scope.gridOptions.columnDefs = [{
        name: 'name',
        displayName: "NAME"
    }, {
        name: 'phoneno',
        displayName: "PHONE NUMBER"
    }, {
        name: 'email',
        displayName: 'EMAIL'
    }];

    $scope.gridOptions.multiSelect = true;
    loadTime();

    function loadTime() {
        $scope.loading = true;
        $http.get('public/js/controllers/app.json')
            .success(function(data) {
                $scope.gridOptions.data = data;
                $timeout(function() {
                    if ($scope.gridApi.selection.selectRow) {
                        $scope.gridApi.selection.selectRow($scope.gridOptions.data[0]);
                    }
                });
            }).finally(function() {
                $scope.loading = false
            });
    }


    $scope.gridOptions.onRegisterApi = function(gridApi) {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function(row) {
            var msg = 'row selected ' + row.isSelected;
            $log.log(msg);
        });

        gridApi.selection.on.rowSelectionChangedBatch($scope, function(rows) {
            var msg = 'rows changed ' + rows.length;
            $log.log(msg);
        });
    };

}])

// .controller('modalCtrl', ['$scope', '$uibModalInstance', 'listContacts', '$http', '$window', 'CONFIG', function($scope, $uibModalInstance,listContacts,$http,$window,CONFIG) {

//     this.successMsg = false;

//     this.subject = "MintMesh Enterprise Invitation";
//     this.body = "We bring this powerful referral  platform to you. Please download the app and sign up. We are excited to have you be a part of our success here at MintMesh Enterprise.";

//     var scope = this;

//     this.invite = function() {
//         scope.invite_cond = true;
//         var list = listContacts.toString();
//         var paramas = $.param({
//             invite_contacts : list,
//             email_subject : scope.subject,
//             email_body :scope.body
//         });
//         var invite_contacts = $http({
//             headers: {
//                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
//             },
//             method: 'POST',
//             url: CONFIG.APP_DOMAIN+'email_invitation',
//             data: paramas
//         })
//         invite_contacts.success(function(response){
//             if(response.status_code == 200){
//                 scope.invite_cond = false;
//                 scope.successMsg = true;
//             }
//             else if(response.status_code == 400){
//                 $window.location = CONFIG.APP_DOMAIN + 'logout';
//             }
//         })
//         invite_contacts.error(function(response){
//             scope.invite_cond = false;
//         })

//     };

//     this.jumpPage = function(){
//         $window.location = CONFIG.APP_DOMAIN+'dashboard';
//     }
    
//     $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

//         $uibModalInstance.dismiss('cancel');

//     })

// }]);

}());