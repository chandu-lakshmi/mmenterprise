
(function () {
    "use strict";

    angular
            .module('app.license.management', [])

            .controller('licenseManagementController', licenseManagementController);

    licenseManagementController.$inject = ['$mdDialog', '$state', '$http', 'App'];

    function licenseManagementController($mdDialog, $state, $http, App) {

        var vm = this;

        vm.spinner = true;
        vm.bckerr = false;

        $http({
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            method: 'POST',
            url: App.base_url + 'get_company_subscriptions'
        })
                .then(function (response) {
                    vm.spinner = false;
                    vm.bckerr = false;
                    vm.headerList = response.data.data.active_plan;
                    nextPlan(vm.headerList.plan_type)
                    vm.licenseList = response.data.data.licence_log;
                }, function () {
                    vm.bckerr = true;
                });

        vm.addContacts = addContacts;
        
        var next = '';
        function nextPlan(cur){
            if(cur == 'standard')
                next = 'Professional'
            else
                next = 'Enterprise'
        }
        
        function addContacts(ev) {
            if (vm.headerList.available_count !== 0) {
                $state.go('^.contact');
                return;
            }
            var parentEl = angular.element(document.querySelector('.licence-management'));
            $mdDialog.show({
                parent: parentEl,
                targetEvent: ev,
                template:
                        '<md-dialog aria-label="max reach">' +
                        '  <md-dialog-content class="md-dialog-content">' +
                        '       <h2 class="md-title"></h2>' +
                        '       <div class="md-dialog-content-body">' +
                        '		<p>This is above the ' + vm.headerList.plan_type + ' plan. Please upgrade to the ' + next + ' Plan. Contact <mark><u>Sales@mintmesh.com</u></mark> or your local sales representative to upgrade.</p>' +
                        '       </div>' +
                        '  </md-dialog-content>' +
                        '  <md-dialog-actions>' +
                        '    <md-button ng-click="delete()" class="mm-btn">' +
                        '      Okay' +
                        '    </md-button>' +
                        '  </md-dialog-actions>' +
                        '</md-dialog>',
                controller: closeController
            });

            function closeController($scope) {
                $scope.delete = function () {
                    $mdDialog.hide();
                };
            }
        }
    }


}());