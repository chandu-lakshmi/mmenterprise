(function () {
	"use strict";

	angular
		.module('app.settings', ['ngAutocomplete'])
		.controller('SettingsController', SettingsController)
		.controller('SettingsCompanyProfileController', SettingsCompanyProfileController)
		.controller('MyProfileController', MyProfileController)
		.controller('UserGroupController', UserGroupController)
		.service('permissionsService',permissionsService)
		.directive('pwMatch', pwMatch)

	SettingsController.$inject = [];
	SettingsCompanyProfileController.$inject = ['$window', 'CompanyDetails', '$http', 'CONFIG'];
	MyProfileController.$inject = ['$http', '$scope', '$window', '$uibModal', 'rippleService', 'CompanyDetails', 'UserDetails', 'CONFIG'];
	UserGroupController.$inject = ['$scope', '$window', 'CONFIG', '$http', '$interval', '$q', 'rippleService', 'permissionsService'];

	function permissionsService(){
		var permissionData = {};

		this.setPermissions = function(data){
			permissionData = data;
		}

		this.getPermissions = function(){
			return permissionData
		}

		this.addPermissions = function(prop, val){
			permissionData[prop] = val;
		}
	
	}

	function pwMatch(){
		return {
	  		require: 'ngModel',
	  		link: function (scope, elem, attrs, ctrl) {
	    		var rePassword = '#' + attrs.pwMatch;

	    		elem.add(rePassword).on('keyup', function () {
	          		scope.$apply(function () {
	            		var v = elem.val()===$(rePassword).val();
	            		// alert(v);
	            		ctrl.$setValidity('pwmatch', v);
	          		});
	    		});
	  		}
		}
	
	}

	function SettingsController(){

	}

	function SettingsCompanyProfileController($window, CompanyDetails, $http, CONFIG){
		
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
	    	else if(response.data.status_code == 400){
	            $window.location = CONFIG.APP_DOMAIN + 'logout';
	        }
	    	
	    }, function(response){

	    })

	}

	function MyProfileController($http, $scope, $window, $uibModal, rippleService, CompanyDetails, UserDetails, CONFIG){

		var vm = this,
		$display_pic,image_path = '',org_name = '';

		vm.errCond = false;
		vm.loader = false;
		vm.modalLoader = false;
		vm.message = false;
		vm.has_image = false;
		vm.displayPicture = '';
		vm.myProfile = angular.copy(UserDetails);
		vm.passwords = {};
		vm.backendMsg = '';
		vm.successMsg = '';
		vm.modalInstance = '';

		vm.change = change;
		vm.setPassword = setPassword;
		vm.saveChanges = saveChanges;
		vm.changePassword = changePassword;
		vm.cancel = cancel;
		vm.trash = trash;

		rippleService.wave();

		if(UserDetails.user_dp != null && UserDetails.user_dp != ''){
			vm.displayPicture = UserDetails.user_dp;
		}
		else{
			vm.displayPicture = '';
		}

		// sending checkbox value when checked and unchecked
		var checkedStatus;
		function change(checkCondition){
			var checkbox = document.querySelector('#checkbox');
			var hidden = document.querySelector('#disabled');
			if(checkbox.checked){
				if(checkCondition == 0){
					$('#checkbox').prop('checked', false);
					hidden.disabled = false;
					checkedStatus = false;
				}
				else{
					hidden.disabled = true;
					checkedStatus = true;
				}
			}
			else{
				hidden.disabled = false;
				checkedStatus = false;
			}
		}

		// Reseting errors
		function resetErrors(){
			vm.passwords = {};
			vm.backendMsg = '';
			vm.modalLoader = false;
			vm.errCond = false;
		}

		//  update user profile and company logo
		function saveChanges(isValid){
			if(!isValid){
				vm.errCond = true;
			}
			else{
				vm.errCond = false;
				vm.loader = true;

				var formData = $('form[name="my_profile_form"]').serialize();

				angular.element('.disabled').css('pointer-events','none');

				var updateUser = $http({
			        headers: {
			           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			        },
			        method: 'POST',
			        url: CONFIG.APP_DOMAIN+'update_user',                               
			        data: formData
			    })

			    updateUser.success(function(response){
			    	angular.element('.disabled').css('pointer-events','auto');
			    	vm.loader = false;
			    	if(response.status_code == 200){
			    		if(checkedStatus){
			    			angular.element('header .user_dp img').attr('src', image_path);
			    		}
			    		UserDetails = vm.myProfile;
			    		UserDetails.user_dp = response.data.user_dp;
			    		angular.element('header .user_dp + .user_name').text(UserDetails.user_name);
			    		if(response.data.user_dp != ''){
			    			image_path = response.data.user_dp;
			    			org_name = response.data.user_dp.split('/').pop();
			    			$display_pic.find('.qq-upload-list li').remove();
			    			$display_pic.find('.qq-upload-list').append("<li><input type='hidden' name='photo_org_name_s3'"+
			    															"value='"+org_name+"' /><input type='hidden' value='" +
			    															image_path + "' name='photo_s3'/></li>").show();
			    		}
			    		vm.message = true;
						vm.successMsg = response.message.msg[0];
						setTimeout(function(){vm.message = false;$scope.$apply()},2000);
			    	}
			    	else if(response.status_code == 400){
						$window.location = CONFIG.APP_DOMAIN + 'logout';
					}
			    })

			    updateUser.error(function(response){
			    	console.log(response)
			    })
			}
		}

		// set password
		function changePassword(isValid){
			vm.errCond = false;
			if(!isValid){
				vm.errCond = true;
			}
			else{
				vm.errCond = false;
				vm.modalLoader = true;

				var formData = $('form[name="change_password_form"]').serialize();

				angular.element('.disabled').css('pointer-events','none');


				var changePassword = $http({
			        headers: {
			           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			        },
			        method: 'POST',
			        url: CONFIG.APP_DOMAIN+'change_password',                               
			        data: formData
			    })

			    changePassword.success(function(response){
			    	vm.modalLoader = false;
			    	angular.element('.disabled').css('pointer-events','auto');
			    	if(response.status_code == 200){
			    		vm.modalInstance.dismiss();
			    		vm.message = true;
						vm.successMsg = response.message.msg[0];
						setTimeout(function(){vm.message = false;$scope.$apply()},3000);
			    	}
			    	else if(response.status_code == 403){
			    		vm.backendMsg = response.message.msg[0];
			    	}
			    	else if(response.status_code == 400){
						$window.location = CONFIG.APP_DOMAIN + 'logout';
					}
			    })

			    changePassword.error(function(response){
			    	console.log(response)
			    })
			}
		}

		// modal window for set passwords
		function setPassword(){
			resetErrors();
			 vm.modalInstance = $uibModal.open({
	            animation: false,
	            keyboard: false,
	            backdrop: 'static',
	            templateUrl: 'templates/dialogs/set-password.phtml',
	            openedClass: "set-password",
	            scope: $scope
            });
		}

		// reset previous data for user details and empty password fields
		function cancel(flag){
			if(flag == 'user'){
				$display_pic.find('.qq-upload-fail').remove();
				vm.myProfile = UserDetails;
				if(UserDetails.user_dp != '' && UserDetails.user_dp != null){
					image_path = UserDetails.user_dp;
					org_name = UserDetails.user_dp.split('/').pop();
					setImage(org_name, image_path);
				}
				else{
					trash(0);
				}
			}
			else if(flag == 'password'){
				resetErrors();
			}
		}


		// qq-uploader
		function qqUploader(){
			$display_pic = angular.element('#display_pic');
			var uploader = new qq.FileUploader({
			    element: document.getElementById('display_pic'),
			    dragText: "",
				uploadButtonText: "<img src='public/images/avatar.png'>",
				multiple : false,
				sizeLimit: (1*1024*1024),
				allowedExtensions: ["JPG", "JPEG", "PNG"],
			    action: CONFIG.APP_DOMAIN+'file_upload',

			    onSubmit: function(id, name){
			    	$display_pic.find('.drag_txt').hide();
		            $display_pic.find('.qq-upload-list').css('z-index','0');
		            $display_pic.find('.qq-upload-list').show();
			    },
			    onComplete: function(id, name, response){
			    	if(response.success){
			    		vm.has_image = true;
			    		$scope.$apply();
			    		image_path = CONFIG.APP_API_DOMAIN+response.filename;
			    		$display_pic.find('.qq-upload-button').hide();
			    		$display_pic.find('.qq-upload-fail').remove();
			    		$display_pic.find('.qq-upload-success').hide();
		            	$display_pic.find('.qq-upload-list').css('z-index','-1');
			    		$display_pic.find('.qq-upload-drop-area').css('display','block');
			    		$display_pic.find('.qq-upload-drop-area').html('<div class="drag_img"><img src="'+image_path+'" class="img-circle"/></div>');
			    		$display_pic.find('.qq-upload-list').append("<li><input type='hidden' name='photo_org_name' value='" + response.org_name + "' /><input type='hidden' value='" + response.filename + "' name='photo'/></li>").show();
			    		$display_pic.find('.drag_img').append('<div class="overlay"></div><i class="fa fa-trash-o icon-trash" onclick="angular.element(this).scope().MyProfileCtrl.trash()"></i>');
			    	}
			    	else{
			    		$display_pic.find('.qq-upload-button').show();
			    		$display_pic.find('.qq-upload-fail').remove();
			    		$display_pic.append("<div class='qq-upload-fail'><span>"+response.msg+"</span></div>")
			    	}
			    },
			    showMessage: function(msg){
			    	$display_pic.find('.qq-upload-button').show();
			    	$display_pic.find('.qq-upload-fail').remove();
			    	$display_pic.append("<div class='qq-upload-fail'><span>"+msg+"</span></div>");
			    }

			})
			
			if(vm.displayPicture != ''){
				vm.has_image = true;
			    image_path = vm.displayPicture;
				org_name =  image_path.split('/').pop();
	    		setImage(org_name, image_path);
		    }
		}

		qqUploader();

		function setImage(org_name, image_path){
			$display_pic.find('.qq-upload-button').hide();
			$display_pic.find('.qq-upload-fail').remove();
    		$display_pic.find('.qq-upload-success').hide();
        	$display_pic.find('.qq-upload-list').css('z-index','-1');
    		$display_pic.find('.qq-upload-drop-area').css('display','block');
    		$display_pic.find('.qq-upload-drop-area').html('<div class="drag_img"><img src="'+image_path+'" class="img-circle"/></div>');
    		$display_pic.find('.qq-upload-list').append("<li><input type='hidden' name='photo_org_name_s3' value='"+org_name+"' />"+
    														"<input type='hidden' value='" + image_path + "' name='photo_s3'/></li>").show();
    		$display_pic.find('.drag_img').append('<div class="overlay"></div><i class="fa fa-trash-o icon-trash"'+
    												 'onclick="angular.element(this).scope().MyProfileCtrl.trash()"></i>');	
		}

		//  move to trash deleted images
		function trash(flag){
			change(0);
			vm.has_image = false;
			if(flag != 0){
				$scope.$apply();
			}
			image_path = '';
			org_name = '';
			$display_pic.find('.qq-upload-button').show();
			$display_pic.find('.drag_img').find('img').removeAttr('src');
			$display_pic.find('.qq-upload-list li').remove();
			$display_pic.find('.qq-upload-drop-area').css('display','none');
			$display_pic.find('.qq-upload-drop-area .drag_img').remove();
			$display_pic.find('.qq-upload-button .add-text').text('ADD PHOTO');
		}
	
	}


	function UserGroupController($scope, $window, CONFIG, $http, $interval, $q, rippleService, permissionsService){

		var vm = this,
		APP_URL = CONFIG.APP_DOMAIN,
		$display_pic,image_path = '',org_name;	

		// google api for location field
		this.geo_location = '';
	  	this.geo_options = null;
	  	this.geo_details = '';

		vm.newUser = false;
		vm.errCond = false;
		vm.loader = false;
		vm.group = true;
		vm.personDetails = {};
		vm.permissions = {};
		vm.backendError = '';
		vm.activeClass = '';
		vm.tab = '';
		vm.statusText = ['Active', 'Inactive'];
		vm.changePermission = changePermission;

		vm.getGroupData = getGroupData;
		vm.getPersonData = getPersonData;
		vm.addNew = addNew;
		vm.createGroup = createGroup;
		vm.addPerson = addPerson;
		vm.reset = reset;
		vm.trash = trash;

		rippleService.wave();

		vm.permission_template = "templates/users/permissions_template.phtml";
		vm.group_template = "templates/users/group-template.phtml";
		vm.person_template = "templates/users/person-template.phtml";

		// color picker
	    var colorCode = ["#21A4AC", "#EE8F3B", "#2A99E0", "#154c50", "#103954", "#342158", "#5B5B29", "#004D40", "#229A77", "#6f2b25"];
	    
	    vm.colorPicker = function(ind) {
	        return colorCode[String(ind).slice(-1)];
    	}

    	// initial loader
    	vm.pageLoader = false;
        vm.borderInc = 1;
        var s = $interval(function() {
            vm.remaining = 100 - vm.borderInc;
           vm.borderInc = vm.borderInc + (0.1 * Math.pow(1 - Math.sqrt(vm.remaining), 2))
        }, 100);

        var canceller = $q.defer();

        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
           if(toState.name != 'app.settings.userGroups')
           canceller.resolve()
       	});


        // fab button materialize js
		$('.fixed-action-btn').hover(function(){
			$(this).addClass('active');
		},function(){
			$(this).removeClass('active');
		})


		vm.permission_switches = {
	        2: [
	            {id: 1, label: 'Yes'},
	            {id: 0, label: 'No'}
	        ],
	        3: [
	            {id: 0, label: 'None'},
	            {id: 1, label: 'View'},
	            {id: 2, label: 'Edit'}
	        ],
	        4: [
	        	{id: 1, label: 'Manager'},
	            {id: 2, label: 'Employee'},
	            {id: 3, label: 'Client'},
	            {id: 4, label: 'Others'}
	        ]
	    }


	    // reset previous errors
	    function resetErrors(){
	    	vm.errCond = false;
	    	vm.backendError = '';
	    	image_path = '';
			vm.message = false;
	    }


	    // user permissions API
		function UserPermissions(){
			$http({
		        headers: {
		           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		        },
		        method: 'POST',
		        url: APP_URL + 'permissions'
		    })
		    .then(function(response){
		    	if(response.data.status_code == 200){
		    		permissionsService.setPermissions(response.data.data.permissions);
		    		getGroups();
		    	}
		    	else if(response.data.status_code == 400){
		            $window.location = CONFIG.APP_DOMAIN + 'logout';
		        }

		    },function(response){
		    	console.log(response)
		    })
		}

		UserPermissions();
		
		// get groups API
		function getGroups(){
			$http({
		        headers: {
		           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		        },
		        method: 'POST',
		        url: APP_URL + 'get_groups',
		        timout: canceller.promise
		    })
		    .then(function(response){
		    	if(response.data.status_code == 200){
		    		// loader
		    		vm.pageLoader = true;
                    vm.borderInc = 100;
                    $interval.cancel(s);
                    $('#borderLoader').fadeOut(2000);

			    	vm.groupsList = response.data.data.groups;
			    	vm.groupNames = vm.groupsList;
			    	getGroupData(0);
			    }
			    else if(response.data.status_code == 403){
			    	vm.backendError = response.data.message.msg[0];
			    }
			    else if(response.data.status_code == 400){
		            $window.location = CONFIG.APP_DOMAIN + 'logout';
		        }

		    },function(response){
		    	console.log(response)
		    })
		}

		// get group details
		function getGroupData(id){
			resetErrors();
			vm.activeClass = '';
			vm.tab = id;
			vm.newUser = false;
			vm.group = true;
			vm.title = vm.groupsList[id].name;
			vm.permissionsList = permissionsService.getPermissions();
			vm.groupData = angular.copy(vm.groupsList[id]);
			vm.permissions = angular.copy(vm.groupsList[id].permissions);
			if(vm.groupData.is_primary != 1){
				$('form[name="new_group_form"] input[type="text"]:first').focus();
			}
		}

		// change permissions
		function changePermission(permission, btn, parent_id){
	        if(permission.type == 'check'){
	            if(parent_id){
	                vm.permissions[parent_id+'_'+permission.id] = btn.target.checked;
	            }else{
	                vm.permissions[permission.id] = btn.target.checked;
	            }

	            angular.forEach(permission.children, function(c){
	                vm.permissions[permission.id+'_'+c.id] = btn.target.checked;
	            });
	        }else{
	            if(parent_id){
	                vm.permissions[parent_id+'_'+permission.id] = btn.id;
	            }else{
	                vm.permissions[permission.id] = btn.id;
	            }

	            angular.forEach(permission.children, function(c){
	                vm.permissions[permission.id+'_'+c.id] = btn.id>=1?1:0;
	            });
	        }
		}

		// get user details
		function getPersonData(index){
			resetErrors();
			vm.subTab = index;
			vm.group = false;
			vm.newPerson = false;
			setTimeout(function(){
				qquploader(1, vm.groupData.users[index].photo);
			},100);
			vm.activeClass = vm.groupData.users[index].fullname;
			vm.personDetails = angular.copy(vm.groupData.users[index]);
			vm.personDetails.group_id = vm.groupData.group_id;
			setTimeout(function(){$('form[name="new_user_form"] input[type="text"]:first').focus();},100);
		}

		// add New group or person
		function addNew(cond){
			vm.errCond = false;
			resetErrors();
			if(cond == 'group'){
				vm.group = true;
				vm.newUser = true;
				vm.tab = -1;
				vm.groupData = {};
				vm.admin = permissionsService.getPermissions();
				for(var i = 0; i < vm.admin.length; i++){
					vm.permissions[vm.admin[i].id] = 0;
					if(vm.admin[i].children.length > 0){
						vm.permissions[vm.admin[i].id] = 0;
						for(var j = 0; j < vm.admin[i].children.length; j++){
							vm.permissions[vm.admin[i].id+'_'+vm.admin[i].children[j].id] = 0;
						}
					}
				}
				setTimeout(function(){$('form[name="new_group_form"] input[type="text"]:first').focus();},100);
			}
			else{
				vm.group = false;
				vm.newPerson = true;
				vm.personDetails = {};
				// qq uploader
				setTimeout(function(){
					qquploader();
				},100);
				setTimeout(function(){$('form[name="new_user_form"] input[type="text"]:first').focus();},100);
			}
		}

		//  edit or add group
		function createGroup(isValid, id, flag){
			flag = flag == true ? 0 : 1;
			if(!isValid){
				vm.errCond = true;
			}
			else{
				vm.errCond = false;
				vm.loader = true;
				angular.element('.disabled').css('pointer-events','none');
				var data = $('form[name="new_group_form"]').serialize();
				$http({
			        headers: {
			           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			        },
			        method: 'POST',
			        data: data + '&' + $.param({
			        	action : flag,
			        	group_id : id
			        }),
			        url: APP_URL + 'add_group'
			    })
			    .then(function(response){
			    	vm.loader = false;
			    	angular.element('.disabled').css('pointer-events','auto');
			    	if(response.data.status_code == 200){
			    		vm.backendError = '';
			    		if(flag == 0){
			    			getGroups();
			    		}
			    		else{
			    			vm.groupsList[vm.tab] = angular.copy(vm.groupData);
			    			vm.groupsList[vm.tab].permissions = angular.copy(vm.permissions);
			    			vm.title = vm.groupsList[vm.tab].name;
			    		}
				    	vm.message = true;
				    	vm.backendMsg = response.data.message.msg[0];
				    	setTimeout(function(){vm.message = false;$scope.$apply()},3000);
				    }
				    else if(response.data.status_code == 403){
				    	vm.backendError = response.data.message.msg[0];
				    }
				    else if(response.data.status_code == 400){
			            $window.location = CONFIG.APP_DOMAIN + 'logout';
			        }
			    },function(response){
			    	console.log(response)
			    })
			}
		}

		// add single person
		function addPerson(isValid, userId, flag){
			flag = flag == true ? 0 : 1;
			vm.backendError = '';
			if(!isValid){
				vm.errCond = true;
			}
			else{
				vm.errCond = false;
				vm.loader = true;
				angular.element('.disabled').css('pointer-events','none');
				var formData = $('form[name="new_user_form"]').serialize();
				$http({
			        headers: {
			           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			        },
			        method: 'POST',
			        data: formData + '&' + $.param({
			        	action: flag,
			        	user_id: userId
			        }),
			        url: APP_URL + 'add_user'
			    })
			    .then(function(response){
			    	vm.loader = false;
			    	angular.element('.disabled').css('pointer-events','auto');
			    	if(response.data.status_code == 200){
			    		vm.backendError = '';
			    		if(flag == 0){
			    			getGroups();
			    		}
			    		else{
			    			if(vm.groupsList[vm.tab].users[vm.subTab].user_id == vm.personDetails.group_id){
			    				alert();
			    			}
			    			else{
			    				console.log('dasd')
			    			}
			    			vm.groupsList[vm.tab].users[vm.subTab] = angular.copy(vm.personDetails);
			    			vm.groupsList[vm.tab].users[vm.subTab].photo = angular.copy(response.data.data.photo);
			    			vm.groupData.users[vm.subTab] = angular.copy(vm.personDetails);
			    			vm.groupData.users[vm.subTab].photo = angular.copy(response.data.data.photo);
			    			if(response.data.data.photo != ''){
				    			image_path = response.data.data.photo;
				    			org_name = response.data.data.photo.split('/').pop();
				    			$display_pic.find('.qq-upload-list li').remove();
				    			$display_pic.find('.qq-upload-list').append("<li><input type='hidden' name='photo_org_name_s3'"+
				    															"value='"+org_name+"' /><input type='hidden' value='" +
				    															image_path + "' name='photo_s3'/></li>").show();
				    		}
			    		}
			    		vm.message = true;
			    		vm.backendMsg = response.data.message.msg[0];
			    		setTimeout(function(){vm.message = false;$scope.$apply()},3000);
				    }
				    else if(response.data.status_code == 403){
				    	if(response.data.message.hasOwnProperty('emailid')){
				    		vm.backendError = response.data.message.emailid[0];
				    	}
				    	else{
				    		vm.backendError = response.data.message.msg[0];
				    	}
				    }
				    else if(response.data.status_code == 400){
			            $window.location = CONFIG.APP_DOMAIN + 'logout';
			        }
			    },function(response){
			    	console.log(response)
			    })
			}
		}

		// form reset
		function reset(tab, flag){
			vm.errCond = false;
			if(tab == 'person'){
				$display_pic.find('.qq-upload-fail').remove();
				if(flag){
					vm.personDetails = {};
					vm.personDetails.emailid = '';
					trash(0);
				}
				else{
					getPersonData(vm.subTab);
				}
			}
			else{
				if(flag){
					vm.groupData = {};
					vm.permissions = {}
					vm.admin = permissionsService.getPermissions();
					for(var i = 0; i < vm.admin.length; i++){
						vm.permissions[vm.admin[i].id] = 0;
						if(vm.admin[i].children.length > 0){
							for(var j = 0; j < vm.admin[i].children.length; j++){
								vm.permissions[vm.admin[i].id+'_'+vm.admin[i].children[j].id] = 0;
							}
						}
					}
				}
				else{
					getGroupData(vm.tab);
				}
			}
		}


		// qq-uploader
		function qquploader(flag, img){
			$display_pic = $('#display_pic');
			var uploader = new qq.FileUploader({
			    element: document.getElementById('display_pic'),
			    dragText: "",
				uploadButtonText: "<img src='public/images/avatar.png'>",
				multiple : false,
				sizeLimit: (1*1024*1024),
				allowedExtensions: ["JPG", "JPEG", "PNG"],
			    action: CONFIG.APP_DOMAIN+'file_upload',

			    onSubmit: function(id, name){
			    	$display_pic.find('.drag_txt').hide();
		            $display_pic.find('.qq-upload-list').css('z-index','0');
		            $display_pic.find('.qq-upload-list').show();
			    },
			    onComplete: function(id, name, response){
			    	if(response.success){
			    		vm.textCondition = true;
			    		$scope.$apply();
			    		image_path = CONFIG.APP_API_DOMAIN+response.filename;
			    		$display_pic.find('.qq-upload-fail').remove();
			    		$display_pic.find('.qq-upload-success').hide();
		            	$display_pic.find('.qq-upload-list').css('z-index','-1');
			    		$display_pic.find('.qq-upload-drop-area').css('display','block');
			    		$display_pic.find('.qq-upload-drop-area').html('<div class="drag_img"><img src="'+
			    															image_path+'" class="img-circle"/></div>');
			    		$display_pic.find('.qq-upload-list').append("<li><input type='hidden' name='photo_org_name'"+
			    														"value='" + response.org_name + "' />"+
		    															"<input type='hidden' value='" +
		    															response.filename + "' name='photo'/></li>").show();
			    		$display_pic.find('.drag_img').append('<div class="overlay"></div><i class="fa fa-trash-o icon-trash"'+
			    												'onclick="angular.element(this).scope().UserGroupCtrl.trash()"></i>');
			    	}
			    	else{
			    		vm.textCondition = false;
			    		$scope.$apply();
			    		$display_pic.find('.qq-upload-fail').remove();
			    		$display_pic.append("<div class='qq-upload-fail'><span>"+
	    										response.msg+"</span></div>")
			    	}
			    },
			    showMessage: function(msg){
			    	$display_pic.find('.qq-upload-fail').remove();
			    	$display_pic.append("<div class='qq-upload-fail'><span>"+msg+"</span></div>");
			    }
			})

			if(flag == 1 && img != ''){
				vm.textCondition = true;
	    		$scope.$apply();
				image_path = img;
				org_name =  img.split('/').pop();
	    		setImage(org_name, image_path);
			}
		}

		function setImage(org_name, image_path){
			$display_pic.find('.qq-upload-fail').remove();
    		$display_pic.find('.qq-upload-success').hide();
        	$display_pic.find('.qq-upload-list').css('z-index','-1');
    		$display_pic.find('.qq-upload-drop-area').css('display','block');
    		$display_pic.find('.qq-upload-drop-area').html('<div class="drag_img"><img src="'+
    															image_path+'" class="img-circle"/></div>');
    		$display_pic.find('.qq-upload-list').append("<li><input type='hidden' name='photo_org_name_s3' value='"+
    														org_name+"' /><input type='hidden' value='" + image_path +
    														"' name='photo_s3'/></li>").show();
    		$display_pic.find('.drag_img').append('<div class="overlay"></div><i class="fa fa-trash-o icon-trash"'+
    												'onclick="angular.element(this).scope().UserGroupCtrl.trash()"></i>');
		}

		// delete image
		function trash(flag){
			vm.textCondition = false;
    		if(flag != 0){
				$scope.$apply();
			}
			image_path = '';
			org_name = '';
			$display_pic.find('.drag_img').find('img').removeAttr('src');
			$display_pic.find('.qq-upload-list li').remove();
			$display_pic.find('.qq-upload-drop-area').css('display','none');
			$display_pic.find('.qq-upload-drop-area .drag_img').remove();
		}

	}

	



    
}());