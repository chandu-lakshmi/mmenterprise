(function () {
	"use strict";

	angular
		.module('app.settings', [])
		.controller('SettingsController', SettingsController)
		.controller('UserProfileController', UserProfileController)
		.controller('MyProfileController', MyProfileController)

	SettingsController.$inject = [];
	UserProfileController.$inject = ['CONFIG'];
	MyProfileController.$inject = ['CompanyDetails', 'UserDetails'];

	function SettingsController(){

	}

	function UserProfileController(CONFIG){

		var vm = this;

		var APP_URL = CONFIG.APP_DOMAIN;

		vm.users = [];
		vm.statusText = [];
		vm.activeClass = '';
		vm.errCond = false;
		vm.updateLoader = false;
		vm.userHeaderList = {};
		vm.userDetails = {};
		vm.getUserData = getUserData;
		vm.updateChanges = updateChanges;


		vm.users = [
			{"id":1,"user":"Shiva Kumar Kudikala","designation":"Jr.Software Developer","image":"public/images/Ui_Faces/Daniel.jpg","email":"shiva@gmail.com","location":"Hyderabad, IN","status":"Active"},
			{"id":2,"user":"Jaya Krishna","designation":"Jr.Software Developer","image":"public/images/Ui_Faces/George.jpg","email":"shiva@gmail.com","location":"Hyderabad, IN","status":"Active"},
			{"id":3,"user":"Karthik Jengeti","designation":"Jr.Software Developer","image":"public/images/Ui_Faces/Johnson.jpg","email":"shiva@gmail.com","location":"Hyderabad, IN","status":"Active"},
			{"id":4,"user":"Vamshi Krishna","designation":"Jr.Software Developer","image":"public/images/Ui_Faces/Philippe.jpg","email":"shiva@gmail.com","location":"Hyderabad, IN","status":"Active"},
			{"id":5,"user":"Varadarajula Gopi","designation":"Jr.Software Developer","image":"","email":"shiva@gmail.com","location":"Hyderabad, IN","status":"Active"}
		];

		vm.statusText = ["Active", "Inactive", "Separated"];

		getUserData(vm.users[0]);

		function getUserData(userData){
			vm.activeClass = userData.user;
			vm.userHeaderList = angular.copy(userData);
			vm.userDetails = angular.copy(userData);
		}

		// update changes
		function updateChanges(isValid){
			if(!isValid){
				vm.errCond = true;
			}
			else{
				vm.errCond = false;
				//vm.updateLoader = true;
				var data = $('form[name="user_details_form"]').serialize() + '&' + $('form[name="user_management_form"]').serialize();
				console.log(data);
			}
		}

	}

	function MyProfileController(CompanyDetails, UserDetails){

		var vm = this;

		vm.displayPicture = CompanyDetails.company_logo;
		vm.myProfile = UserDetails;
		vm.errCond = false;
	}



    
}());