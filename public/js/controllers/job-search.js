(function () {
"use strict";

angular.module('app.job.search', ['app.post.job'])
.controller('JobSearchController', ["gettingData","$http", "$state", function(gettingData,$http,$state){
	var selfObj = this;
	$http.get('public/js/controllers/job-details-info.json')
    .success(function(data) {
      selfObj.jobDetails = data;
  });

  gettingData.bol = false;

  selfObj.jumpPage = function(title,b,c){
    //console.log(title,b,c);
  	$state.go('^.jobDetails');
  }

    /*this.funClick = function(){
    	$state.go('^');
    }*/

}]);






}());