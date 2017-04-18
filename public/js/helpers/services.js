(function () {
    "use strict";
    angular

            .module('app.services', ['app.constants'])
            .service('pendingRequests', pendingRequests)
            .service('httpService', httpService)

    pendingRequests.$inject = [];
    httpService.$inject = ['$http', '$q', 'pendingRequests', 'App'];

    function pendingRequests() {
        var pending = [];

        this.get = function () {
            return pending;
        };

        this.add = function (request) {
            pending.push(request);
        };

        this.remove = function (request) {
            pending = _.filter(pending, function (p) {
                return p.url !== request;
            });
        };

        this.cancelAll = function () {
            angular.forEach(pending, function (p) {
                p.canceller.resolve();
            });
            pending.length = 0;
        };
    }

    function httpService($http, $q, pendingRequests, App) {
        var singlecanceller;
        this.apiCall = function (method, url, data, cancel) {
            var canceller = $q.defer();
            pendingRequests.add({
                url: url,
                canceller: canceller
            });
            
            // single call canceler
            if(cancel){
                if(singlecanceller)
                    singlecanceller.resolve();
                singlecanceller = $q.defer();
            }
            //Request gets cancelled if the timeout-promise is resolved
            var getApiCall = $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: method,
                url: App.base_url + url,
                data: data || '',
                timeout: cancel ? singlecanceller.promise : canceller.promise
            })
            //Once a request has failed or succeeded, remove it from the pending list
            getApiCall.finally(function () {
                pendingRequests.remove(url);
            });
            return getApiCall;
        }

    }



}());


