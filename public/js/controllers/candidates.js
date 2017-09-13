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
    CandidateDetailsController.$inject = ['$scope', '$state', '$http', '$q', '$timeout', '$window', '$stateParams', '$uibModal', '$mdToast', 'CONFIG', 'CompanyDetails', 'App'];
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
            enableRowSelection: false,
            enableRowHeaderSelection: false,
            enableFullRowSelection: true,
            data: 'data',
            appScopeProvider: vm // bindin scope to grid
        };

        vm.gridOptions.columnDefs = [
            {name: 'fullname', displayName: 'CANDIDATE NAME', headerTooltip: 'Candidate Name', cellTemplate : 'candidate-details.html',
                cellTooltip: function (row, col) {
                    return row.entity.fullname;
                }
            },
            {name: 'referred_by_name', displayName: 'REFERRED BY', headerTooltip: 'Referred By', cellTemplate : 'referred-details.html'},
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


    function CandidateDetailsController($scope, $state, $http, $q, $timeout, $window, $stateParams, $uibModal, $mdToast, CONFIG, CompanyDetails, App) {
        
        var vm = this,
                cancelerAttendees,
                cancelerTagJobs,
                cancelerAddTag,
                prevSearchValue,
                prevSearchValueJobs,
                prevSearchValueAddTag,
                apiKeyType    = $stateParams.type,
                candidateId   = $stateParams.id,
                activitiesType = {
                    candidate_emails    : "mail.png", 
                    candidate_status    : "pending.png",
                    candidate_comments  : "comment.png", 
                    candidate_link_job  : "link.png",
                    candidate_schedules : "schedule.png" 
                },
                apiKeyCandidateDetails = { contact_id:candidateId };

        
        vm.newTalentList      = [{ label:'New Talent'}, { label:'Great Fit' }, { label:'Good Fit' }, { label:'Not Suitable' }, { label:'Employeed' }];
        vm.referralStatusList = ["New", "Reviewed", "Shortlisted", "Scheduled for Interview", "Not Suitable", "Selected", "Offered", "Offer Accepted", "On Hold", "Offer Rejected", "Confirmed to Join", "Hired", "Not Joined", "Joined"];
        vm.scheduleForList    = ["Face to Face", "Online Meeting", "Telephone"];
        vm.referralId         = $stateParams.id;
        vm.hasChangeReferral  = false;

        vm.inProgressCandidateDetails     = true;
        vm.inProgressUpdateReferralStatus = false;

        vm.schedule = {
            attendees : []
        };
        vm.selectedAttendees   = [];
        vm.inProgressAttendees = false;
        vm.inProgressSchedule  = false;
        vm.submittedSchedule   = false;
        vm.responseMsgSchedule = null;
        
        vm.selectedTagJobs    = [];
        vm.inProgressJobsList = false;
        vm.inProgressTagJobs  = false;
        vm.submittedTagJobs   = false;
        vm.responseMsgTagJobs = null;

        vm.inProgressPostComment  = false;
        vm.responseMsgPostComment = null;   

        vm.writeMail           = {};
        vm.inProgressPostMail  = false;
        vm.submittedPostMail   = false;
        vm.responseMsgPostMail = null;

        vm.enableTagChips = false;
        vm.inProgressSearchTagJobs = false;

        vm.showCommentsTab = true;
        vm.showScheduleTab = true;
        vm.showMailsTab    = true;
        vm.showLinkTab     = true;

        vm.querySearchAttendees = function(searchText) {
            
            if (prevSearchValue != searchText) {
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
                    prevSearchValue        = searchText; 
                    vm.inProgressAttendees = false;
                    return response.data.data;
                })
            } else{
                prevSearchValue = null;
                return setTimeout(function(){});
            }
            
        }

        vm.querySearchTagJobs = function(searchText) {
            
            if (prevSearchValueJobs != searchText) {
                if (cancelerTagJobs) {
                    cancelerTagJobs.resolve();
                }
                
                cancelerTagJobs       = $q.defer();
                vm.inProgressJobsList = true;
                
                return $http({
                    headers : {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    method  : 'POST',
                    data    : $.param({search: searchText}),
                    url     : CONFIG.APP_DOMAIN + 'get_candidate_tag_jobs_list',
                    timeout : cancelerTagJobs.promise
                })
                .then(function (response) {
                    prevSearchValueJobs        = searchText; 
                    vm.inProgressJobsList = false;
                    return response.data.data;
                })
            } else{
                prevSearchValueJobs = null;
                return setTimeout(function(){});
            }
            
        }

        vm.querySearchAddTag = function(searchText) {
            if (prevSearchValueAddTag != searchText) {
                if (cancelerAddTag) {
                    cancelerAddTag.resolve();
                }
                
                cancelerAddTag = $q.defer();
                vm.inProgressSearchTagJobs = true;
                
                return $http({
                    headers : {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    method  : 'POST',
                    data    : $.param({tag_name: searchText}),
                    url     : CONFIG.APP_DOMAIN + 'get_candidates_tags',
                    timeout : cancelerAddTag.promise
                })
                .then(function (response) {
                    prevSearchValueAddTag      = searchText; 
                    vm.inProgressSearchTagJobs = false;
                    return response.data.data;
                })
            } else{
                prevSearchValueAddTag = null;
                return setTimeout(function(){});
            }
            
        }

        vm.changeMailSubject = function() {
            
            angular.forEach(vm.writeMailSubjectList, function(list) {
                if(list.id == vm.writeMail.subjectId) {
                    vm.writeMail.body = list.body;
                    vm.writeMail.email_subject = list.subject;
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
                        vm.candidateSchedulesList.unshift(response.data.data.schedule);
                        vm.candidateActivitiesList.unshift(response.data.data.timeline);
                        $timeout(function(){
                            vm.searchText = null;
                            vm.schedule   = {
                                attendees : []
                            };
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
                    vm.candidateCommentsList.unshift(response.data.data.comment);
                    vm.candidateActivitiesList.unshift(response.data.data.timeline)
                    $timeout(function(){
                        vm.comment = null;
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
                
                var apiKeys = $("form[name='write_mail_form']").serialize() + '&' + $.param({reference_id : candidateId, candidate_id : vm.details.candidate_id, email_subject : vm.writeMail.email_subject });

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
                        vm.candidateSendMailsList.unshift(response.data.data.email);
                        vm.candidateActivitiesList.unshift(response.data.data.timeline);
                        vm.responseMsgPostMail  = response.data.message.msg[0];
                        $timeout(function(){
                            vm.writeMail = { to:vm.details.emailid };
                            vm.responseMsgPostMail = null;
                        }, 2000);
                    }
                    else if (response.data.status_code == 400) {
                        $window.location = App.base_url + 'logout';
                    }

                });
            }

        }

        vm.postTagJobs = function() {

            vm.submittedTagJobs = true;

            if(vm.selectedTagJobs.length) {
                
                var tempJobIds = [];
                angular.forEach(vm.selectedTagJobs, function(attendee){
                    tempJobIds.push(attendee.post_id);
                });

                var apiKeys = $.param({reference_id : candidateId, candidate_id : vm.details.candidate_id, job_ids : tempJobIds.toString()});

                vm.inProgressTagJobs  = true;

                $http({
                    headers : {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    method  : 'POST',
                    url     : App.base_url + 'add_candidate_tag_jobs',
                    data    : apiKeys   
                })
                .then(function (response) {

                    if (response.data.status_code == 200) {
                        vm.inProgressTagJobs   = false;
                        vm.submittedTagJobs    = false;
                        vm.candidateSendMailsList.unshift(response.data.data.link_job);
                        vm.candidateActivitiesList.unshift(response.data.data.timeline);
                        vm.responseMsgTagJobs  = response.data.message.msg[0];
                        $timeout(function(){
                            vm.searchTextTagJob   = null;
                            vm.selectedTagJobs    = [];
                            vm.responseMsgTagJobs = null;
                        }, 2000);
                    }
                    else if (response.data.status_code == 400) {
                        $window.location = App.base_url + 'logout';
                    }

                });
            }

        }

        vm.postPersonalStatus = function(talent) {
             
            vm.details.candidate_status.status_name = talent.label; 

            var updatedInfo = '<md-toast class="mm-toast"><div class="md-toast-text" flex><i class="material-icons">done</i><div class="text"><div class="toast-succ">Success!</div><div class="succ-text">Status updated successfully</div></div></div></md-toast>',
                apiKeys = $.param({
                reference_id : candidateId, 
                candidate_id : vm.details.candidate_id, 
                status_name  : talent.label
            });

            $http({
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method  : 'POST',
                url     : App.base_url + 'add_candidate_personal_status',
                data    : apiKeys   
            })
            .then(function (response) {

                if (response.data.status_code == 200) {
                    $mdToast.show({
                       hideDelay: 3000,
                       position: 'top right',
                       template: updatedInfo
                    });
                }
                else if (response.data.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }

            });

        }

        vm.changeReferral = function(ref) {
            
            if(ref.reference_id != candidateId) {

                $state.transitionTo( 'app.candidates.details',
                    { type:'cdt', id : ref.reference_id },
                    { location: true, inherit: true, relative: $state.$current, notify: false }
                ); 

                apiKeyType    = $stateParams.type;
                candidateId   = ref.reference_id;
                vm.referralId = ref.reference_id;
                apiKeyCandidateDetails = { contact_id:candidateId };

                vm.inProgressCandidateDetails = true;
                vm.hasChangeReferral = true;
                vm.submittedSchedule = false;
                vm.submittedPostMail = false;
                vm.submittedTagJobs  = false;

                vm.schedule = {
                    attendees : []
                };
                vm.searchText       = null;
                vm.comment          = null;
                vm.writeMail        = {};
                vm.searchTextTagJob = null;
                vm.selectedTagJobs  = [];

                vm.showCommentsTab = true;
                vm.showScheduleTab = true;
                vm.showMailsTab    = true;
                vm.showLinkTab     = true;

                vm.enableTagChips  = false;

                init(); 
            }

        }

        vm.getActivityPic = function(activity) {
            
            return "public/images/" + activitiesType[activity.activity_type];

        }

        vm.tempGetColor = function(text, selected) {
            if(!!text && !!selected){
                if(text.toUpperCase()==selected.toUpperCase()){
                    return 'rgba(158,158,158,0.2)';
                }
            }
        }

        vm.stateGoFrom = function() {

            switch($stateParams.stateFrom) {
                case "dashboard":
                    $state.go('app.dashboard');
                    break;
                case "job":
                    $state.go('app.engagement/contacts', { post_id :'ref', id : $stateParams.stateId });
                    break;
                case "contactInternal":
                    $state.go('app.contact.Internal');
                    break;
                case "contactExternal":
                    $state.go('app.contact.External');
                    break;
                default:
                    $state.go('app.candidates.resumeRoom');
            }

        }

        var referralStatusDialog,
            tempReferralStatus;
        vm.changeReferralStatus = function(status){
            tempReferralStatus = status;
            if(['Scheduled for Interview', 'Not Suitable', 'On Hold'].indexOf(status) > -1 ){
                referralStatusDialog = $uibModal.open({
                    animation: false,
                    backdrop: 'static',
                    keyboard: false,
                    templateUrl: 'templates/candidates/dialog-update-referral_status.phtml',
                    openedClass: "external-bucket",
                    scope: $scope
                });
            } else{
                vm.postReferralStatus(false);   
            }

        }

        vm.postReferralStatus = function(formDialog) {

            if(formDialog){
                vm.inProgressDialog = true;
            } else{
                vm.inProgressUpdateReferralStatus = true;
            }

            var updatedInfo = '<md-toast class="mm-toast"><div class="md-toast-text" flex><i class="material-icons">done</i><div class="text"><div class="toast-succ">Success!</div><div class="succ-text">Status updated successfully</div></div></div></md-toast>',
                apiKeys = $.param({
                    reference_id    : candidateId, 
                    candidate_id    : vm.details.candidate_id,
                    referral_status : tempReferralStatus,
                    referral_msg    : vm.referralStatusComment
                });

            $http({
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method  : 'POST',
                url     : App.base_url + 'edit_candidate_referral_status',
                data    : apiKeys
            })
            .then(function (response) {

                if (response.data.status_code == 200) {
                    vm.inProgressDialog          = false;
                    vm.details.referral_status   = tempReferralStatus;
                    //vm.responseMsgReferralStatus =  response.data.message.msg[0];
                    vm.inProgressUpdateReferralStatus = false;
                    $mdToast.show({
                       hideDelay: 3000,
                       position: 'top right',
                       template: updatedInfo
                    });
                    vm.candidateActivitiesList.unshift(response.data.data.timeline);
                    $timeout(function(){
                        if(referralStatusDialog)
                            referralStatusDialog.close();
                        vm.responseMsgReferralStatus = null;    
                    });
                }
                else if (response.data.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }

            });
        }

        vm.toggleAddTag = function() {
            vm.enableTagChips = true;
            setTimeout(function(){
                $('#tagJob').focus();
            })
        }

        vm.addTag = function(item) {
            if(item){
                vm.enableTagChips = false;
                var hasTag = true;
                angular.forEach(vm.details.candidate_tags, function(tag, index){
                    if(tag.tag_id == item.tag_id) {
                        hasTag = false;
                    }
                });
                if(hasTag){
                    postAddTags(item);
                }
            }
        }

        vm.removeTag = function(removedChip){

            var updatedInfo = '<md-toast class="mm-toast"><div class="md-toast-text" flex><i class="material-icons">done</i><div class="text"><div class="toast-succ">Success!</div><div class="succ-text">Tag updated successfully</div></div></div></md-toast>',
                apiKeys = $.param({
                    reference_id : candidateId, 
                    candidate_id : vm.details.candidate_id,
                    id : removedChip.id
                });

            $http({
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method  : 'POST',
                url     : App.base_url + 'delete_candidate_tag',
                data    : apiKeys
            })
            .then(function (response) {

                if (response.data.status_code == 200) {
                    $mdToast.show({
                       hideDelay: 3000,
                       position: 'top right',
                       template: updatedInfo
                    });
                }
                else if (response.data.status_code == 400) {
                   $window.location = App.base_url + 'logout';
                }

            });

        }

        vm.toogleTabs = function (id) {
            $("#" + id).slideToggle('slow');
            vm[id] = !vm[id];
        }

        function init() {

            getCandidateDetails().then(function () {
                
                vm.inProgressCandidateDetails = false;
                vm.hasChangeReferral = false;

                vm.writeMail.to   = vm.details.emailid;
                vm.viewResume     = App.base_url + 'viewer?url=' + vm.details.resume_path;
                vm.downloadResume = App.API_DOMAIN + "getResumeDownload?company_id=" + CompanyDetails.company_code + "&doc_id=" + vm.details.document_id;
                
                getDropdownList();    

            });

        }

        function getCandidateDetails() {


            if(apiKeyType == 'ref') {
                apiKeyCandidateDetails = { candidate_id : candidateId };
            } 
            else if(apiKeyType == 'cdt') {
                apiKeyCandidateDetails = { reference_id : candidateId };
            } 

            var candidateDetails = $http({
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method  : 'POST',
                url     : App.base_url + 'get_candidate_details',
                data    : $.param(apiKeyCandidateDetails)
            });

            var candidateActivities = $http({
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method  : 'POST',
                url     : App.base_url + 'get_candidate_activities',
                data    : $.param(apiKeyCandidateDetails)
            });

            var candidateComments = $http({
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method  : 'POST',
                url     : App.base_url + 'get_candidate_comments',
                data    : $.param(apiKeyCandidateDetails)
            });

            var candidateSentMails = $http({
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method  : 'POST',
                url     : App.base_url + 'get_candidate_sent_emails',
                data    : $.param(apiKeyCandidateDetails)
            });

            return $q.all([candidateDetails, candidateActivities, candidateComments, candidateSentMails]).then(function (data) {
                
                vm.details                 =  angular.copy(data[0].data.data);
                vm.candidateActivitiesList =  angular.copy(data[1].data.data);
                if(!data[1].data.data.length) {
                    vm.responseMsgActivities = data[1].data.message.msg[0];
                }
                vm.candidateCommentsList   =  angular.copy(data[2].data.data);
                vm.candidateSendMailsList  =  angular.copy(data[3].data.data);

            }, function() {
                $window.location = App.base_url + 'logout';
            });

        }

        function getDropdownList() {

            $http({
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method  : 'GET',
                url     : App.base_url + 'public/js/controllers/time-zone.json',
            })
            .then(function (response) {
                if (response.status == 200) {
                    vm.timeZone  = response.data;
                }
                else if (response.data.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }

            });

            $http({
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method  : 'POST',
                url     : App.base_url + 'get_candidate_email_templates',
                data    : $.param({ reference_id : candidateId, candidate_id : vm.details.candidate_id })
            }).then(function (response) {
                if (response.status == 200) {
                    vm.writeMailSubjectList = angular.copy(response.data.data);
                }
                else if (response.data.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }
            });

            $http({
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method  : 'POST',
                url     : App.base_url + 'get_candidate_referral_list',
                data    : $.param({ reference_id : candidateId})
            }).then(function (response) {
                if (response.status == 200) {
                    vm.referralsList = angular.copy(response.data.data);
                }
                else if (response.data.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }
            });


            $http({
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method  : 'POST',
                url     : App.base_url + 'get_candidate_schedules',
                data    : $.param({ reference_id : candidateId, candidate_id : vm.details.candidate_id })
            }).then(function (response) {
                if (response.status == 200) {
                    vm.candidateSchedulesList = angular.copy(response.data.data);
                }
                else if (response.data.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }
            });

        }

        function postAddTags(selectedTag) {

            var successInfo = '<md-toast class="mm-toast"><div class="md-toast-text" flex><i class="material-icons">done</i><div class="text"><div class="toast-succ">Success!</div><div class="succ-text">Tag added successfully</div></div></div></md-toast>',
                apiKeys = $.param({
                    reference_id : candidateId, 
                    candidate_id : vm.details.candidate_id,
                    tag_id       : selectedTag.tag_id,
                    tag_name     : selectedTag.tag_name
                });

            $http({
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method  : 'POST',
                url     : App.base_url + 'add_candidate_tags',
                data    : apiKeys
            })
            .then(function (response) {

                if (response.data.status_code == 200) {
                    vm.details.candidate_tags.push(response.data.data); 
                    $mdToast.show({
                       hideDelay: 3000,
                       position: 'top right',
                       template: successInfo
                    });
                }
                else if (response.data.status_code == 400) {
                   $window.location = App.base_url + 'logout';
                }

            });

        }


        setTimeout(function() {

            $('#interview_date').datetimepicker({
                minDate : new Date(),
                ignoreReadonly: true,
                format     : 'dddd, DD MMM YYYY',
                sideBySide : true,
                useCurrent :true
            });

            $('#time_from').datetimepicker({
                ignoreReadonly: true,
                format     : 'hh:mm A',
                sideBySide : true,
                useCurrent :true
            });

            $('#time_to').datetimepicker({
                ignoreReadonly: true,
                format     : 'hh:mm A',
                sideBySide : true,
                useCurrent :false
            });

            $('#search').on('keydown', function(ev) {
                if(ev.which != 40 && ev.which != 38){
                    ev.stopPropagation();   
                }
            });

        });


        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if(referralStatusDialog)
                referralStatusDialog.close();
        })

        
        init();




    }



}());
