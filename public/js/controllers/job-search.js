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

.controller('JobSearchController', ["$window", "gettingData", "$http", "$state", "$rootScope", "$q", "jobDetails", "ajaxData", "tabsName", "CONFIG", function($window,gettingData, $http, $state, $rootScope, $q, jobDetails, ajaxData, tabsName, CONFIG){
	
    $window.scrollTo(0,0);

    var scope = this;

    ajaxData.setData({});
    ajaxData.bol = false;

    scope.pay_status = "2";
    scope.jobFilter = "0";

    this.search_load_cond = false;
    scope.post_count = 0;
    var canceller;
    var page_no = 1,total_pages = 1,data = [],initial = 0;

    function postList(filter1, filter2, input){

        if(canceller){
            canceller.resolve();
        }

        canceller = $q.defer();

        var job_list_param = $.param({
            request_type : filter1,
            post_by:filter2,
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
            scope.overLoader = false;
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
            else if(response.status_code == 400){
                $window.location = CONFIG.APP_DOMAIN+'logout';
            }
        })
        postJobList.error(function(response){
            console.log(response);
        })
    }

    scope.selectFilter = function(filter1, filter2, input){

        scope.init_no_posts_found = false;
        scope.no_posts_found = false;

        scope.overLoader = true;
        
        //scope.post_count = 0;
        //scope.jobDetails = [];
        //scope.busy = true;

        page_no = 1;
        postList(filter1, filter2, input);
    }

    var time;
    scope.overLoader = false;
    var inputPrev = "";
    scope.searchFilter = function(filter1, filter2, input, event){
        
        //first char space restrict
        input = input || '';
        if(event.keyCode === 32 && input.length === 0 || inputPrev == input){
            return false;
        }
        inputPrev = input;

        scope.init_no_posts_found = false;
        scope.no_posts_found = false;

        scope.overLoader = true;

        //scope.post_count = 0;
        //scope.jobDetails = [];
        //scope.busy = true;

        if(time != null){
            clearInterval(time);
        }
        scope.search_load_cond = true;
        page_no = 1;
        time = setTimeout(function(){
            postList(filter1, filter2, input);
        },500);
    }

    scope.nextPage = function(filter1, filter2, input){
        if(total_pages >= page_no && total_pages != 0){
            if(scope.busy){
                return;
            }

            scope.busy = true;

            postList(filter1, filter2, input);
        }
    }

    gettingData.bol = false;
    gettingData.setData({});

    scope.job_details = function(job){
        jobDetails.id = job.id;
        jobDetails.job_title = job.job_title;
  	    $state.go('^.jobDetails',{"post_id":job.id});
    }

    scope.jumpPage = function(obj,tabCond){
        ajaxData.setData(obj);
        jobDetails.id = obj.id;
        jobDetails.job_title = obj.job_title;

        tabsName.tab_name = tabCond;
        $state.go('^.engagement/contacts',{'post_id':obj.id});
    }

    scope.jobType = [
        { name : 'All',  id : 2 },
        { name : 'Paid',  id : 0 },
        { name : 'Free',  id : 1 },
    ];

    scope.filterBy = [
        { id:0 , label : 'All' },
        { id:1 , label : 'My Jobs' }
    ];

    scope.getRewardsView = function(rewards) {
        if(rewards.rewards_type == 'paid'){
           return  (rewards.currency_type == 1 ? '$' : '₹') +  rewards.rewards_value + '/' + rewards.rewards_name;
        }
        else if(rewards.rewards_type == 'points'){
            return  rewards.rewards_value + ' Points' + '/' + rewards.rewards_name;  
        }
        else{
            return '';
        }
    }

}]);


}());