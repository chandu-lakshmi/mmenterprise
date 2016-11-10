(function () {
	"use strict";

	angular
		.module('app.rewards', ['infinite-scroll'])
		.controller('RewardsController', RewardsController)

	RewardsController.$inject = ['$http', 'jobDetails', 'ajaxData', '$window', 'CONFIG'];

	function RewardsController ($http, jobDetails, ajaxData, $window, CONFIG){
		var vm = this;

		this.subHeaderCount = ajaxData.getData();
		this.post_id = jobDetails.id;
		this.job_title = jobDetails.job_title;

		
		var pageNo = 1,
		totalPagesCount = 2;
		this.busy = false;
		this.noRewards = false;
		this.rewards = [];


		var colorCode = ["#21A4AC", "#EE8F3B", "#2A99E0", "#154c50", "#103954", "#342158", "#5B5B29", "#004D40", "#229A77", "#6f2b25"];    	
		

		this.getRewardsData = getRewardsData;
	    this.colorPicker = colorPicker;
	    this.currencyView = currencyView;

		function getRewardsData() {
			if (totalPagesCount >= pageNo) {
				if (vm.busy) {
	            	return;
	        	}
			}
			else{
				return;
			}

       	 	vm.busy = true;
       	 	var rewardsList = $http({
	            headers: {
	                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	            },
	            method : 'POST',
	            data : $.param({post_id: vm.post_id}),
	            url : CONFIG.APP_DOMAIN + 'job_rewards'
        	})

	        rewardsList.success(function(response) {
	        	if (response.status_code == 200) {
	        		if(response.data.length == []){
	        			totalPagesCount = 0;
	        			vm.noRewards = true;
	        			vm.noRewardsMsg = response.message.msg[0];
	        		}
	        		else{
	        			vm.rewards = response.data;
	        			vm.rewardsCurrencyType = (response.data.currency_type == 1) ? '$' : '₹​'; 
	        		// if (response.total_records.length == 0) {
	        		// 	totalPagesCount = 0;
	        		// }
	        		// else{
	        		// 	vm.rewards.push(response.rewards_list);
	        		// 	totalPagesCount = Math.ceil(response.total_records / 50);
	        		// 	pageNo++;
	        		// }
	        		}
	        		vm.busy = false;
	        		totalPagesCount=0;
	        	}
	        	else if (response.status_code == 400) {
                	$window.location = CONFIG.APP_DOMAIN + 'logout';
            	}
			})

			rewardsList.error(function(response) {
            	console.log(response);
        	})

		}

		function colorPicker(index) {
	        return colorCode[String(index).slice(-1)];
		}

		function currencyView(currencyObj, type){
			for(var i = 0; i < currencyObj.length; i++){
				if(currencyObj[i].name == type){
					if(currencyObj[i].rewards_type == 'points'){
						return currencyObj[i].rewards_value + ' Points';
					}
					else if(currencyObj[i].rewards_type == 'paid'){
						return vm.rewardsCurrencyType + currencyObj[i].rewards_value ;
					}
					else{
						return '-';
					} 
				}
			}
		}

	}

}());
