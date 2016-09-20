angular.module('app.services', ['ui.bootstrap'])

.service('growlService', ['$modal', function($modal){
    var self = this,
        modal_instance;
       
    this.opts = {
        title: App.lang.dashboard.single,
        message: App.lang.format(App.lang.settings.updateProgress, App.lang.data.single),
        progress: false,
        success: false,
        error: false
    };
    
    this.reset = function(){
        self.opts.progress = false;
        self.opts.success = false;
        self.opts.error = false;
    };
        
    this.open = function(opts){
        self.reset();
        self.update(opts);

        if(!modal_instance){
            modal_instance = $modal.open({
                backdrop: false,
                templateUrl: 'public/templates/components/growl.html',
                windowClass: 'growl',
                controller: ['$scope', '$timeout', '$modalInstance', function($scope, $timeout, $modalInstance){
                    var timer;
                    $scope.opts = self.opts;
                    
                    if (!$scope.opts.static) {
                        $scope.$watch('opts', function(){
                            if(timer) $timeout.cancel(timer);
                            timer = $timeout(function(){
                                $modalInstance.dismiss('cancel');
                            }, 5000);
                        }, true);
                    }
                }]
            });
            
            modal_instance.result.then(function(){
            }, function(){
                modal_instance = null;
            }, function(){
            });
        }
    };
    
    this.update = function(opts){
        angular.extend(self.opts, opts);
    };
    
    this.close = function () {       
        modal_instance.dismiss('cancel');
    };
    
}])

.service('AdtypeService', ['$rootScope', '$http', function($rootScope, $http){
        
    var promise,
        list = [],
        listById = {};

    this.getAdtypes = function () {
        if(!promise){
            promise = $http.post($rootScope.App.base_url + 'getAdTypes').then(function (response) {
                            angular.forEach(response.data, function (val) {
                                list.push(val);
                                listById[val.id] = val;
                            });
                            return list;
                        });
        }
        
        return promise;
    };
    
    this.getAdtypesById = function () {
        return listById;
    };
    
    this.clearAdtypes = function () {
        promise = null;
        list = [];
        listById = {};
    };
    
}]);