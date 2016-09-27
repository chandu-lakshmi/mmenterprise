(function () {
	"use strict";

	angular
		.module('app.settings', ['flow'])
		.controller('SettingsController', SettingsController)
		.controller('SettingsCompanyProfileController', SettingsCompanyProfileController)
		.controller('UserProfileController', UserProfileController)
		.controller('MyProfileController', MyProfileController)

	SettingsController.$inject = [];
	SettingsCompanyProfileController.$inject = ['CompanyDetails', '$http', 'CONFIG'];
	UserProfileController.$inject = ['CONFIG'];
	MyProfileController.$inject = ['CompanyDetails', 'UserDetails'];

	function SettingsController(){

	}

	function SettingsCompanyProfileController(CompanyDetails, $http, CONFIG){
		
		var vm = this;
		var APP_URL = CONFIG.APP_DOMAIN;

		vm.companyDetails = {};
		vm.industry_list = {};
		vm.number_of_employees = ["10-50","50-100","100-500","500-1000","1000-5000","5000+"];

		$http({
	        headers: {
	           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	        },
	        method: 'GET',
	        url: CONFIG.APP_DOMAIN+'get_industries'
	    })
	    .then(function(response){
	       vm.industry_list = response.data.data.industries; 
	    },function(response){
	        vm.industry_list = [];
	    })

		$http({
	        headers: {
	           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	        },
	        method: 'POST',
	        data: $.param({
				company_code : CompanyDetails.company_code
			}),
	        url: APP_URL + 'view_company_details'
	    })
	    .then(function(response){
	    	if(response.data.status_code == 200){
	    		vm.companyDetails = response.data.data.companyDetails
	    	}
	    	
	    }, function(response){

	    })


	}

	function MyProfileController(CompanyDetails, UserDetails){

		var vm = this;

		vm.displayPicture = CompanyDetails.company_logo;
		vm.myProfile = UserDetails;
		vm.errCond = false;
	
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
			{"id":1,"user":"Shiva Kumar Kudikala","designation":"Jr. Software Developer","image":"public/images/Ui_Faces/Daniel.jpg","email":"shiva@gmail.com","location":"Hyderabad, IN","status":"Active"},
			{"id":2,"user":"Jaya Krishna","designation":"Jr.Software Developer","image":"public/images/Ui_Faces/George.jpg","email":"jaya@gmail.com","location":"Hyderabad, IN","status":"Active"},
			{"id":3,"user":"Karthik Jengeti","designation":"PHP Developer","image":"public/images/Ui_Faces/Johnson.jpg","email":"karthik@gmail.com","location":"Hyderabad, IN","status":"Active"},
			{"id":4,"user":"Vamshi Krishna","designation":"Project Coordinator","image":"public/images/Ui_Faces/Philippe.jpg","email":"vamshi@gmail.com","location":"Hyderabad, IN","status":"Active"},
			{"id":5,"user":"Varadarajula Gopi","designation":"Sr. Tester","image":"","email":"gopi@gmail.com","location":"Hyderabad, IN","status":"Active"}
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

		// default

		vm.admin = [
			{"id":1,"label":"Dashboard","length":"2","type":"radio"},
			{"id":2,"label":"job","length":"2","type":"radio"},
			{"id":3,"label":"User","length":"2","type":"radio"}
		];

		vm.permission_switches = {
	        2: [
	            {id: 1, label: 'yes'},
	            {id: 0, label: 'no'}
	        ],
	    }

	    vm.user_permissions_view = {
	    	permissions : {1: "1", 2: "0", 3: "1"}
		}

		vm.changePermission = function(permissions, switchs){
			if(permissions.type == 'check'){

			}
			else{
				console.log(vm.user_permissions_view.permissions)
				vm.user_permissions_view.permissions[permissions.id] = vm.user_permissions_view.permissions[permissions.id] >= 1 ? 1 : 0;
				console.log(vm.user_permissions_view.permissions)
			}
		}

		vm.permission_template = "templates/users/permissions_template.phtml";

	}

	



    
}());