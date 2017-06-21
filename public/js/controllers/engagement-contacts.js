(function () {
"use strict";

    angular
        .module('app.engagement.contacts', ['ui.grid', 'ui.grid.selection'])
        .controller('EngagementContactsController', EngagementContactsController)
        .controller('ReferralStatus', ReferralStatus)

        // ajax in factory method
        .factory('ajaxService', ajaxService)
        .service('tabsName', tabsName);

        EngagementContactsController.$inject = ['$window', 'uiGridConstants', '$http', '$q', 'jobDetails', '$uibModal',
                                                    'tabsName', 'ajaxData', 'ajaxService', 'UserDetails', 'CompanyDetails', 'App']
        ReferralStatus.$inject = ['$scope', '$window', '$uibModalInstance', 'referralObj', '$http', 'ajaxService', 'App'];
        ajaxService.$inject = ['$http', '$q', 'jobDetails', 'App'];

    function ajaxService($http, $q, jobDetails, App){
        var canceller;
        var ajaxService = {
            async: function(obj,status, state) {

                if(canceller){
                    canceller.resolve();
                }

                canceller = $q.defer();

                var pramas = $.param({
                    from_user : obj.from_user,
                    referred_by : obj.referred_by,
                    relation_count : obj.relation_count,
                    post_id : state == 0 ? jobDetails.id : obj.post_id,
                    status : status,
                    referred_by_phone : obj.referred_by_phone || 0
                });

                var processJob = $http({
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    method : 'POST',
                    data : pramas,
                    url : App.base_url+'process_job',
                    timeout : canceller.promise
                })

                return processJob;
            }
        }
        return ajaxService;

    }

    // For Navigation
    function tabsName(){
        var tab_name = '';
    }

    function EngagementContactsController($window, uiGridConstants, $http, $q, jobDetails, $uibModal, tabsName, ajaxData, ajaxService, UserDetails, CompanyDetails, App){

    	$window.scrollTo(0,0);

        var vm = this, canceller;

        vm.subHeaderCount = ajaxData.getData();

        // tab cond based on navigation
        if(tabsName.tab_name == ''){
            vm.tabCond = 'ALL';
        }
        else{
            vm.tabCond = tabsName.tab_name;
        }
        

    	vm.post_id = jobDetails.id;
    	vm.job_title = jobDetails.job_title;

        vm.accepetdList = ['ACCEPTED', 'INTERVIEWED', 'OFFERED', 'HIRED']

        vm.downloadResume = downloadResume;
        vm.statusUpdate = statusUpdate;
        vm.changeStatus = changeStatus;
        vm.colorPicker = colorPicker;
        vm.pointerEvents = pointerEvents;


        vm.gridOptions = {
            rowHeight:80,
            enableSorting:false,
            enableColumnMenus:false,
            enableRowSelection: false,
            enableRowHeaderSelection: false,
            multiSelect: false,
            modifierKeysToMultiSelect: false,
            noUnselect: true, // need to look after
            data: 'data',
            appScopeProvider : vm // bindin scope to grid
        }

        vm.gridOptions.columnDefs = [
            { field: 'name', displayName:'CANDIDATE', cellTemplate: 'candidate-template.phtml', width: '20%', headerTooltip: 'CANDIDATE' },
            { field: 'referred_by_name', displayName:'REFERRER', cellTemplate: 'referrer-template.phtml', width: '20%', headerTooltip: 'REFERRER' },
            { field: 'created_at', displayName:'REFERRED ON', width: '15%', headerTooltip: 'REFERRED ON',
                cellTemplate: 'time.phtml' }
        ]

        vm.gridOptions.onRegisterApi = function(gridApi){
            vm.gridApi = gridApi;
        }

        vm.data = [];
        vm.gridOptions.data = vm.data;

        // resume url
        function downloadResume(row, path){
            return path ? (App.API_DOMAIN + "getResumeDownload?company_id=" + CompanyDetails.company_code + "&doc_id=" + row.entity.document_id) : row.entity.resume_path;
        }

        // Accept and Decline status change
        function statusUpdate(rowRenderIndex, row, flag){
            flag = flag == 1 ? 'ACCEPTED' : 'DECLINED';
            if(flag == 'DECLINED'){
                $uibModal.open({
                    animation: false,
                    backdrop: 'static',
                    keyboard: false,
                    templateUrl: 'templates/dialogs/referral_status.phtml',
                    openedClass: "referral-status",
                    resolve: {
                        referralObj: function() {
                            var referralObj = row.entity;
                            referralObj.tabName = vm.tabCond == 'ALL' ? '' : vm.tabCond;
                            referralObj.ajaxFunCall = gridCall;
                            referralObj.stateFlag = 0;
                            return referralObj;
                        }
                    },
                    controller: 'ReferralStatus',
                    controllerAs: "refStatus"
                });
                return;
            }
            vm.loader = true;
            var ajax = ajaxService.async(row.entity, flag, 0);
            ajax.success(function(response){
                if(response.status_code == 200){
                    ajaxData.addProperty('pending_count', ajaxData.getData().pending_count - 1);
                    if(flag == 'ACCEPTED'){
                        if(ajaxData.getData().accepted_count == 0){
                            ajaxData.addProperty('accepted_count', 1);
                        }
                        else{
                            ajaxData.addProperty('accepted_count', ajaxData.getData().accepted_count + 1);
                        }
                    }
                    if(vm.tabCond == 'PENDING'){
                        vm.gridOptions.data.splice(rowRenderIndex, 1);
                        if(vm.gridOptions.data.length == 0){
                            vm.noReferrals = true;
                        }
                    }
                    else{
                        vm.gridOptions.data[rowRenderIndex].status = response.data.one_way_status;
                    }
                    vm.loader = false;
                }
                else if(response.status_code == 400){
                    $window.location = App.base_url+'logout';
                }
                
            })
        }

        // In Accepeted Tab status change
        function changeStatus(rowRenderIndex, obj, status){
            vm.loader = true;
            var statusData = $.param({
                from_user : obj.from_user,
                referred_by : obj.referred_by,
                post_id : jobDetails.id,
                awaiting_action_status : status,
                relation_count : obj.relation_count,
                referred_by_phone : obj.referred_by_phone
            })

            $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method : 'POST',
                data : statusData,
                url : App.base_url+'awaiting_action',
                timeout : canceller.promise
            })
            .then(function(response){
                if(response.data.status_code == 200){
                    ajaxData.addProperty('hired_count',response.data.data.hired_count);
                    vm.gridOptions.data[rowRenderIndex].awaiting_action_by = response.data.data.awaiting_action_by;
                    vm.gridOptions.data[rowRenderIndex].awaiting_action_status = response.data.data.awaiting_action_status;
                    vm.gridOptions.data[rowRenderIndex].awaiting_action_updated_at = response.data.data.awaiting_action_updated_at;
                    vm.pointerEvents(response.data.data.awaiting_action_status)
                }
                else if(response.data.status_code == 400){
                    $window.location = App.base_url+'logout';
                }
                vm.loader = false;
            })
        }

        // color picker
        vm.colorCode = ["#21A4AC", "#EE8F3B", "#2A99E0", "#154c50", "#103954", "#342158", "#5B5B29", "#004D40", "#229A77", "#6f2b25"];    
        function colorPicker(rowRenderIndex, colRenderIndex) {
            if(colRenderIndex == 0){
                return vm.colorCode[String(rowRenderIndex).slice(-1)];
            }
            else{
                return vm.colorCode[String(rowRenderIndex + 5).slice(-1)];
            }
        }

        //  restricting pointer events for status
        var ACCEPTED = ['INTERVIEWED'],INTERVIEWED = ['OFFERED'], OFFERED = ['HIRED'];
        function pointerEvents(colValue){
            if(colValue != 'HIRED')
                return eval(colValue)[0];
        }


        // getting data
        function gridCall(status){

            vm.gridOptions.data = [];
            vm.noReferrals = false;
            vm.loader = true;

            if(canceller){
                canceller.resolve();
            }

            canceller = $q.defer();

            // grid options dynamically
            if(vm.tabCond == 'ACCEPTED'){
                vm.gridOptions.columnDefs.splice(3);
                vm.gridOptions.columnDefs.push({ field : 'awaiting_action_status', displayName:'STATUS',cellTemplate: 'accept-status.phtml', width: '45%', headerTooltip: 'STATUS' })
            }
            else{
                vm.gridOptions.columnDefs.splice(3);
                vm.gridOptions.columnDefs.push({ field: 'resume_original_name', displayName:'RESUME', cellTemplate: 'resumes-template.phtml', width: '15%', headerTooltip: 'RESUME' })
                vm.gridOptions.columnDefs.push({ field : 'status', displayName:'STATUS', cellTemplate: 'status-change.phtml', width: '15%', headerTooltip: 'STATUS' })
                vm.gridOptions.columnDefs.push({ field : 'confidence_score', displayName: 'CONFIDENCE SCORE', width: '15%', headerTooltip: 'CONFIDENCE SCORE',
                    cellTemplate: '<div class="progress"> <div class="progress-bar progress-bar-info progress-bar-striped" style="width:{{COL_FIELD}}%">{{COL_FIELD}}%</div> </div>'})
            }

            var referrals = $.param({
                post_id : jobDetails.id,
                status : status
            });

            $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method : 'POST',
                data : referrals,
                url : App.base_url+'job_referral_details',
                timeout : canceller.promise
            })
            .then(function(response){
                vm.loader = false;
                if(response.data.status_code == 200){
                    if(response.data.data.length == 0){
                        vm.noReferrals = true;
                        if(status == 'PENDING'){
                            ajaxData.addProperty('pending_count','0');
                        }
                    }
                    else{
                        vm.noReferrals = false;
                        var data = response.data.data.countDetails;
                        for(var i in data){
                            ajaxData.addProperty(i,data[i]);
                        }
                        vm.gridOptions.data = response.data.data.referrals;
                    }
                }
                else if(response.data.status_code == 400){
                    $window.location = App.base_url+'logout';
                }
            })
            
        }

        gridCall(tabsName.tab_name)


        vm.referralsCond = function(status){
            vm.tabCond = status;
            if(status == 'ALL'){
                gridCall('')
            }
            else{
                gridCall(status);
            }
        }
        

    }

    function ReferralStatus($scope, $window, $uibModalInstance, referralObj, $http, ajaxService, App){

    	var scope = this;

    	scope.accept = false;
    	scope.decline = false;

        scope.success_loader = false;

        this.referralStatus = function(status){

            scope.success_loader = true;


            $('.referral-status .modal-dialog').css({
                'pointerEvents' : 'none'
            })

            /* From Factory Service Dynamically */
            var processJob = ajaxService.async(referralObj,status, referralObj.stateFlag);
            processJob.success(function(response){
                $('.referral-status .modal-dialog').css({
                    'pointerEvents' : 'auto'
                });
                scope.success_loader = false;
                if(response.status_code == 200){
                    referralObj.ajaxFunCall(referralObj.tabName);
                    $uibModalInstance.dismiss('cancel');
                }
                else if(response.status_code == 400){
                    $window.location = App.base_url+'logout';
                }
            })
            processJob.error(function(response){
                scope.success_loader = false;
                $('.referral-status .modal-dialog').css({
                    'pointerEvents' : 'auto'
                })
            })

        }

        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

            $uibModalInstance.dismiss('cancel');

        })
    }




}());