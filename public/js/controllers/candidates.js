(function () {
    "use strict";

    angular
            .module('app.candidates', ['ui.grid', 'ui.grid.selection', 'rzModule'])
            .controller('CandidateController', CandidateController)
            .controller('ResumeRoomController', ResumeRoomController)
            .controller('UploadResumeController', UploadResumeController)
            .controller('FindResumeController', FindResumeController)
            .directive('circliful', circliful)

    CandidateController.$inject = [];
    ResumeRoomController.$inject = ['$state', '$window', '$uibModal', '$http', '$q', '$timeout', 'ajaxService', 'App'];
    UploadResumeController.$inject = ['$scope', '$http', '$timeout', '$window', 'App'];
    FindResumeController.$inject = ['$scope', '$http', '$q', '$timeout', '$window', 'App'];


    function CandidateController() {

    }


    function ResumeRoomController($state, $window, $uibModal, $http, $q, $timeout, ajaxService, App) {

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
            placeholder: 'Search By Job or Status',
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
            enableRowHeaderSelection: true,
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

        function downloadResume(row) {
            return row.entity.resume_path;
        }

    }


    function UploadResumeController($scope, $http, $timeout, $window,  App) {
        
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
                enableDragDrop : true,
                multiple: true,
                uploadButtonText: id == 'upload' ? "Choose file" : 'Change',
                size: (10 * 1024 * 1024),
                allowedExtensions: ['csv', 'pdf', 'doc', 'docx', 'cer'],
                action: App.base_url + "file_upload",
                showFileInfo: false,
                shortMessages: true,
                remove: true,
                file_name: 'certificate_org_name',
                path_name: 'certificate_path',
                onSubmit: function (id, name, size) {
                    vm.filesInQueue.push({tempId:id, fileName : name, value : 0, fileSize : Math.round(size / 1024) + 'KB', status : 0});
                    $scope.$apply();

                },
                onComplete: function (id, name, response) {
                    if(response.success){
                        angular.forEach(vm.filesInQueue, function(file, fileIndex){
                            if(file.tempId == id){
                                vm.filesInQueue[fileIndex].status = 1;
                            }
                        })
                        $scope.$apply();
                        uploadResume(id, response);
                    }
                },
                onProgress: function (id, fileName, loaded, total) {
                    vm.filesInQueue[id].value = Math.round((loaded / total) * 100);
                    vm.filesInQueue[id].remaining = Math.round(loaded / 1024) + 'KB';
                    $scope.$apply();
                },
                onCancel : function(id, fileName){
                    if(fileName){
                        angular.forEach(vm.filesInQueue, function(file, fileIndex){
                            if(file.tempId == id){
                                vm.filesInQueue[fileIndex].cancel = 1;
                            }
                        })
                    }

                },
                showMessage: function (msg, obj) {
                    
                },
                onRemove: function () {
                    console.log(arguments)
                },
                onRemoveComplete: function () {
                }
            }, function(para){
                vm.fileHandler = para;
            })
        }

        upload('upload');

        this.deleteAllFiles = function(){
            angular.forEach(vm.filesInQueue, function(file, fileIndex){
                if(file.cancel){
                    vm.filesInQueue[fileIndex].status = 0;
                }
            })
        }

        this.discardFile = function(){
            angular.forEach(vm.filesInQueue, function(file){
                if(file.status){
                    vm.fileHandler.cancel(file.tempId)
                }   
            })
        }

        function uploadResume(id, response){
            $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: 'upload_resume',
                data: $.param({resume_name : response.org_name, resume : response.filename})
            })
            .then(function (response) {
                vm.filesInQueue[id].status = 2;
            });
        }
    }


    function FindResumeController($scope, $http, $q, $timeout, $window,  App) {

        var vm = this,
            prevDescription,
            prevWeightages,
            cancelerAI,
            cancelerSearchResume,
            busy = true,
            paginationOptions = {
                pageNumber: 1,
                pageSize: 25,
                scoreRange : null
            },
            slider =  {
                value: null,
                options: {
                    floor:0,
                    ceil:4,
                    showSelectionBar: true,
                    onChange: function(id) {
                        vm.searchResume();
                    }
                }
            };

        this.selectedResues = [];
        this.inProgressSearchResumes = false;
        this.hideSearchResume = false;
        this.hideResumesList = false;
        this.sliderRole = angular.copy(slider);
        this.sliderLoc = angular.copy(slider);
        this.sliderExp = angular.copy(slider);
        this.sliderSkills = angular.copy(slider); 
        this.filterOptions = ['75% to 100%', '50% to 70%', '0% to 50%'];

        this.description = "Software engineer in Bangalore with 2 years of experience who knows jquery, html, css and angularjs";
        this.critera = {};
        this.weightages = {
            role : 0,    
            location : 0,
            exp : 0, 
            skills : 0 
        }

        this.aiTrigger = function() {

            if(prevDescription == this.description){
                return;
            }

            var params = {};
                params.jd = this.description;
                params.weights = this.weightages;

            if (cancelerSearchResume) {
                cancelerAI.resolve();
            }

            cancelerAI = $q.defer();

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
                prevDescription = vm.description;
                prevWeightages = vm.critera;
                if (response.status == 200) {
                    vm.criteria = response.data;
                    vm.criteria.skills = response.data.skills.toString().split(",").join(", ")
                    busy = false;
                }
                else if (response.data.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }
            });
        }

        this.searchResume = function() {
            
            if(JSON.stringify(prevWeightages) === JSON.stringify(vm.weightages)){
                return;
            }

            var params = {};
                params.jd = this.description;
                params.weights = this.weightages;
                params.tenant_id = 'tenant1';

            if (cancelerSearchResume) {
                cancelerSearchResume.resolve();
            }

            cancelerSearchResume = $q.defer();

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
                prevWeightages = angular.copy(vm.weightages);
                if (response.status == 200) {
                    vm.matchedResume = response.data.resumes;
                }
                else if (response.data.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }
            });
        }

        this.loadResumes = function(){
            if(busy){
                return;
            }
            this.searchResume();
        }


        this.selectResume = function(resumeIndex){
            var position = this.selectedResues.indexOf(resumeIndex);
            if(position < 0 ){
                vm.selectedResues.push(resumeIndex);
            }else{
                vm.selectedResues.splice(position, 1);
            }
        }

        this.toogleSearchResume = function(){
            $("#ai-view").slideToggle('slow');
            this.hideSearchResume = !this.hideSearchResume;
        }

        this.toogleResumesList = function(){
            $("#hide-resumes").slideToggle('slow');
            this.hideResumesList = !this.hideResumesList;
        }
        

        $timeout(function () {
            $scope.$broadcast('reCalcViewDimensions');
        }, 100);
    }






    function circliful(){
         return{
            restrict: 'AE',
            link: function (scope, element, attr) {
                var color,
                    score = Number(scope.$eval(attr.score));
                if(score >= 90){
                    color = '#2daf8b';
                }else{
                    color = score >= 70 ? '#16aefa' : '#f98015';
                }
                $(element).circliful({
                    foregroundColor: color,
                    percent: score,
                    foregroundBorderWidth: 9,
                    backgroundBorderWidth: 9,
                    backgroundColor: '#d4dfe5',
                    icon: '',
                    iconSize: 30
                });
            }
        }
    }



}());