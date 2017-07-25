/* global angular */

(function () {
    "use strict";

    angular
            .module('app.candidates', ['ui.grid', 'ui.grid.selection', 'angular-svg-round-progressbar', 'textAngular'])
            .controller('CandidateController', CandidateController)
            .controller('ResumeRoomController', ResumeRoomController)
            .controller('UploadResumeController', UploadResumeController)
            .controller('FindResumeController', FindResumeController)

    CandidateController.$inject = ['App'];
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
            enableFullRowSelection: false,
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
                updateRowSelection(row)
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
                                //resume.skills = resume.skills.toString().slice(1, -1).concat('.').split(',').join(', ');
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



}());