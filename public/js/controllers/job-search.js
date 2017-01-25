(function () {
"use strict";

    angular
        .module('app.job.search', ['infinite-scroll'])
        .filter('myDate' , myDate)
        .controller('JobSearchController', JobSearchController)


    JobSearchController.$inject = ['$state', '$window', '$http', '$q', '$rootScope', 'gettingData', 'jobDetails', 'ajaxData', 'tabsName', 'App'];

    function myDate() {
       return function(x) {
           var date = x.split(" ")[0].split("-");
           var month = Number(date[1])-1;
           var d = new Date(date[0],month ,date[2]);
           return d;
       };
    }

    function JobSearchController($state, $window, $http, $q, $rootScope, gettingData, jobDetails, ajaxData, tabsName, App){
	
        $window.scrollTo(0,0);

        var vm = this;

        ajaxData.setData({});
        ajaxData.bol = false;

        var canceler;
        var gridApiCall = App.base_url + 'jobs_list';
        var page_no = 1,total_pages = 1, initial = 0;

        vm.jobType = [
            { name : 'All',  id : 2 },
            { name : 'Paid',  id : 0 },
            { name : 'Free',  id : 1 },
        ];

        vm.filterBy = [
            { id:0 , label : 'All' },
            { id:1 , label : 'My Jobs' }
        ];

        vm.overLoader = false;
        vm.init_no_posts_found = false;
        vm.no_posts_found = false;
        vm.pay_status = "2";
        vm.jobFilter = "0";

        vm.filterCall = filterCall;

        // epi search directive
        vm.search_opts= {
            delay: 500,
            progress: false,
            complete: false,
            placeholder:'Search By Job or Location',
            onSearch: function (val) {
                vm.search_val = val;
                vm.overLoader = true;
                total_pages = 0;
                if (vm.search_opts.progress) {
                    if (vm.search_opts.value) {
                        page_no = 1;
                        vm.infiniteScroll.loadApi(page_no, vm.search_val, function(){
                            vm.infiniteScroll.list = [];
                            vm.overLoader = false;
                            vm.search_opts.progress = false;
                            vm.search_opts.complete = true;
                        })
                    }
                }
            },
            onClear: function () {
                vm.search_val = "";
                page_no = 1;
                vm.overLoader = true;
                total_pages = 0;
                vm.infiniteScroll.loadApi(page_no, vm.search_val, function(){
                    vm.infiniteScroll.list = [];
                    vm.overLoader = false;
                });
            }
        }

        // pagination
        vm.infiniteScroll = {
            busy : false,
            list : [],
            url : App.base_url + 'apply_jobs_list',
            nextPage : function(){},
            loadApi : function(){},
            onComplete : function(obj){
                for(var i = 0; i < obj.length; i++){
                    vm.infiniteScroll.list.push(obj[i]);
                }
            },
            onError : function(){
                $window.location = App.base_url + 'logout';
            }
        }

        vm.infiniteScroll.nextPage = function(){
            if(total_pages >= page_no && total_pages != 0){
                if(vm.infiniteScroll.busy){
                    return;
                }

                vm.infiniteScroll.busy = true;

                vm.infiniteScroll.loadApi(page_no, vm.search_val);
            }
        }

        vm.infiniteScroll.loadApi = function(pageNo, search, calBack){

            if(canceler){
                canceler.resolve();
            }

            reset();
            
            canceler = $q.defer();

            var data = $("form[name='filter_form']").serialize();
            return $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                url: gridApiCall,
                data: data + '&' + $.param({
                    search_for : search,
                    page_no : pageNo,
                }),
                timeout: canceler.promise
            })
            .then(function(response){
                if(response.data.status_code == 200){
                    if(calBack != undefined){
                        calBack();
                    }
                    vm.infiniteScroll.busy = false;
                    if(response.data.data.length == 0){
                        if(initial == 0){
                            vm.init_no_posts_found = true;
                        }
                        else{
                            vm.init_no_posts_found = false;
                            vm.no_posts_found = true;   
                        }
                        total_pages = 0;
                        vm.infiniteScroll.total_count = 0;
                        vm.infiniteScroll.list = [];
                    }
                    else{
                        initial = 1;
                        if(page_no == 1){
                            total_pages = Math.ceil(response.data.data.total_count / 10);
                        }
                        page_no++;
                        vm.infiniteScroll.total_count = response.data.data.total_count;
                        vm.infiniteScroll.onComplete(response.data.data.posts);
                    }
                }
                else if(response.data.status_code == 400) {
                   vm.infiniteScroll.onError();
                }
            })
        }

        function reset(){
            vm.init_no_posts_found = false;
            vm.no_posts_found = false;
        }

        var prev = [2], prev1 = [0];
        function filterCall(filter, flag){
            if(filter != undefined){
                if(flag == 'type'){
                    if(prev[0] == filter){
                        return false;
                    }
                    prev[0] = filter;
                }
                else{
                    if(prev1[0] == filter){
                        return false;
                    }
                    prev1[0] = filter;
                }
                page_no = 1;
                vm.overLoader = true;
                total_pages = 0;
                vm.infiniteScroll.loadApi(page_no, vm.search_val, function(){
                    vm.infiniteScroll.list = [];
                    vm.overLoader = false;
                    if(vm.search_opts.progress){
                        vm.search_opts.progress = false;
                        vm.search_opts.complete = true;
                    }
                });
            }
        }

        

        gettingData.bol = false;
        gettingData.setData({});

        vm.job_details = function(job){
            jobDetails.id = job.id;
            jobDetails.job_title = job.job_title;
      	    $state.go('^.jobDetails',{"post_id":job.id});
        }

        vm.jumpPage = function(obj,tabCond){
            ajaxData.setData(obj);
            jobDetails.id = obj.id;
            jobDetails.job_title = obj.job_title;

            tabsName.tab_name = tabCond;
            $state.go('^.engagement/contacts',{'post_id':obj.id});
        }

        

        vm.getRewardsView = function(rewards) {
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

    }


}());