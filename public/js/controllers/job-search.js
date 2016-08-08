(function () {
"use strict";

angular.module('app.job.search', ['infinite-scroll'])

.filter('myDate', function() {
   return function(x) {
       var date = x.split(" ")[0].split("-");
       var month = Number(date[1])-1;
       var d = new Date(date[0],month ,date[2]);
       return d;
   };
})

.controller('JobSearchController', ["$window", "gettingData", "$http", "$state", "$rootScope", "$q", "jobDetails", "ajaxData", "CONFIG", function($window,gettingData, $http, $state, $rootScope, $q, jobDetails, ajaxData, CONFIG){
	
    $window.scrollTo(0,0);

    var scope = this;

    ajaxData.setData({});
    ajaxData.bol = false;

    scope.pay_status = "2";

    this.search_load_cond = false;
    this.initLoader = true;
    var canceller;
    var page_no = 1,total_pages = 1,data = [],initial = 0;

    function postList(status,input){

        if(canceller){
            canceller.resolve();
        }

        canceller = $q.defer();

        var job_list_param = $.param({
            request_type : status,
            search_for : input,
            page_no : page_no
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
            scope.initLoader = false;
            if(response.status_code == 200){
                if(response.data.length == 0){

                    if(initial == 0){
                        scope.init_no_posts_found = true;
                    }
                    else{
                        scope.init_no_posts_found = false;
                        scope.no_posts_found = true;   
                    }

                    total_pages = 0;
                    scope.busy = false;
                    scope.post_count = 0;
                    scope.jobDetails = response.data.posts;
                }
                else{
                    initial = 1;
                    if(page_no == 1){
                        data = [];
                        total_pages = Math.ceil(response.data.total_count / 10);
                    }
                    
                    for(var i = 0; i < response.data.posts.length; i++){
                        data.push(response.data.posts[i]);
                    }

                    scope.init_no_posts_found = false;
                    scope.no_posts_found = false;
                    scope.jobDetails = data;
                    page_no++;
                    scope.post_count = response.data.total_count;
                    scope.busy = false;
                }
            }
            if(response.status_code == 400){
                $window.location = CONFIG.APP_DOMAIN+'login';
            }
        })
        postJobList.error(function(response){
            console.log(response);
        })
    }

    scope.selectFilter = function(status,input){
        page_no = 1;
        postList(status,input);
    }

    var time;
    scope.searchFilter = function(status,input){
        if(time != null){
            clearInterval(time);
        }
        scope.search_load_cond = true;
        page_no = 1;
        time = setTimeout(function(){
            postList(status,input);
        },500);
    }

    scope.nextPage = function(status,input){
        if(total_pages >= page_no && total_pages != 0){
            if(scope.busy){
                return;
            }

            scope.busy = true;

            postList(status,input);
        }
    }

    gettingData.bol = false;
    gettingData.setData({});

    scope.job_details = function(job){
        jobDetails.id = job.id;
        jobDetails.job_title = job.job_title;
  	    $state.go('^.jobDetails',{"post_id":job.id});
    }

}]);






}());