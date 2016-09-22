(function () {
	"use strict";

	angular
		.module('app.settings', [])
		.controller('SettingsController', SettingsController)
		.controller('UserProfileController', UserProfileController)

	SettingsController.$inject = [];
	UserProfileController.$inject = ['CONFIG'];

	function SettingsController(){

	}

	function UserProfileController(CONFIG){

		var vm = this;

		var APP_URL = CONFIG.APP_DOMAIN;

		vm.users = [];
		vm.statusText = ["Active", "Inactive", "Separated"];
		vm.userDataList = {};
		vm.userDetails = {};
		vm.getUserData = getUserData;


		vm.users = [
			{"id":1,"user":"Shiva Kumar Kudikala","designation":"Jr.Software Developer","image":"public/images/Ui_Faces/Daniel.jpg","email":"shiva@gmail.com","location":"Hyderabad, IN","status":"Active"},
			{"id":1,"user":"Jaya Krishna","designation":"Jr.Software Developer","image":"public/images/Ui_Faces/George.jpg","email":"shiva@gmail.com","location":"Hyderabad, IN","status":"Active"},
			{"id":1,"user":"Karthik Jengeti","designation":"Jr.Software Developer","image":"public/images/Ui_Faces/Johnson.jpg","email":"shiva@gmail.com","location":"Hyderabad, IN","status":"Active"},
			{"id":1,"user":"Vamshi Krishna","designation":"Jr.Software Developer","image":"public/images/Ui_Faces/Philippe.jpg","email":"shiva@gmail.com","location":"Hyderabad, IN","status":"Active"},
			{"id":1,"user":"Varadarajula Gopi","designation":"Jr.Software Developer","image":"","email":"shiva@gmail.com","location":"Hyderabad, IN","status":"Active"}
		]

		getUserData(vm.users[0]);

		function getUserData(userData){
			vm.userDataList = userData;
		}
	}



    
}());