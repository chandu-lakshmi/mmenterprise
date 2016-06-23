(function () {
"use strict";

angular.module('app.post.job', [])

.controller('PostJobController', ['$state','$window', function($state,$window){

	this.job_function = ['Administrative','Business Development','Design','Information Technology','Other'];
	this.location = ['Plano, Texas'];
	this.industry = ['Accounting','Animation','Banking','Broadcast Media','Civil Engineering','Computer & Network Security','Other']
	this.employment_type = ['Full Time','Part Time','Contract','Temporary','Volunteer','Other'];
	this.experience = ['Freshers','0-1','1-2','3-5','5-6','6+'];

	this.postJob2 = function(){
		$window.scrollTo(0,0);
		$state.go('^.postJob2');
	}

}])
.controller('PostJobTwoController', ['$uibModal', function($uibModal){
	this.enable = function(a) {
		console.log(this)
	};
	this.requestSuccess =function  () {
	   $uibModal.open({
       animation: false,
       templateUrl: 'public/templates/dialogs/post-success.html',
       openedClass: "import_verify",
       windowClass: "pop-cre",
       controller: 'SuccessController',
       controllerAs:"succCtrl"
    });
	}
}])
.controller('SuccessController',['$window', '$state', '$uibModalInstance', function ($window, $state, $uibModalInstance) {
  this.goDashBoard = function  () {
  	$window.scrollTo(0,0);
	$state.go('^.dashboard');
  }
  window.onhashchange = function() {
    $uibModalInstance.dismiss('cancel');
  }
}]);
}());