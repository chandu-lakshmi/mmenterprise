(function () {
"use strict";

angular.module('app.job.search', ['app.post.job'])

.filter('myDate', function() {
   return function(x) {
       var date = x.split(" ")[0].split("-");
       var d = new Date(date[0],date[1],date[2]);
       return d;
   };
})

// Reddit constructor function to encapsulate HTTP and pagination logic
/*.factory('Reddit', function($http) {
    var Reddit = function() {
        this.items = [];
        this.busy = false;
        this.after = '';
    };*/

.controller('JobSearchController', ["gettingData","$http", "$state", "$rootScope", "$q", "CONFIG", function(gettingData, $http, $state, $rootScope, $q, CONFIG){
	var scope = this;

    scope.pay_status = "2";

    var canceller;

    function postList(status,input){

        if(canceller){
            canceller.resolve();
        }

        canceller = $q.defer();

        var job_list_param = $.param({
            request_type : status,
            search_for : input
        });

        var postJobList = $http({
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            method : 'POST',
            data : job_list_param,
            url : CONFIG.APP_DOMAIN+'jobs_list',
            timeout : canceller.promise
        })

        postJobList.success(function(response){
            scope.jobDetails = response.data.posts;
            scope.post_count = response.data.jobs_count;
        })
        postJobList.error(function(response){
            console.log(response);
        })
    }

    postList(scope.pay_status,'');

    scope.selectFilter = function(status,input){
        //canceller.resolve("user cancelled");
        postList(status,input);
    }
    scope.searchFilter = function(status,input){
        setTimeout(function(){
            //canceller.resolve("user cancelled");
            postList(status,input)
        },1000);
    }

    gettingData.bol = false;

    scope.job_details = function(param){
  	    $state.go('^.jobDetails',{"post_id":param});
    }

}]);






}());