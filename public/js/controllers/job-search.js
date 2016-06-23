(function () {
"use strict";

angular.module('app.job.search', [])
.controller('JobSearchController', ["$http", "$state", function($http,$state){
	var selfObj = this;
	$http.get('public/js/controllers/job-details-info.json')
    .success(function(data) {
      selfObj.jobDetails = data;
  });

  selfObj.jumpPage = function(title,b,c){
    //console.log(title,b,c);
  	$state.go('^.jobDetails');
  }

    /*this.funClick = function(){
    	$state.go('^');
    }*/

}]);






}());