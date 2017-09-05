/* global angular */

(function () {
    "use strict";

    angular
            .module('app.candidates', ['ui.grid', 'ui.grid.selection', 'angular-svg-round-progressbar', 'textAngular'])
            .controller('CandidateController', CandidateController)
            .controller('CandidateDetailsController', CandidateDetailsController)
            .controller('ResumeRoomController', ResumeRoomController)
            .controller('UploadResumeController', UploadResumeController)
            .controller('FindResumeController', FindResumeController)

    CandidateController.$inject = ['App'];
    CandidateDetailsController.$inject = ['$http', '$q', '$timeout', '$window', '$stateParams', 'CONFIG', 'App'];
    ResumeRoomController.$inject = ['$state', '$window', '$uibModal', '$http', '$q', '$timeout', 'ajaxService', 'CompanyDetails', 'App'];
    UploadResumeController.$inject = ['$rootScope', '$scope', '$http', '$timeout', '$window', '$uibModal', 'App'];
    FindResumeController.$inject = ['$scope', '$http', '$q', '$timeout', '$filter', 'orderByFilter', '$window', 'CompanyDetails', 'App'];


    function CandidateController(App) {
        this.enableAIModule = App.ENABLE_AI_TAB;
    }


    function ResumeRoomController($state, $window, $uibModal, $http, $q, $timeout, ajaxService, CompanyDetails, App) {

        var vm = this, canceler,
                gridApiCall = App.base_url + 'get_company_all_referrals';

        // Multiple Select Search header 
        /*$element.find('input').on('keydown', function(ev) {
         ev.stopPropagation();
         });*/

        vm.noCandidates = false;
        vm.loader = false;
        vm.statusOptions = [{status: 'Interviewed', value: 1}, {status: 'Offered', value: 2}, {status: 'Hired', value: 3}];
        vm.filterOptions = ['Accepted', 'Interviewed', 'Offered', 'Hired', 'Unsolicited', 'Declined']

        vm.applyFilter = applyFilter;
        // vm.statusChange = statusChange;
        vm.statusUpdate = statusUpdate;
        vm.awtStatus = awtStatus;
        vm.downloadResume = downloadResume;
        vm.pageChanged = pageChanged;

        // epi search directive
        vm.search_opts = {
            delay: 500,
            progress: false,
            complete: false,
            placeholder: 'Search by Job or Status',
            onSearch: function (val) {
                vm.search_val = val;
                if (vm.search_opts.progress) {
                    if (vm.search_opts.value) {
                        gridCall(vm.search_val, function () {
                            vm.pageNumber = 1;
                            vm.search_opts.progress = false;
                            vm.search_opts.complete = true;
                        });
                    }
                }
            },
            onClear: function () {
                vm.search_val = "";
                gridCall('', function () {
                    vm.pageNumber = 1;
                });
            }
        }

        // filter api call
        var a = [0];
        function applyFilter() {
            if (vm.filterList != undefined) {
                if (a[0] == 0 && vm.filterList.length == 0) {
                    return false
                }
                a[0] = vm.filterList.length;
                gridCall(vm.search_val, function () {
                    vm.pageNumber = 1;
                });
            }
        }

        // grid function
        vm.gridOptions = {
            rowHeight: 70,
            selectionRowHeaderWidth: 44,
            enableHorizontalScrollbar: 0,
            enableSorting: true,
            enableColumnMenus: false,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableFullRowSelection: true,
            data: 'data',
            appScopeProvider: vm // bindin scope to grid
        };

        vm.gridOptions.columnDefs = [
            {name: 'fullname', displayName: 'CANDIDATE NAME', headerTooltip: 'Candidate Name',
                cellTooltip: function (row, col) {
                    return row.entity.fullname;
                }
            },
            {name: 'referred_by_name', displayName: 'REFERRED BY', headerTooltip: 'Referred By'},
            {name: 'service_name', displayName: 'JOB/POSITION', headerTooltip: 'Job/Position'},
            {name: 'resume_name', displayName: 'RESUME', headerTooltip: 'RESUME',
                cellTemplate: 'download-resume.html'
            },
            {name: 'created_at', displayName: 'DATE', headerTooltip: 'DATE'},
            {name: 'one_way_status', displayName: 'STATUS', headerTooltip: 'Status', cellTemplate: 'status-change.html', width: '14%'}
        ]

        vm.gridOptions.onRegisterApi = function (gridApi) {
            gridApi.selection.on.rowSelectionChanged(null, function (row) {
                
                updateRowSelection(row);
                $state.go('app.candidates.details', { id : row.entity.id });

            });

            gridApi.selection.on.rowSelectionChangedBatch(null, function (rows) {
                for (var i = 0; i < rows.length; i++) {
                    updateRowSelection(rows[i]);
                }
            });
            vm.gridApi = gridApi;
        }

        vm.countArr = [];
        vm.countHiredVsDeclined = [];
        vm.statusTokens = [];
        function updateRowSelection(row) {
            var index = vm.countArr.indexOf(row.entity.id);
            var indexHireVsDecline = vm.countHiredVsDeclined.indexOf(row.entity.id);
            if (row.isSelected) {
                if (indexHireVsDecline == -1 && (row.entity.one_way_status == 'DECLINED' || row.entity.awt_status == 'HIRED' || row.entity.one_way_status == 'UNSOLICITED' || row.entity.one_way_status == 'PENDING')) {
                    vm.countHiredVsDeclined.push(row.entity.id);
                } else if (index == -1 && (row.entity.one_way_status != 'DECLINED' || row.entity.awt_status != 'HIRED' || row.entity.one_way_status != 'UNSOLICITED' || row.entity.one_way_status != 'PENDING')) {
                    vm.countArr.push(row.entity.id);
                    vm.statusTokens.push(row.entity.awt_status == "ACCEPTED" ? 1 : (row.entity.awt_status == "INTERVIEWED" ? 2 : 3));
                }
            }
            else {
                if (index > -1) {
                    vm.countArr.splice(index, 1);
                    vm.statusTokens.splice(index, 1);
                }
                if (indexHireVsDecline > -1) {
                    vm.countHiredVsDeclined.splice(indexHireVsDecline, 1);
                }
            }
            vm.selectionCount = vm.countArr.length + vm.countHiredVsDeclined.length + ' Candidate(s) Selected ';
        }

        vm.data = [];
        vm.gridOptions.data = vm.data;

        // pagination
        function pageChanged(pageNo, search, callBack) {
            vm.noCandidates = false;
            vm.loader = true;

            vm.countArr = [];
            vm.statusTokens = [];
            vm.status = '';
            vm.selectionCount = '';

            if (canceler) {
                canceler.resolve();
            }

            canceler = $q.defer();

            var data = $("form[name='filter_form']").serialize();
            return $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: gridApiCall,
                data: data + '&' + $.param({
                    search: search,
                    page_no: pageNo,
                }),
                timeout: canceler.promise
            })
                    .then(function (response) {
                        vm.loader = false;
                        if (callBack != undefined) {
                            callBack();
                        }
                        if (response.data.status_code == 200) {
                            vm.gridApi.selection.clearSelectedRows();
                            if (response.data.data.length == 0) {
                                vm.noCandidates = true;
                                vm.gridOptions.data = [];
                            }
                            else {
                                vm.gridOptions.data = response.data.data.referrals;
                                if (pageNo == 1) {
                                    vm.totalRecords = response.data.data.total_records;
                                }
                            }
                            try {
                               document.getElementsByClassName("ui-grid-viewport")[0].scrollTop = 0;
                            }
                            catch(err) {
                                console.log("error in scroll");
                            }
                            
                        }
                        else if (response.data.status_code == 403) {
                            vm.noCandidates = true;
                            vm.gridOptions.data = [];
                            vm.totalRecords = 0;
                        }
                        else if (response.data.status_code == 400) {
                            $window.location = App.base_url + 'logout';
                        }
                    })
        }

        $timeout(function () {
            pageChanged('1', '');
        })

        function gridCall(val, callBack) {
            pageChanged('1', val, callBack);
        }

        // important dont delete
        /*function statusChange(option){
         var filterIds = [];
         for(var i = 0; i < vm.statusTokens.length; i++){
         if(vm.statusTokens[i] == option.value){
         filterIds.push(vm.countArr[i]);
         }
         }
         if(!filterIds.length){
         return;
         }
         
         if(canceler){
         canceler.resolve();
         }
         
         vm.loader = true;
         canceler = $q.defer();
         
         $http({
         headers: {
         'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
         },
         method: 'POST',
         url: App.base_url + 'multiple_awaiting_action',
         data: $.param({
         id : filterIds,
         awaiting_action_status : option.status
         }),
         timeout: canceler.promise
         })
         .then(function(response){
         if(response.data.status_code == 200){
         angular.forEach(vm.gridOptions.data, function(data, index){
         angular.forEach(filterIds, function(list, indx){
         if(vm.gridOptions.data[index].id == list){
         if(option.status == 'Interviewed' && vm.gridOptions.data[index].awt_status== 'ACCEPTED'){
         vm.gridOptions.data[index].awt_status = response.data.data.awt_status;
         }
         if(option.status == 'Offered' && vm.gridOptions.data[index].awt_status== 'INTERVIEWED'){
         vm.gridOptions.data[index].awt_status = response.data.data.awt_status;
         }
         if(option.status == 'Hired' && vm.gridOptions.data[index].awt_status== 'OFFERED'){
         vm.gridOptions.data[index].awt_status = response.data.data.awt_status;
         }
         }
         });
         })
         vm.status = '';
         vm.gridApi.selection.clearSelectedRows();
         vm.loader = false;
         }
         })
         }*/

        function statusUpdate(row, flag, e) {
            flag = flag == 1 ? 'ACCEPTED' : 'DECLINED';
            if (flag == 'DECLINED') {
                $uibModal.open({
                    animation: false,
                    backdrop: 'static',
                    keyboard: false,
                    templateUrl: 'templates/dialogs/referral_status.phtml',
                    openedClass: "referral-status",
                    resolve: {
                        referralObj: function () {
                            var referralObj = row.entity;
                            referralObj.tabName = vm.pageNumber || 1;
                            referralObj.ajaxFunCall = pageChanged;
                            referralObj.stateFlag = 1;
                            return referralObj;
                        }
                    },
                    controller: 'ReferralStatus',
                    controllerAs: "refStatus"
                });
                return;
            }
            vm.loader = true;
            var ajax = ajaxService.async(row.entity, flag, 1);
            ajax.success(function (response) {
                vm.loader = false;
                if (response.status_code == 200) {
                    var match = row.entity.id;
                    angular.forEach(vm.gridOptions.data, function (row, index) {
                        if (vm.gridOptions.data[index].id == match) {
                            vm.gridOptions.data[index].one_way_status = response.data.one_way_status;
                            vm.gridOptions.data[index].awt_status = response.data.one_way_status;
                            return false;
                        }
                    });
                    vm.gridApi.selection.clearSelectedRows();
                }
                else if (response.status_code == 400) {
                    $window.location = CONFIG.APP_DOMAIN + 'logout';
                }

            })
        }

        function awtStatus(row) {
            return row.entity.awt_status;
        }

        function downloadResume(row, path) {
            return path ? (App.API_DOMAIN + "getResumeDownload?company_id=" + CompanyDetails.company_code + "&doc_id=" + row.entity.document_id) : row.entity.resume_path;
        }

    }


    function UploadResumeController($rootScope, $scope, $http, $timeout, $window, $uibModal, App) {
        /*Note filesInQueue object status( 
         1->qqUploading--valid file(progressbar(blue), crossMark) 
         2-> s3Uploading--apiTriggering(progressbar(blue), loadingspinner), 
         3->s3Uploaded--sucesss(serverMessage , deleteIcon) 
         4->failed(progressbar(red), crossMark);
         */
        var vm = this;

        this.filesInQueue = [];
        function upload(id) {
            if (id == 'upload')
                $timeout(function () {
                    $('input[type="file"]').attr('title', ' ');
                }, 100);
            App.Helpers.initUploader({
                id: id,
                dragText: "Drop files here to upload or ",
                enableDragDrop: true,
                multiple: true,
                uploadButtonText: id == 'upload' ? "Choose file" : 'Change',
                minSizeLimit: (1 * 1024),
                size: (5 * 1024 * 1024),
                allowedExtensions: ['doc', 'docx'],
                action: App.base_url + "resume_file_upload",
                showFileInfo: false,
                shortMessages: true,
                remove: true,
                file_name: 'certificate_org_name',
                path_name: 'certificate_path',
                onSubmit: function (id, name, size) {
                    vm.errorMsg = '';
                    vm.filesInQueue.push({tempId: id, fileName: name, value: 0, fileSize: Math.round(size / 1024) + 'KB', showFile: true, status: 'qqUploading', inProgress: true, cls: ''});
                    $scope.$apply();

                },
                onComplete: function (id, name, response) {

                    if (response.success) {
                        angular.forEach(vm.filesInQueue, function (file, fileIndex) {
                            if (file.tempId == id) {
                                file.status = 's3Uploading';
                            }
                        })
                        uploadResume(id, response);
                    } else {
                        angular.forEach(vm.filesInQueue, function (file, fileIndex) {
                            if (file.tempId == id) {
                                file.status = 'failed';
                                file.inProgress = false;
                                file.serverMsg = !response.msg ? 'File not uploaded.' : response.msg;
                                if (!$rootScope.online) {
                                    file.serverMsg = 'Network Error';
                                }
                                file.cls = 'error';
                            }
                        })
                    }
                    $scope.$apply();
                },
                onProgress: function (id, fileName, loaded, total) {
                    vm.filesInQueue[id].value = Math.round((loaded / total) * 100);
                    vm.filesInQueue[id].remaining = Math.round(loaded / 1024) + 'KB';
                    $scope.$apply();
                },
                onCancel: function (id, fileName) {
                    /*if(fileName){
                     angular.forEach(vm.filesInQueue, function(file, fileIndex){
                     if(file.tempId == id){
                     vm.filesInQueue[fileIndex].cancel = 1;
                     }
                     })
                     }*/

                },
                showMessage: function (msg, obj) {
                    vm.errorMsg = msg;
                    $scope.$apply();
                },
                onRemove: function () {
                },
                onRemoveComplete: function () {
                }
            }, function (para) {
                vm.fileHandler = para;
            })
        }

        upload('upload');

        this.discardFile = function () {
            angular.forEach(vm.filesInQueue, function (file) {
                if (file.status == 'qqUploading') {
                    file.status = 'failed';
                    file.inProgress = false;
                    vm.fileHandler.cancel(file.tempId)
                }
            })
        }

        this.deleteDiscardFile = function (index) {
            var file = vm.filesInQueue[index];
            if (file.status != 'failed') {
                file.status = 'failed';
                file.inProgress = false;
                vm.fileHandler.cancel(file.tempId);
            }
            file.showFile = false;
        }

        this.deleteFile = function (flag) {
            $uibModal.open({
                animation: false,
                backdrop: 'static',
                keyboard: false,
                templateUrl: 'templates/dialogs/common-confirm-msg.phtml',
                openedClass: "referral-status confirm-message",
                resolve: {
                    paramsMdService: function () {
                        return {
                            firstMsg: 'Are you sure you want to ',
                            secondMsg: flag ? 'delete the RESUME ?' : 'delete ALL RESUMES ?',
                            params: '',
                            apiEndPoint: '',
                        };
                    }
                },
                controller: 'CommonConfirmMessage',
                controllerAs: 'CommonConfirmMsgCtrl'
            })
        }

        function uploadResume(id, response) {
            $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: 'upload_resume',
                data: $.param({resume_name: response.org_name, resume: response.filename})
            })
                    .then(function (response) {
                        if (response.data.status_code == 200) {
                            vm.filesInQueue[id].status = 's3Uploaded';
                            vm.filesInQueue[id].cls = 'success';
                        } else if (response.data.status_code == 403) {
                            vm.filesInQueue[id].status = "failed";
                            vm.filesInQueue[id].cls = 'error';
                        }
                        vm.filesInQueue[id].serverMsg = response.data.message.msg[0];
                        vm.filesInQueue[id].inProgress = false;
                    });
        }

    }


    function FindResumeController($scope, $http, $q, $timeout, $filter, orderByFilter, $window, CompanyDetails, App) {

        var vm = this,
                cancelerAI,
                cancelerSearchResume,
                prevFilterByScore = "",
                paginationOptions = {
                    pageNumber: 1,
                    pageSize: 15,
                    scoreRange: null
                },
        slider_opts = {
            min: 0,
            max: 5,
            value: 5,
            model: null
        };

        this.selectedResues = [];
        this.responseResumes = [];
        this.displayResumes = [];
        this.tempResumes = [];
        this.submitted = false;
        this.inProgressAI = false;
        this.inProgressSearchResumes = false;
        this.hideSearchResume = false;
        this.hideResumesList = false;
        this.hasAITrigger = false;

        this.slider_opts = {
            role: angular.extend({}, slider_opts, {id: 'ai-role'}),
            loc: angular.extend({}, slider_opts, {id: 'ai-loc'}),
            exp: angular.extend({}, slider_opts, {id: 'ai-exp'}),
            skills: angular.extend({}, slider_opts, {id: 'ai-skills'})
        };

        this.filterOptions = [{key: "75-100", value: '75% to 100%'}, {key: "50-75", value: '50% to 75%'}, {key: "0-50", value: '0% to 50%'}];
        this.filterOptions2 = [{key: 10, value: 'Top 10'}, {key: 50, value: 'Top 50'}, {key: 100, value: 'Top 100'}];

        this.description = "";
        this.critera = {};

        this.aiTrigger = function () {
            if (this.description.length > 3) {
                var params = {};
                params.jd = this.description;

                if (cancelerAI) {
                    cancelerAI.resolve();
                }

                if (cancelerSearchResume) {
                    cancelerSearchResume.resolve();
                }

                cancelerAI = $q.defer();
                this.inProgressAI = true;
                $http({
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    method: 'POST',
                    url: App.base_url + 'getResumeParser',
                    data: $.param(params),
                    timeout: cancelerAI.promise
                })
                        .then(function (response) {
                            if (response.status == 200) {
                                vm.criteria = response.data;
                                if (response.data.skills)
                                    vm.criteria.skills = response.data.skills.toString().split(",").join(", ");
                                vm.inProgressAI = false;
                                vm.hasAITrigger = true;
                            }
                            else if (response.data.status_code == 400) {
                                $window.location = App.base_url + 'logout';
                            }
                        });
            }
        }

        this.searchResume = function () {
            if (cancelerSearchResume) {
                cancelerSearchResume.resolve();
            }
            searchResume();
            this.filterByScore = "";
        }

        this.loadResumes = function () {
            var resumes = vm.tempResumes.splice(0, paginationOptions.pageSize);
            vm.displayResumes = vm.displayResumes.concat(angular.copy(resumes));
        }

        this.applyFilterByScore = function () {
            if ((!this.filterByScore.length && (prevFilterByScore == this.filterByScore.toString()))) {
                return;
            }

            vm.displayResumes = [];
            vm.selectedResues = [];
            if (this.filterByScore.length) {
                var filteredResumes = [];
                angular.forEach(this.filterByScore, function (value) {
                    var arrValue = value.split('-');
                    filteredResumes = filteredResumes.concat(minMaxFilter(Number(arrValue[0]), Number(arrValue[1])));
                });
                filteredResumes = angular.copy($filter('unique')(filteredResumes, 'doc_id'));
                filteredResumes = angular.copy(orderByFilter(filteredResumes, 'total_score', true));
                vm.tempResumes = angular.copy(filteredResumes);
                vm.displayCount = filteredResumes.length;
            } else {
                vm.tempResumes = angular.copy(vm.responseResumes);
                vm.displayCount = vm.responseResumes.length;
            }
            vm.loadResumes();
            prevFilterByScore = this.filterByScore.toString();

        }

        this.filterByCount = function () {
            if (!vm.displayResumes.length) {
                return;
            }
        }

        this.downloadZip = function () {
            return App.API_DOMAIN + "getZipDownload?company_id=" + CompanyDetails.company_code + "&resumes=" + vm.selectedResues.toString();
        }

        this.selectResume = function (resumeEmail) {
            var position = this.selectedResues.indexOf(resumeEmail);
            if (position < 0) {
                vm.selectedResues.push(resumeEmail);
            } else {
                vm.selectedResues.splice(position, 1);
            }
        }

        this.toogleSearchResume = function () {
            $("#ai-view").slideToggle('slow');
            this.hideSearchResume = !this.hideSearchResume;
        }

        this.toogleResumesList = function () {
            $("#hide-resumes").slideToggle('slow');
            this.hideResumesList = !this.hideResumesList;
        }

        function searchResume() {
            var params = {};
            params.jd = vm.description;
            params.weights = {
                role: vm.slider_opts.role.model,
                location: vm.slider_opts.loc.model,
                exp: vm.slider_opts.exp.model,
                skills: vm.slider_opts.skills.model
            };
            params.tenant_id = CompanyDetails.company_id;

            cancelerSearchResume = $q.defer();
            vm.inProgressSearchResumes = true;
            $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: App.base_url + 'getResumesFindByWeights',
                data: $.param(params),
                timeout: cancelerSearchResume.promise
            })
                    .then(function (response) {
                        if (response.status == 200) {

                            vm.displayResumes = [];
                            vm.selectedResues = [];

                            angular.forEach(response.data.resumes, function (resume) {
                                resume.viewResume = App.base_url + "viewer?url=" + App.s3_path + CompanyDetails.company_id + "/" + resume.filename;
                                resume.downloadResume = App.API_DOMAIN + "getResumeDownload?company_id=" + CompanyDetails.company_code + "&doc_id=" + resume.doc_id;
                            });

                            vm.responseResumes = angular.copy(response.data.resumes) || [];
                            vm.tempResumes = angular.copy(vm.responseResumes);
                            vm.displayCount = vm.responseResumes.length;
                            vm.loadResumes();
                            vm.submitted = false;
                            vm.inProgressSearchResumes = false;
                            if (!$('#hide-resumes').is(':visible')) {
                                vm.toogleResumesList();
                            }
                            vm.toogleSearchResume();
                        }
                        else if (response.data.status_code == 400) {
                            $window.location = App.base_url + 'logout';
                        }
                    });
        }

        function minMaxFilter(min, max) {
            var filtered = [];
            angular.forEach(vm.responseResumes, function (resume) {
                if (resume.total_score >= min && resume.total_score <= max) {
                    filtered.push(resume);
                }
            });
            return filtered;
        }

    }


    function CandidateDetailsController($http, $q, $timeout, $window, $stateParams, CONFIG, App) {
     
        var vm = this,
                    cancelerAttendees,
                    candidateId = $stateParams.id;

        vm.status = "PENDING";
        vm.scheduleForList   = ["Onsite Interview"];
        vm.statusList = ["PENDING"];
        vm.timeZone   = [
              {
                "value": "Dateline Standard Time",
                "abbr": "DST",
                "offset": -12,
                "isdst": false,
                "text": "(UTC-12:00) International Date Line West",
                "utc": [
                  "Etc/GMT+12"
                ]
              },
              {
                "value": "UTC-11",
                "abbr": "U",
                "offset": -11,
                "isdst": false,
                "text": "(UTC-11:00) Coordinated Universal Time-11",
                "utc": [
                  "Etc/GMT+11",
                  "Pacific/Midway",
                  "Pacific/Niue",
                  "Pacific/Pago_Pago"
                ]
              },
              {
                "value": "Hawaiian Standard Time",
                "abbr": "HST",
                "offset": -10,
                "isdst": false,
                "text": "(UTC-10:00) Hawaii",
                "utc": [
                  "Etc/GMT+10",
                  "Pacific/Honolulu",
                  "Pacific/Johnston",
                  "Pacific/Rarotonga",
                  "Pacific/Tahiti"
                ]
              },
              {
                "value": "Alaskan Standard Time",
                "abbr": "AKDT",
                "offset": -8,
                "isdst": true,
                "text": "(UTC-09:00) Alaska",
                "utc": [
                  "America/Anchorage",
                  "America/Juneau",
                  "America/Nome",
                  "America/Sitka",
                  "America/Yakutat"
                ]
              },
              {
                "value": "Pacific Standard Time (Mexico)",
                "abbr": "PDT",
                "offset": -7,
                "isdst": true,
                "text": "(UTC-08:00) Baja California",
                "utc": [
                  "America/Santa_Isabel"
                ]
              },
              {
                "value": "Pacific Standard Time",
                "abbr": "PDT",
                "offset": -7,
                "isdst": true,
                "text": "(UTC-08:00) Pacific Time (US & Canada)",
                "utc": [
                  "America/Dawson",
                  "America/Los_Angeles",
                  "America/Tijuana",
                  "America/Vancouver",
                  "America/Whitehorse",
                  "PST8PDT"
                ]
              },
              {
                "value": "US Mountain Standard Time",
                "abbr": "UMST",
                "offset": -7,
                "isdst": false,
                "text": "(UTC-07:00) Arizona",
                "utc": [
                  "America/Creston",
                  "America/Dawson_Creek",
                  "America/Hermosillo",
                  "America/Phoenix",
                  "Etc/GMT+7"
                ]
              },
              {
                "value": "Mountain Standard Time (Mexico)",
                "abbr": "MDT",
                "offset": -6,
                "isdst": true,
                "text": "(UTC-07:00) Chihuahua, La Paz, Mazatlan",
                "utc": [
                  "America/Chihuahua",
                  "America/Mazatlan"
                ]
              },
              {
                "value": "Mountain Standard Time",
                "abbr": "MDT",
                "offset": -6,
                "isdst": true,
                "text": "(UTC-07:00) Mountain Time (US & Canada)",
                "utc": [
                  "America/Boise",
                  "America/Cambridge_Bay",
                  "America/Denver",
                  "America/Edmonton",
                  "America/Inuvik",
                  "America/Ojinaga",
                  "America/Yellowknife",
                  "MST7MDT"
                ]
              },
              {
                "value": "Central America Standard Time",
                "abbr": "CAST",
                "offset": -6,
                "isdst": false,
                "text": "(UTC-06:00) Central America",
                "utc": [
                  "America/Belize",
                  "America/Costa_Rica",
                  "America/El_Salvador",
                  "America/Guatemala",
                  "America/Managua",
                  "America/Tegucigalpa",
                  "Etc/GMT+6",
                  "Pacific/Galapagos"
                ]
              },
              {
                "value": "Central Standard Time",
                "abbr": "CDT",
                "offset": -5,
                "isdst": true,
                "text": "(UTC-06:00) Central Time (US & Canada)",
                "utc": [
                  "America/Chicago",
                  "America/Indiana/Knox",
                  "America/Indiana/Tell_City",
                  "America/Matamoros",
                  "America/Menominee",
                  "America/North_Dakota/Beulah",
                  "America/North_Dakota/Center",
                  "America/North_Dakota/New_Salem",
                  "America/Rainy_River",
                  "America/Rankin_Inlet",
                  "America/Resolute",
                  "America/Winnipeg",
                  "CST6CDT"
                ]
              },
              {
                "value": "Central Standard Time (Mexico)",
                "abbr": "CDT",
                "offset": -5,
                "isdst": true,
                "text": "(UTC-06:00) Guadalajara, Mexico City, Monterrey",
                "utc": [
                  "America/Bahia_Banderas",
                  "America/Cancun",
                  "America/Merida",
                  "America/Mexico_City",
                  "America/Monterrey"
                ]
              },
              {
                "value": "Canada Central Standard Time",
                "abbr": "CCST",
                "offset": -6,
                "isdst": false,
                "text": "(UTC-06:00) Saskatchewan",
                "utc": [
                  "America/Regina",
                  "America/Swift_Current"
                ]
              },
              {
                "value": "SA Pacific Standard Time",
                "abbr": "SPST",
                "offset": -5,
                "isdst": false,
                "text": "(UTC-05:00) Bogota, Lima, Quito",
                "utc": [
                  "America/Bogota",
                  "America/Cayman",
                  "America/Coral_Harbour",
                  "America/Eirunepe",
                  "America/Guayaquil",
                  "America/Jamaica",
                  "America/Lima",
                  "America/Panama",
                  "America/Rio_Branco",
                  "Etc/GMT+5"
                ]
              },
              {
                "value": "Eastern Standard Time",
                "abbr": "EDT",
                "offset": -4,
                "isdst": true,
                "text": "(UTC-05:00) Eastern Time (US & Canada)",
                "utc": [
                  "America/Detroit",
                  "America/Havana",
                  "America/Indiana/Petersburg",
                  "America/Indiana/Vincennes",
                  "America/Indiana/Winamac",
                  "America/Iqaluit",
                  "America/Kentucky/Monticello",
                  "America/Louisville",
                  "America/Montreal",
                  "America/Nassau",
                  "America/New_York",
                  "America/Nipigon",
                  "America/Pangnirtung",
                  "America/Port-au-Prince",
                  "America/Thunder_Bay",
                  "America/Toronto",
                  "EST5EDT"
                ]
              },
              {
                "value": "US Eastern Standard Time",
                "abbr": "UEDT",
                "offset": -4,
                "isdst": true,
                "text": "(UTC-05:00) Indiana (East)",
                "utc": [
                  "America/Indiana/Marengo",
                  "America/Indiana/Vevay",
                  "America/Indianapolis"
                ]
              },
              {
                "value": "Venezuela Standard Time",
                "abbr": "VST",
                "offset": -4.5,
                "isdst": false,
                "text": "(UTC-04:30) Caracas",
                "utc": [
                  "America/Caracas"
                ]
              },
              {
                "value": "Paraguay Standard Time",
                "abbr": "PYT",
                "offset": -4,
                "isdst": false,
                "text": "(UTC-04:00) Asuncion",
                "utc": [
                  "America/Asuncion"
                ]
              },
              {
                "value": "Atlantic Standard Time",
                "abbr": "ADT",
                "offset": -3,
                "isdst": true,
                "text": "(UTC-04:00) Atlantic Time (Canada)",
                "utc": [
                  "America/Glace_Bay",
                  "America/Goose_Bay",
                  "America/Halifax",
                  "America/Moncton",
                  "America/Thule",
                  "Atlantic/Bermuda"
                ]
              },
              {
                "value": "Central Brazilian Standard Time",
                "abbr": "CBST",
                "offset": -4,
                "isdst": false,
                "text": "(UTC-04:00) Cuiaba",
                "utc": [
                  "America/Campo_Grande",
                  "America/Cuiaba"
                ]
              },
              {
                "value": "SA Western Standard Time",
                "abbr": "SWST",
                "offset": -4,
                "isdst": false,
                "text": "(UTC-04:00) Georgetown, La Paz, Manaus, San Juan",
                "utc": [
                  "America/Anguilla",
                  "America/Antigua",
                  "America/Aruba",
                  "America/Barbados",
                  "America/Blanc-Sablon",
                  "America/Boa_Vista",
                  "America/Curacao",
                  "America/Dominica",
                  "America/Grand_Turk",
                  "America/Grenada",
                  "America/Guadeloupe",
                  "America/Guyana",
                  "America/Kralendijk",
                  "America/La_Paz",
                  "America/Lower_Princes",
                  "America/Manaus",
                  "America/Marigot",
                  "America/Martinique",
                  "America/Montserrat",
                  "America/Port_of_Spain",
                  "America/Porto_Velho",
                  "America/Puerto_Rico",
                  "America/Santo_Domingo",
                  "America/St_Barthelemy",
                  "America/St_Kitts",
                  "America/St_Lucia",
                  "America/St_Thomas",
                  "America/St_Vincent",
                  "America/Tortola",
                  "Etc/GMT+4"
                ]
              },
              {
                "value": "Pacific SA Standard Time",
                "abbr": "PSST",
                "offset": -4,
                "isdst": false,
                "text": "(UTC-04:00) Santiago",
                "utc": [
                  "America/Santiago",
                  "Antarctica/Palmer"
                ]
              },
              {
                "value": "Newfoundland Standard Time",
                "abbr": "NDT",
                "offset": -2.5,
                "isdst": true,
                "text": "(UTC-03:30) Newfoundland",
                "utc": [
                  "America/St_Johns"
                ]
              },
              {
                "value": "E. South America Standard Time",
                "abbr": "ESAST",
                "offset": -3,
                "isdst": false,
                "text": "(UTC-03:00) Brasilia",
                "utc": [
                  "America/Sao_Paulo"
                ]
              },
              {
                "value": "Argentina Standard Time",
                "abbr": "AST",
                "offset": -3,
                "isdst": false,
                "text": "(UTC-03:00) Buenos Aires",
                "utc": [
                  "America/Argentina/La_Rioja",
                  "America/Argentina/Rio_Gallegos",
                  "America/Argentina/Salta",
                  "America/Argentina/San_Juan",
                  "America/Argentina/San_Luis",
                  "America/Argentina/Tucuman",
                  "America/Argentina/Ushuaia",
                  "America/Buenos_Aires",
                  "America/Catamarca",
                  "America/Cordoba",
                  "America/Jujuy",
                  "America/Mendoza"
                ]
              },
              {
                "value": "SA Eastern Standard Time",
                "abbr": "SEST",
                "offset": -3,
                "isdst": false,
                "text": "(UTC-03:00) Cayenne, Fortaleza",
                "utc": [
                  "America/Araguaina",
                  "America/Belem",
                  "America/Cayenne",
                  "America/Fortaleza",
                  "America/Maceio",
                  "America/Paramaribo",
                  "America/Recife",
                  "America/Santarem",
                  "Antarctica/Rothera",
                  "Atlantic/Stanley",
                  "Etc/GMT+3"
                ]
              },
              {
                "value": "Greenland Standard Time",
                "abbr": "GDT",
                "offset": -2,
                "isdst": true,
                "text": "(UTC-03:00) Greenland",
                "utc": [
                  "America/Godthab"
                ]
              },
              {
                "value": "Montevideo Standard Time",
                "abbr": "MST",
                "offset": -3,
                "isdst": false,
                "text": "(UTC-03:00) Montevideo",
                "utc": [
                  "America/Montevideo"
                ]
              },
              {
                "value": "Bahia Standard Time",
                "abbr": "BST",
                "offset": -3,
                "isdst": false,
                "text": "(UTC-03:00) Salvador",
                "utc": [
                  "America/Bahia"
                ]
              },
              {
                "value": "UTC-02",
                "abbr": "U",
                "offset": -2,
                "isdst": false,
                "text": "(UTC-02:00) Coordinated Universal Time-02",
                "utc": [
                  "America/Noronha",
                  "Atlantic/South_Georgia",
                  "Etc/GMT+2"
                ]
              },
              {
                "value": "Mid-Atlantic Standard Time",
                "abbr": "MDT",
                "offset": -1,
                "isdst": true,
                "text": "(UTC-02:00) Mid-Atlantic - Old"
              },
              {
                "value": "Azores Standard Time",
                "abbr": "ADT",
                "offset": 0,
                "isdst": true,
                "text": "(UTC-01:00) Azores",
                "utc": [
                  "America/Scoresbysund",
                  "Atlantic/Azores"
                ]
              },
              {
                "value": "Cape Verde Standard Time",
                "abbr": "CVST",
                "offset": -1,
                "isdst": false,
                "text": "(UTC-01:00) Cape Verde Is.",
                "utc": [
                  "Atlantic/Cape_Verde",
                  "Etc/GMT+1"
                ]
              },
              {
                "value": "Morocco Standard Time",
                "abbr": "MDT",
                "offset": 1,
                "isdst": true,
                "text": "(UTC) Casablanca",
                "utc": [
                  "Africa/Casablanca",
                  "Africa/El_Aaiun"
                ]
              },
              {
                "value": "UTC",
                "abbr": "CUT",
                "offset": 0,
                "isdst": false,
                "text": "(UTC) Coordinated Universal Time",
                "utc": [
                  "America/Danmarkshavn",
                  "Etc/GMT"
                ]
              },
              {
                "value": "GMT Standard Time",
                "abbr": "GDT",
                "offset": 1,
                "isdst": true,
                "text": "(UTC) Dublin, Edinburgh, Lisbon, London",
                "utc": [
                  "Atlantic/Canary",
                  "Atlantic/Faeroe",
                  "Atlantic/Madeira",
                  "Europe/Dublin",
                  "Europe/Guernsey",
                  "Europe/Isle_of_Man",
                  "Europe/Jersey",
                  "Europe/Lisbon",
                  "Europe/London"
                ]
              },
              {
                "value": "Greenwich Standard Time",
                "abbr": "GST",
                "offset": 0,
                "isdst": false,
                "text": "(UTC) Monrovia, Reykjavik",
                "utc": [
                  "Africa/Abidjan",
                  "Africa/Accra",
                  "Africa/Bamako",
                  "Africa/Banjul",
                  "Africa/Bissau",
                  "Africa/Conakry",
                  "Africa/Dakar",
                  "Africa/Freetown",
                  "Africa/Lome",
                  "Africa/Monrovia",
                  "Africa/Nouakchott",
                  "Africa/Ouagadougou",
                  "Africa/Sao_Tome",
                  "Atlantic/Reykjavik",
                  "Atlantic/St_Helena"
                ]
              },
              {
                "value": "W. Europe Standard Time",
                "abbr": "WEDT",
                "offset": 2,
                "isdst": true,
                "text": "(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",
                "utc": [
                  "Arctic/Longyearbyen",
                  "Europe/Amsterdam",
                  "Europe/Andorra",
                  "Europe/Berlin",
                  "Europe/Busingen",
                  "Europe/Gibraltar",
                  "Europe/Luxembourg",
                  "Europe/Malta",
                  "Europe/Monaco",
                  "Europe/Oslo",
                  "Europe/Rome",
                  "Europe/San_Marino",
                  "Europe/Stockholm",
                  "Europe/Vaduz",
                  "Europe/Vatican",
                  "Europe/Vienna",
                  "Europe/Zurich"
                ]
              },
              {
                "value": "Central Europe Standard Time",
                "abbr": "CEDT",
                "offset": 2,
                "isdst": true,
                "text": "(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague",
                "utc": [
                  "Europe/Belgrade",
                  "Europe/Bratislava",
                  "Europe/Budapest",
                  "Europe/Ljubljana",
                  "Europe/Podgorica",
                  "Europe/Prague",
                  "Europe/Tirane"
                ]
              },
              {
                "value": "Romance Standard Time",
                "abbr": "RDT",
                "offset": 2,
                "isdst": true,
                "text": "(UTC+01:00) Brussels, Copenhagen, Madrid, Paris",
                "utc": [
                  "Africa/Ceuta",
                  "Europe/Brussels",
                  "Europe/Copenhagen",
                  "Europe/Madrid",
                  "Europe/Paris"
                ]
              },
              {
                "value": "Central European Standard Time",
                "abbr": "CEDT",
                "offset": 2,
                "isdst": true,
                "text": "(UTC+01:00) Sarajevo, Skopje, Warsaw, Zagreb",
                "utc": [
                  "Europe/Sarajevo",
                  "Europe/Skopje",
                  "Europe/Warsaw",
                  "Europe/Zagreb"
                ]
              },
              {
                "value": "W. Central Africa Standard Time",
                "abbr": "WCAST",
                "offset": 1,
                "isdst": false,
                "text": "(UTC+01:00) West Central Africa",
                "utc": [
                  "Africa/Algiers",
                  "Africa/Bangui",
                  "Africa/Brazzaville",
                  "Africa/Douala",
                  "Africa/Kinshasa",
                  "Africa/Lagos",
                  "Africa/Libreville",
                  "Africa/Luanda",
                  "Africa/Malabo",
                  "Africa/Ndjamena",
                  "Africa/Niamey",
                  "Africa/Porto-Novo",
                  "Africa/Tunis",
                  "Etc/GMT-1"
                ]
              },
              {
                "value": "Namibia Standard Time",
                "abbr": "NST",
                "offset": 1,
                "isdst": false,
                "text": "(UTC+01:00) Windhoek",
                "utc": [
                  "Africa/Windhoek"
                ]
              },
              {
                "value": "GTB Standard Time",
                "abbr": "GDT",
                "offset": 3,
                "isdst": true,
                "text": "(UTC+02:00) Athens, Bucharest",
                "utc": [
                  "Asia/Nicosia",
                  "Europe/Athens",
                  "Europe/Bucharest",
                  "Europe/Chisinau"
                ]
              },
              {
                "value": "Middle East Standard Time",
                "abbr": "MEDT",
                "offset": 3,
                "isdst": true,
                "text": "(UTC+02:00) Beirut",
                "utc": [
                  "Asia/Beirut"
                ]
              },
              {
                "value": "Egypt Standard Time",
                "abbr": "EST",
                "offset": 2,
                "isdst": false,
                "text": "(UTC+02:00) Cairo",
                "utc": [
                  "Africa/Cairo"
                ]
              },
              {
                "value": "Syria Standard Time",
                "abbr": "SDT",
                "offset": 3,
                "isdst": true,
                "text": "(UTC+02:00) Damascus",
                "utc": [
                  "Asia/Damascus"
                ]
              },
              {
                "value": "E. Europe Standard Time",
                "abbr": "EEDT",
                "offset": 3,
                "isdst": true,
                "text": "(UTC+02:00) E. Europe"
              },
              {
                "value": "South Africa Standard Time",
                "abbr": "SAST",
                "offset": 2,
                "isdst": false,
                "text": "(UTC+02:00) Harare, Pretoria",
                "utc": [
                  "Africa/Blantyre",
                  "Africa/Bujumbura",
                  "Africa/Gaborone",
                  "Africa/Harare",
                  "Africa/Johannesburg",
                  "Africa/Kigali",
                  "Africa/Lubumbashi",
                  "Africa/Lusaka",
                  "Africa/Maputo",
                  "Africa/Maseru",
                  "Africa/Mbabane",
                  "Etc/GMT-2"
                ]
              },
              {
                "value": "FLE Standard Time",
                "abbr": "FDT",
                "offset": 3,
                "isdst": true,
                "text": "(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius",
                "utc": [
                  "Europe/Helsinki",
                  "Europe/Kiev",
                  "Europe/Mariehamn",
                  "Europe/Riga",
                  "Europe/Sofia",
                  "Europe/Tallinn",
                  "Europe/Uzhgorod",
                  "Europe/Vilnius",
                  "Europe/Zaporozhye"
                ]
              },
              {
                "value": "Turkey Standard Time",
                "abbr": "TDT",
                "offset": 3,
                "isdst": false,
                "text": "(UTC+03:00) Istanbul",
                "utc": [
                  "Europe/Istanbul"
                ]
              },
              {
                "value": "Israel Standard Time",
                "abbr": "JDT",
                "offset": 3,
                "isdst": true,
                "text": "(UTC+02:00) Jerusalem",
                "utc": [
                  "Asia/Jerusalem"
                ]
              },
              {
                "value": "Libya Standard Time",
                "abbr": "LST",
                "offset": 2,
                "isdst": false,
                "text": "(UTC+02:00) Tripoli",
                "utc": [
                  "Africa/Tripoli"
                ]
              },
              {
                "value": "Jordan Standard Time",
                "abbr": "JST",
                "offset": 3,
                "isdst": false,
                "text": "(UTC+03:00) Amman",
                "utc": [
                  "Asia/Amman"
                ]
              },
              {
                "value": "Arabic Standard Time",
                "abbr": "AST",
                "offset": 3,
                "isdst": false,
                "text": "(UTC+03:00) Baghdad",
                "utc": [
                  "Asia/Baghdad"
                ]
              },
              {
                "value": "Kaliningrad Standard Time",
                "abbr": "KST",
                "offset": 3,
                "isdst": false,
                "text": "(UTC+03:00) Kaliningrad, Minsk",
                "utc": [
                  "Europe/Kaliningrad",
                  "Europe/Minsk"
                ]
              },
              {
                "value": "Arab Standard Time",
                "abbr": "AST",
                "offset": 3,
                "isdst": false,
                "text": "(UTC+03:00) Kuwait, Riyadh",
                "utc": [
                  "Asia/Aden",
                  "Asia/Bahrain",
                  "Asia/Kuwait",
                  "Asia/Qatar",
                  "Asia/Riyadh"
                ]
              },
              {
                "value": "E. Africa Standard Time",
                "abbr": "EAST",
                "offset": 3,
                "isdst": false,
                "text": "(UTC+03:00) Nairobi",
                "utc": [
                  "Africa/Addis_Ababa",
                  "Africa/Asmera",
                  "Africa/Dar_es_Salaam",
                  "Africa/Djibouti",
                  "Africa/Juba",
                  "Africa/Kampala",
                  "Africa/Khartoum",
                  "Africa/Mogadishu",
                  "Africa/Nairobi",
                  "Antarctica/Syowa",
                  "Etc/GMT-3",
                  "Indian/Antananarivo",
                  "Indian/Comoro",
                  "Indian/Mayotte"
                ]
              },
              {
                "value": "Moscow Standard Time",
                "abbr": "MSK",
                "offset": 3,
                "isdst": false,
                "text": "(UTC+03:00) Moscow, St. Petersburg, Volgograd",
                "utc": [
                    "Europe/Kirov",
                  "Europe/Moscow",
                  "Europe/Simferopol",
                  "Europe/Volgograd"
                ]
              },
              {
                "value": "Samara Time",
                "abbr": "SAMT",
                "offset": 4,
                "isdst": false,
                "text": "(UTC+04:00) Samara, Ulyanovsk, Saratov",
                "utc": [
                    "Europe/Astrakhan",
                  "Europe/Samara",
                    "Europe/Ulyanovsk"
                ]
              },
              {
                "value": "Iran Standard Time",
                "abbr": "IDT",
                "offset": 4.5,
                "isdst": true,
                "text": "(UTC+03:30) Tehran",
                "utc": [
                  "Asia/Tehran"
                ]
              },
              {
                "value": "Arabian Standard Time",
                "abbr": "AST",
                "offset": 4,
                "isdst": false,
                "text": "(UTC+04:00) Abu Dhabi, Muscat",
                "utc": [
                  "Asia/Dubai",
                  "Asia/Muscat",
                  "Etc/GMT-4"
                ]
              },
              {
                "value": "Azerbaijan Standard Time",
                "abbr": "ADT",
                "offset": 5,
                "isdst": true,
                "text": "(UTC+04:00) Baku",
                "utc": [
                  "Asia/Baku"
                ]
              },
              {
                "value": "Mauritius Standard Time",
                "abbr": "MST",
                "offset": 4,
                "isdst": false,
                "text": "(UTC+04:00) Port Louis",
                "utc": [
                  "Indian/Mahe",
                  "Indian/Mauritius",
                  "Indian/Reunion"
                ]
              },
              {
                "value": "Georgian Standard Time",
                "abbr": "GST",
                "offset": 4,
                "isdst": false,
                "text": "(UTC+04:00) Tbilisi",
                "utc": [
                  "Asia/Tbilisi"
                ]
              },
              {
                "value": "Caucasus Standard Time",
                "abbr": "CST",
                "offset": 4,
                "isdst": false,
                "text": "(UTC+04:00) Yerevan",
                "utc": [
                  "Asia/Yerevan"
                ]
              },
              {
                "value": "Afghanistan Standard Time",
                "abbr": "AST",
                "offset": 4.5,
                "isdst": false,
                "text": "(UTC+04:30) Kabul",
                "utc": [
                  "Asia/Kabul"
                ]
              },
              {
                "value": "West Asia Standard Time",
                "abbr": "WAST",
                "offset": 5,
                "isdst": false,
                "text": "(UTC+05:00) Ashgabat, Tashkent",
                "utc": [
                  "Antarctica/Mawson",
                  "Asia/Aqtau",
                  "Asia/Aqtobe",
                  "Asia/Ashgabat",
                  "Asia/Dushanbe",
                  "Asia/Oral",
                  "Asia/Samarkand",
                  "Asia/Tashkent",
                  "Etc/GMT-5",
                  "Indian/Kerguelen",
                  "Indian/Maldives"
                ]
              },
              {
                "value": "Pakistan Standard Time",
                "abbr": "PST",
                "offset": 5,
                "isdst": false,
                "text": "(UTC+05:00) Islamabad, Karachi",
                "utc": [
                  "Asia/Karachi"
                ]
              },
              {
                "value": "India Standard Time",
                "abbr": "IST",
                "offset": 5.5,
                "isdst": false,
                "text": "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi",
                "utc": [
                  "Asia/Kolkata"
                ]
              },
              {
                "value": "Sri Lanka Standard Time",
                "abbr": "SLST",
                "offset": 5.5,
                "isdst": false,
                "text": "(UTC+05:30) Sri Jayawardenepura",
                "utc": [
                  "Asia/Colombo"
                ]
              },
              {
                "value": "Nepal Standard Time",
                "abbr": "NST",
                "offset": 5.75,
                "isdst": false,
                "text": "(UTC+05:45) Kathmandu",
                "utc": [
                  "Asia/Katmandu"
                ]
              },
              {
                "value": "Central Asia Standard Time",
                "abbr": "CAST",
                "offset": 6,
                "isdst": false,
                "text": "(UTC+06:00) Astana",
                "utc": [
                  "Antarctica/Vostok",
                  "Asia/Almaty",
                  "Asia/Bishkek",
                  "Asia/Qyzylorda",
                  "Asia/Urumqi",
                  "Etc/GMT-6",
                  "Indian/Chagos"
                ]
              },
              {
                "value": "Bangladesh Standard Time",
                "abbr": "BST",
                "offset": 6,
                "isdst": false,
                "text": "(UTC+06:00) Dhaka",
                "utc": [
                  "Asia/Dhaka",
                  "Asia/Thimphu"
                ]
              },
              {
                "value": "Ekaterinburg Standard Time",
                "abbr": "EST",
                "offset": 6,
                "isdst": false,
                "text": "(UTC+06:00) Ekaterinburg",
                "utc": [
                  "Asia/Yekaterinburg"
                ]
              },
              {
                "value": "Myanmar Standard Time",
                "abbr": "MST",
                "offset": 6.5,
                "isdst": false,
                "text": "(UTC+06:30) Yangon (Rangoon)",
                "utc": [
                  "Asia/Rangoon",
                  "Indian/Cocos"
                ]
              },
              {
                "value": "SE Asia Standard Time",
                "abbr": "SAST",
                "offset": 7,
                "isdst": false,
                "text": "(UTC+07:00) Bangkok, Hanoi, Jakarta",
                "utc": [
                  "Antarctica/Davis",
                  "Asia/Bangkok",
                  "Asia/Hovd",
                  "Asia/Jakarta",
                  "Asia/Phnom_Penh",
                  "Asia/Pontianak",
                  "Asia/Saigon",
                  "Asia/Vientiane",
                  "Etc/GMT-7",
                  "Indian/Christmas"
                ]
              },
              {
                "value": "N. Central Asia Standard Time",
                "abbr": "NCAST",
                "offset": 7,
                "isdst": false,
                "text": "(UTC+07:00) Novosibirsk",
                "utc": [
                  "Asia/Novokuznetsk",
                  "Asia/Novosibirsk",
                  "Asia/Omsk"
                ]
              },
              {
                "value": "China Standard Time",
                "abbr": "CST",
                "offset": 8,
                "isdst": false,
                "text": "(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi",
                "utc": [
                  "Asia/Hong_Kong",
                  "Asia/Macau",
                  "Asia/Shanghai"
                ]
              },
              {
                "value": "North Asia Standard Time",
                "abbr": "NAST",
                "offset": 8,
                "isdst": false,
                "text": "(UTC+08:00) Krasnoyarsk",
                "utc": [
                  "Asia/Krasnoyarsk"
                ]
              },
              {
                "value": "Singapore Standard Time",
                "abbr": "MPST",
                "offset": 8,
                "isdst": false,
                "text": "(UTC+08:00) Kuala Lumpur, Singapore",
                "utc": [
                  "Asia/Brunei",
                  "Asia/Kuala_Lumpur",
                  "Asia/Kuching",
                  "Asia/Makassar",
                  "Asia/Manila",
                  "Asia/Singapore",
                  "Etc/GMT-8"
                ]
              },
              {
                "value": "W. Australia Standard Time",
                "abbr": "WAST",
                "offset": 8,
                "isdst": false,
                "text": "(UTC+08:00) Perth",
                "utc": [
                  "Antarctica/Casey",
                  "Australia/Perth"
                ]
              },
              {
                "value": "Taipei Standard Time",
                "abbr": "TST",
                "offset": 8,
                "isdst": false,
                "text": "(UTC+08:00) Taipei",
                "utc": [
                  "Asia/Taipei"
                ]
              },
              {
                "value": "Ulaanbaatar Standard Time",
                "abbr": "UST",
                "offset": 8,
                "isdst": false,
                "text": "(UTC+08:00) Ulaanbaatar",
                "utc": [
                  "Asia/Choibalsan",
                  "Asia/Ulaanbaatar"
                ]
              },
              {
                "value": "North Asia East Standard Time",
                "abbr": "NAEST",
                "offset": 9,
                "isdst": false,
                "text": "(UTC+09:00) Irkutsk",
                "utc": [
                  "Asia/Irkutsk"
                ]
              },
              {
                "value": "Tokyo Standard Time",
                "abbr": "TST",
                "offset": 9,
                "isdst": false,
                "text": "(UTC+09:00) Osaka, Sapporo, Tokyo",
                "utc": [
                  "Asia/Dili",
                  "Asia/Jayapura",
                  "Asia/Tokyo",
                  "Etc/GMT-9",
                  "Pacific/Palau"
                ]
              },
              {
                "value": "Korea Standard Time",
                "abbr": "KST",
                "offset": 9,
                "isdst": false,
                "text": "(UTC+09:00) Seoul",
                "utc": [
                  "Asia/Pyongyang",
                  "Asia/Seoul"
                ]
              },
              {
                "value": "Cen. Australia Standard Time",
                "abbr": "CAST",
                "offset": 9.5,
                "isdst": false,
                "text": "(UTC+09:30) Adelaide",
                "utc": [
                  "Australia/Adelaide",
                  "Australia/Broken_Hill"
                ]
              },
              {
                "value": "AUS Central Standard Time",
                "abbr": "ACST",
                "offset": 9.5,
                "isdst": false,
                "text": "(UTC+09:30) Darwin",
                "utc": [
                  "Australia/Darwin"
                ]
              },
              {
                "value": "E. Australia Standard Time",
                "abbr": "EAST",
                "offset": 10,
                "isdst": false,
                "text": "(UTC+10:00) Brisbane",
                "utc": [
                  "Australia/Brisbane",
                  "Australia/Lindeman"
                ]
              },
              {
                "value": "AUS Eastern Standard Time",
                "abbr": "AEST",
                "offset": 10,
                "isdst": false,
                "text": "(UTC+10:00) Canberra, Melbourne, Sydney",
                "utc": [
                  "Australia/Melbourne",
                  "Australia/Sydney"
                ]
              },
              {
                "value": "West Pacific Standard Time",
                "abbr": "WPST",
                "offset": 10,
                "isdst": false,
                "text": "(UTC+10:00) Guam, Port Moresby",
                "utc": [
                  "Antarctica/DumontDUrville",
                  "Etc/GMT-10",
                  "Pacific/Guam",
                  "Pacific/Port_Moresby",
                  "Pacific/Saipan",
                  "Pacific/Truk"
                ]
              },
              {
                "value": "Tasmania Standard Time",
                "abbr": "TST",
                "offset": 10,
                "isdst": false,
                "text": "(UTC+10:00) Hobart",
                "utc": [
                  "Australia/Currie",
                  "Australia/Hobart"
                ]
              },
              {
                "value": "Yakutsk Standard Time",
                "abbr": "YST",
                "offset": 10,
                "isdst": false,
                "text": "(UTC+10:00) Yakutsk",
                "utc": [
                  "Asia/Chita",
                  "Asia/Khandyga",
                  "Asia/Yakutsk"
                ]
              },
              {
                "value": "Central Pacific Standard Time",
                "abbr": "CPST",
                "offset": 11,
                "isdst": false,
                "text": "(UTC+11:00) Solomon Is., New Caledonia",
                "utc": [
                  "Antarctica/Macquarie",
                  "Etc/GMT-11",
                  "Pacific/Efate",
                  "Pacific/Guadalcanal",
                  "Pacific/Kosrae",
                  "Pacific/Noumea",
                  "Pacific/Ponape"
                ]
              },
              {
                "value": "Vladivostok Standard Time",
                "abbr": "VST",
                "offset": 11,
                "isdst": false,
                "text": "(UTC+11:00) Vladivostok",
                "utc": [
                  "Asia/Sakhalin",
                  "Asia/Ust-Nera",
                  "Asia/Vladivostok"
                ]
              },
              {
                "value": "New Zealand Standard Time",
                "abbr": "NZST",
                "offset": 12,
                "isdst": false,
                "text": "(UTC+12:00) Auckland, Wellington",
                "utc": [
                  "Antarctica/McMurdo",
                  "Pacific/Auckland"
                ]
              },
              {
                "value": "UTC+12",
                "abbr": "U",
                "offset": 12,
                "isdst": false,
                "text": "(UTC+12:00) Coordinated Universal Time+12",
                "utc": [
                  "Etc/GMT-12",
                  "Pacific/Funafuti",
                  "Pacific/Kwajalein",
                  "Pacific/Majuro",
                  "Pacific/Nauru",
                  "Pacific/Tarawa",
                  "Pacific/Wake",
                  "Pacific/Wallis"
                ]
              },
              {
                "value": "Fiji Standard Time",
                "abbr": "FST",
                "offset": 12,
                "isdst": false,
                "text": "(UTC+12:00) Fiji",
                "utc": [
                  "Pacific/Fiji"
                ]
              },
              {
                "value": "Magadan Standard Time",
                "abbr": "MST",
                "offset": 12,
                "isdst": false,
                "text": "(UTC+12:00) Magadan",
                "utc": [
                  "Asia/Anadyr",
                  "Asia/Kamchatka",
                  "Asia/Magadan",
                  "Asia/Srednekolymsk"
                ]
              },
              {
                "value": "Kamchatka Standard Time",
                "abbr": "KDT",
                "offset": 13,
                "isdst": true,
                "text": "(UTC+12:00) Petropavlovsk-Kamchatsky - Old",
                "utc": [
                  "Asia/Kamchatka"
                ]
              },
              {
                "value": "Tonga Standard Time",
                "abbr": "TST",
                "offset": 13,
                "isdst": false,
                "text": "(UTC+13:00) Nuku'alofa",
                "utc": [
                  "Etc/GMT-13",
                  "Pacific/Enderbury",
                  "Pacific/Fakaofo",
                  "Pacific/Tongatapu"
                ]
              },
              {
                "value": "Samoa Standard Time",
                "abbr": "SST",
                "offset": 13,
                "isdst": false,
                "text": "(UTC+13:00) Samoa",
                "utc": [
                  "Pacific/Apia"
                ]
              }
        ];

        vm.inProgressCandidateDetails = true;

        vm.schedule = {
            attendees : []
        };
        vm.selectedAttendees   = [];
        vm.inProgressAttendees = false;
        vm.inProgressSchedule  = false;
        vm.submittedSchedule   = false;
        vm.responseMsgSchedule = null;
        
        vm.inProgressPostComment  = false;
        vm.responseMsgPostComment = null;   

        vm.writeMail           = {};
        vm.inProgressPostMail  = false;
        vm.submittedPostMail   = false;
        vm.responseMsgPostMail = null;


        vm.querySearchAttendees = function(searchText){
            
            if (cancelerAttendees) {
                cancelerAttendees.resolve();
            }

            cancelerAttendees      = $q.defer();
            vm.inProgressAttendees = true;
            
            return $http({
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method  : 'POST',
                data    : $.param({search: searchText}),
                url     : CONFIG.APP_DOMAIN + 'company_all_contacts',
                timeout : cancelerAttendees.promise
            })
            .then(function (response) {
                vm.inProgressAttendees = false;
                return  response.data.data;
            })

        }

        vm.changeMailSubject = function() {
            
            angular.forEach(vm.writeMailSubjectList, function(list) {
                if(list.id == vm.writeMail.subjectId) {
                    vm.writeMail.body = list.body;
                }
            })

        }

        vm.postSchedule = function(form) {

            vm.submittedSchedule = true;

            if(form.$valid) {
                
                var tempSelectedAttendee = [];
                angular.forEach(vm.schedule.attendees, function(attendee){
                    tempSelectedAttendee.push(attendee.emailid);
                });

                var apiKeys = $("form[name='schedule_form']").serialize() + '&' + $.param({reference_id : candidateId, candidate_id : vm.details.candidate_id, attendees : tempSelectedAttendee.toString() });

                vm.inProgressSchedule  = true;

                $http({
                    headers : {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    method  : 'POST',
                    url     : App.base_url + 'add_candidate_schedule',
                    data    : apiKeys   
                })
                .then(function (response) {

                    if (response.data.status_code == 200) {
                        vm.inProgressSchedule   = false;
                        vm.submittedSchedule    = false;
                        vm.responseMsgSchedule  = response.data.message.msg[0];
                        $timeout(function(){
                            vm.responseMsgSchedule = null;
                        }, 2000);
                    }
                    else if (response.data.status_code == 400) {
                        $window.location = App.base_url + 'logout';
                    }

                });
            }
        }

        vm.postComments = function(form) {

            var apiKeys = $.param({
                    reference_id : candidateId, 
                    comment : vm.comment,
                    candidate_id : vm.details.candidate_id
                });

            vm.inProgressPostComment  = true;

            $http({
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method  : 'POST',
                url     : App.base_url + 'add_candidate_comment',
                data    : apiKeys   
            })
            .then(function (response) {

                if (response.data.status_code == 200) {
                    vm.inProgressPostComment  = false;
                    vm.responseMsgPostComment = response.data.message.msg[0];
                    $timeout(function(){
                        vm.responseMsgPostComment = null;
                    }, 2000);
                }
                else if (response.data.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }

            });
        }

        vm.postMail = function(form) {

            vm.submittedPostMail = true;

            if(form.$valid) {
                
                var apiKeys = $("form[name='write_mail_form']").serialize() + '&' + $.param({reference_id : candidateId, candidate_id : vm.details.candidate_id });

                vm.inProgressPostMail  = true;

                $http({
                    headers : {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    method  : 'POST',
                    url     : App.base_url + 'add_candidate_email',
                    data    : apiKeys   
                })
                .then(function (response) {

                    if (response.data.status_code == 200) {
                        vm.inProgressPostMail   = false;
                        vm.submittedPostMail    = false;
                        vm.responseMsgPostMail  = response.data.message.msg[0];
                        $timeout(function(){
                            vm.responseMsgPostMail = null;
                        }, 2000);
                    }
                    else if (response.data.status_code == 400) {
                        $window.location = App.base_url + 'logout';
                    }

                });
            }
        }


        function init() {
            getCandidateDetails().then(function () {
                vm.inProgressCandidateDetails = false;
                vm.writeMail.to = vm.details.emailid;    
            });
        }

        function getCandidateDetails() {

            var candidateDetails = $http({
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method  : 'POST',
                url     : App.base_url + 'get_candidate_details',
                data    : $.param({ reference_id: candidateId })
            });

            var emailTemplates = $http({
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method  : 'POST',
                url     : App.base_url + 'get_candidate_email_templates',
                data    : $.param({ reference_id: candidateId })
            });

            var candidateActivities = $http({
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method  : 'POST',
                url     : App.base_url + 'get_candidate_activities',
                data    : $.param({ reference_id: candidateId })
            });

            return $q.all([candidateDetails, emailTemplates, candidateActivities]).then(function (data) {
                
                vm.details                 = data[0].data.data;
                vm.writeMailSubjectList    = data[1].data.data;
                vm.candidateActivitiesList = data[2].data.data;

            }, function() {
                $window.location = App.base_url + 'logout';
            });

        }


        setTimeout(function(){

            $('#interview_date').datetimepicker({
                minDate : new Date(),
                ignoreReadonly: true,
                format: 'dddd, DD MMM YYYY',
                sideBySide : true,
                useCurrent:true
            });

            $('#time_from').datetimepicker({
                ignoreReadonly: true,
                format: 'hh:mm A',
                sideBySide : true,
                useCurrent:true
            });

            $('#time_to').datetimepicker({
                ignoreReadonly: true,
                format: 'hh:mm A',
                sideBySide : true,
                useCurrent:true
            });

            $('#search').on('keydown', function(ev) {
                if(ev.which != 40 && ev.which != 38){
                    ev.stopPropagation();   
                }
            });

        });


        init();

    }



}());
