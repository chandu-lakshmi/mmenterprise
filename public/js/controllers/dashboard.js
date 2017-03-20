(function () {
    "use strict";

    angular
            .module('app.dashboard', ['ngMaterial', 'ngMessages'])
            .controller('DashboardController', DashboardController)
            .controller('HeaderController', HeaderController)
            .controller('FooterController', FooterController)

            .run(["$templateCache", "$http", function ($templateCache, $http) {
                    $http.get('templates/header.phtml', {cache: $templateCache});
                    $http.get('templates/footer.phtml', {cache: $templateCache});
                }
            ]);

    DashboardController.$inject = ['$window', '$http', 'UserDetails', '$q', '$timeout', 'CompanyDetails', 'App'];
    HeaderController.$inject = ['UserDetails', 'CompanyDetails', 'App'];
    FooterController.$inject = [];

    function DashboardController($window, $http, UserDetails, $q, $timeout, CompanyDetails, App) {

        $window.scrollTo(0, 0);

        var vm = this;

        vm.dashboardLoader = false;
        vm.statusNames = ['Referrals', 'Accepted', 'Interviewed', 'Hired'];
        vm.getColor = function (status) {
            var status = status.toLowerCase();
            if (status === 'pending')
                return '#f07914';
            else if (status === 'accepted')
                return '#22a2ee';
            else if (status === 'declined')
                return '#FD4243';
            else
                return '';
        };

        vm.colorCode = ["#21A4AC", "#EE8F3B", "#2A99E0", "#154c50", "#103954", "#342158", "#5B5B29", "#004D40", "#229A77", "#6f2b25"];
        vm.colorCode2 = ["#4337c1", "#55b567", "#caba34", "#9e9e9e", "#110613", "#b54019", "#cdc309", "#607D8B", "#FFB300", "#424242"];
        vm.colorPicker = function (ind, bol) {
            return vm[bol === 1 ? 'colorCode' : 'colorCode2' ][String(ind).slice(-1)];
        };

        vm.getSrc = function (arg) {
            return (arg !== '' || arg === 'null') ? arg : 'public/images/avatar.png';
        };
        
        vm.daysList = [
            {days: 7, label: '7 Days'},
            {days: 30, label: '30 Days'},
            {days: 360, label: '1 Year'}
        ];

        vm.rewardsView = function (rewards) {
            for (var i in rewards) {
                if (rewards[i].rewards_name === 'Referral') {
                    if (rewards[i].rewards_type === 'paid') {
                        return  (rewards[i].currency_type === 1 ? '$' : '₹') + rewards[i].rewards_value + '/' + rewards[i].rewards_name;
                    }
                    else if (rewards.rewards_type === 'points') {
                        return  rewards[i].rewards_value + ' Points' + '/' + rewards[i].rewards_name;
                    }
                    else {
                        return  'Free';
                    }
                }
            }
        };

        vm.username = UserDetails.user_name;

        function circleProgress(contact, job, reward) {
            $('.circlestat').circliful({
                foregroundColor: '#47bac1',
                percent: contact,
                foregroundBorderWidth: 9,
                backgroundBorderWidth: 9,
                backgroundColor: '#d4dfe5',
                icon: 'public/images/contacts_img_small.png',
                iconSize: 30
            });

            $('.circlestat1').circliful({
                foregroundColor: '#16A4FA',
                percent: job,
                foregroundBorderWidth: 9,
                backgroundBorderWidth: 9,
                backgroundColor: '#d4dfe5',
                icon: 'public/images/jobs_img_small.png',
                iconSize: 30
            });

            $('.circlestat2').circliful({
                foregroundColor: '#FA8214',
                percent: reward,
                foregroundBorderWidth: 9,
                backgroundBorderWidth: 9,
                backgroundColor: '#d4dfe5',
                icon: 'public/images/no_rewards.png',
                iconSize: 30
            });
        }

        vm.jobsCount = 0;
        vm.jobsStatusCount = {referral_count: 0, accepted_count: 0, interviewed_count: 0, hired_count: 0};
        setTimeout(function () {
            circleProgress(0, 0, 0);
        }, 0);
        $timeout(function () {
            counts('');
        }, 100);
        $timeout(function () {
            lastProgressBar(vm.daysList[0].days);
        }, 200);
        $timeout(function () {
            lastReferrals(vm.daysList[0].days);
        }, 300);
        $timeout(function () {
            lastHires(vm.daysList[1].days);
        }, 400);
        $timeout(function () {
            topReferrals('');
        }, 500);

        vm.counts = counts;
        vm.lastProgressBar = lastProgressBar;
        vm.lastReferrals = lastReferrals;
        vm.lastHires = lastHires;
        vm.topReferrals = topReferrals;

        /* $http request for initial count */
        function counts(days) {
            updateData(days, 'COUNTS', 'cancellerCount', '', 'jobsStatusCount', 'status_count', 'first', new Date().getTimezoneOffset());
        }

        /* $http request for Progress select box */
        vm.cancellerProgress;
        vm.loaderProgress = false;
        function lastProgressBar(days) {
            vm.loaderProgress = true;
            updateData(days, 'PROGRESS', 'cancellerProgress', 'loaderProgress', 'progressList', 'post_progress', '', new Date().getTimezoneOffset());
        }

        /* $http request for lastReferrals select box */
        vm.cancelleRerrals;
        vm.loaderRerrals = false;
        function lastReferrals(days) {
            vm.noDataRef = false;
            vm.loaderRerrals = true;
            updateData(days, 'REFERRALS', 'cancelleRerrals', 'loaderRerrals', 'referralsList', 'post_referrals', 'noDataRef', new Date().getTimezoneOffset());
        }

        /* $http request for lastHires select box */
        this.cancelleHires;
        this.loaderHires = false;
        function lastHires(days) {
            vm.noDataHire = false;
            vm.loaderHires = true;
            updateData(days, 'HIRED', 'cancelleHires', 'loaderHires', 'hiresList', 'post_hires', 'noDataHire', new Date().getTimezoneOffset());
        }

        /* $http request for top referrals */
        this.loaderTopReferrals = false;
        function topReferrals(days) {
            vm.loaderTopReferrals = true;
            updateData(days, 'TOPREFERRALS', 'cancelleTopReferrals', 'loaderTopReferrals', 'topReferralsList', 'top_referrals', 'top_referrals_empty', new Date().getTimezoneOffset());
        }

        function updateData(days, paraType, varPromise, spinner, typeList, paraResponse, noDataSpinner, timeZone) {

            var params = $.param({
                company_code: CompanyDetails.company_code,
                request_type: paraType,
                filter_limit: days,
                time_zone: timeZone
            });

            if (vm[varPromise]) {
                vm[varPromise].resolve();
            }

            vm[varPromise] = $q.defer();

            var showReports = $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                data: params,
                url: App.base_url + 'view_dashboard',
                timeout: vm[varPromise].promise
            });

            showReports.success(function (response) {
                if (response.status_code === 200) {
                    if (vm[spinner] !== '')
                        vm[spinner] = false;
                    vm[typeList] = response.data[paraResponse];

                    if (vm[typeList].length === 0)
                        vm[noDataSpinner] = true;
                    else
                        vm[noDataSpinner] = false;

                    if (noDataSpinner === "") {
                        $('.circlestat svg:last-child').remove();
                        $('.circlestat1 svg:last-child').remove();
                        $('.circlestat2 svg:last-child').remove();
                        circleProgress(vm[typeList].contacts, vm[typeList].jobs, vm[typeList].rewards);
                    }

                    if (noDataSpinner === 'first')
                        vm.jobsCount = response.data.post_counts;
                }
                else if (response.status_code === 400) {
                    $window.location = App.base_url + 'logout';
                }
            });
        }

    }

    function HeaderController(UserDetails, CompanyDetails, App) {
        this.user_name = UserDetails.user_name;
        this.logo = CompanyDetails.company_logo;

        this.logout = function () {
            window.location.href = App.base_url + 'logout';
        };
    }

    function FooterController() {

    }

}());