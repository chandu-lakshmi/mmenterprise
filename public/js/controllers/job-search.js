(function () {
"use strict";

angular.module('app.job.search', ['app.post.job'])

.filter('myDate', function() {
   return function(x) {
       var date = x.split(" ")[0].split("-");
       var month = Number(date[1])-1;
       var d = new Date(date[0],month ,date[2]);
       return d;
   };
})

.controller('JobSearchController', ["gettingData","$http", "$state", "$rootScope", "$q", "jobDetails", "CONFIG", function(gettingData, $http, $state, $rootScope, $q, jobDetails, CONFIG){
	var scope = this;

    scope.pay_status = "2";

    this.search_load_cond = false;
    this.jobLoader = true;
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
            scope.search_load_cond = false;
            scope.jobLoader = false;
            if(response.data.length == 0){
                scope.no_posts_found = true;
                scope.post_count = 0;
                scope.jobDetails = response.data.posts;
            }
            else{
                scope.no_posts_found = false;
                scope.jobDetails = response.data.posts;
                scope.post_count = response.data.jobs_count;
            }
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
    var time;
    scope.searchFilter = function(status,input){
        if(time != null){
            clearInterval(time);
        }
        scope.search_load_cond = true;
        time = setTimeout(function(){
            //canceller.resolve("user cancelled");
            postList(status,input)
        },500);
    }

    /*scope.nextPage = function(status,input){
        alert();
        if(scope.busy){
            return;
        }
        postList(status,input);
    }*/

    gettingData.bol = false;
    gettingData.setData({});

    scope.job_details = function(job){
        jobDetails.id = job.id;
        jobDetails.job_title = job.job_title;
  	    $state.go('^.jobDetails',{"post_id":job.id});
    }

}]);






}());