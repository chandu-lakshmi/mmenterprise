(function () {
  "use strict";

  angular
	  .module('app.assessment', ['ui.grid', 'ui.grid.selection'])

	.controller('TestsListController', TestsListController)
    .controller('CreateTestController', CreateTestController)
    .controller('EditTestController', EditTestController)
    .controller('TestSettingsController', TestSettingsController)

  
  	TestsListController.$inject  = ['$timeout', '$http', '$window', '$mdToast', 'App'];
	CreateTestController.$inject = ['$timeout', '$http', '$window', '$mdToast', 'CompanyDetails', 'App'];
	EditTestController.$inject = ['$timeout', '$http', '$window', '$mdToast', '$uibModal', 'App'];


	function TestsListController() {

		var vm = this;

		this.grid = {
			inProgress: false,
			responseMsg: null,
			totalRecords : 100
		};

		this.gridOptions = {
			rowHeight: 70,
			selectionRowHeaderWidth: 44,
			enableHorizontalScrollbar: 0,
			enableSorting: true,
			enableColumnMenus: false,
			enableRowSelection: true,
			enableRowHeaderSelection: true,
			enableFullRowSelection: true,
			data: 'data',
			appScopeProvider: vm // bindin scope to grid
		};

		this.gridOptions.columnDefs = [
			{ name: 'test_name', displayName: 'TEST NAME', cellTemplate: 'test-name.html', cellClass: 'test-name', width: '30%' },
			{ name: 'questions', displayName: 'QUESTIONS' },
			{ name: 'duration', displayName: 'DURATION' },
			{ name: 'status', displayName: 'STATUS' },
			{ name: 'created_by', displayName: 'CREATED BY' },
			{ name: 'date', displayName: 'DATE' }
		];

		this.gridOptions.onRegisterApi = function (gridApi) {
			gridApi.selection.on.rowSelectionChanged(null, function (row) {
				
			});

			gridApi.selection.on.rowSelectionChangedBatch(null, function (rows) {

			});

			vm.gridApi = gridApi;
		}


		function init() {
			vm.gridOptions.data = [{ test_name: 'UI/UX Developer Test', role: 'Software Developer', exp: '0-2 Years', questions: 10, duration: 60, status: 'Active', created_by: 'E.Max Well', date: 'Sep 14, 2017' }];
		}


		init();

	}


	function CreateTestController($timeout, $http, $window, $mdToast, CompanyDetails, App) {

		var vm = this;

		
		this.testObj = {};
		this.postCreateTestInProgress = false;
		this.postCreateTestSubmitted  = false;
		
		this.setTestName = function() {
			this.testObj.testName = CompanyDetails.name + ' - ' + this.testObj.role;
			if (!vm.testObj.role) {
				this.testObj.testName = null;
			}
		}	
		
		this.postCreateTest = function(form) {
			
			vm.postCreateTestSubmitted = true;
			
			if (form.$valid) {
				
				vm.postCreateTestInProgress = true;
				var apiKeys = $("form[name='createTestForm']").serialize();
				
				$http({
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					},
					method : 'POST',
					data   : apiKeys,
					url    : App.base_url + 'add_edit_exam',
				})
				.then(function (response) {
					if (response.data.status_code == 200) {
						
						vm.postCreateTestInProgress = false;
						
						$mdToast.show({
							hideDelay: 3000,
							position: 'top right',
							template: '<md-toast class="mm-toast"><div class="md-toast-text" flex><i class="material-icons">done</i><div class="text"><div class="toast-succ">Success!</div><div class="succ-text">' + response.data.message.msg[0] + '</div></div></div></md-toast>'
						});

						$timeout(function () {
							$state.go('app.campaigns.QuestionsList');
						}, 2000);

					}
					else if (response.data.status_code == 400) {
						$window.location = App.base_url + 'logout';
					}
				});
			}
		}

		function init() {
			getAPI();
		}

		function getAPI() {
			$http({
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				method: 'GET',
				url: App.base_url + 'get_experiences'
			})
			.success(function (response) {
				vm.experienceList = response.data.experiences;
			});

		}


		init();
	}


	function EditTestController($timeout, $http, $window, $mdToast, $uibModal, App) {
		
		var vm = this;

		this.getTestDetailsInProgress = true;
		
		this.deleteQuestion = function (id) {
			$uibModal.open({
				animation: false,
				backdrop: 'static',
				keyboard: false,
				templateUrl: 'templates/dialogs/common-confirm-msg.phtml',
				openedClass: "referral-status confirm-message",
				resolve: {
					paramsMdService: function () {
						return {
							firstMsg   : 'Are you sure you want to ',
							secondMsg  :'delete Question?',
							params     : { exam_question_id:id },
							apiEndPoint: 'add_edit_exam_question',
							callback   : deleteQeustionCallback
						};
					}
				},
				controller: 'CommonConfirmMessage',
				controllerAs: 'CommonConfirmMsgCtrl'
			})
		}

		function init() {
			getTestDetails();
		}

		function getTestDetails() {
			
			vm.getTestDetailsInProgress = true;
			
			$http({
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				method: 'POST',
				data: $.param({ exam_id: 3 }),
				url: App.base_url + 'view_exam_question',
			})
			.then(function (response) {
				if (response.data.status_code == 200) {

					vm.testDetails = response.data.data;
					vm.getTestDetailsInProgress = false;

				}
				else if (response.data.status_code == 400) {
					$window.location = App.base_url + 'logout';
				}
			});

		}

		function deleteQeustionCallback(response) {
			$timeout(function () {
				$mdToast.show({
					hideDelay: 3000,
					position: 'top right',
					template: '<md-toast class="mm-toast"><div class="md-toast-text" flex><i class="material-icons">done</i><div class="text"><div class="toast-succ">Success!</div><div class="succ-text">' + response.message.msg[0] + '</div></div></div></md-toast>'
				}, 200);
			});				
		}

		init();
	}


	function TestSettingsController($timeout, $http, $window, $mdToast, App) {

		var vm = this;

		this.statusList  = [{ label: 'Active', value: 1 }, { label: 'Inactive', value: 0 }];

		this.postSettingsInProgress = false;
		this.postSettingsSubmitted  = false;
		this.settingsObj = {
			aIScreening  : 1,
			autoScreen   : 1,
			status : 1
		}
		
		
		this.toogleAutoScreen = function(status) {
			vm.settingsObj.autoScreen = status;
		}

		this.toogleAIScreening = function (status) {
			vm.settingsObj.aIScreening = status;
		}

		this.postSettings = function(form) {
			
			vm.postSettingsSubmitted = true;

			if (form.$valid) {

				vm.postSettingsInProgress = true;
				
				var apiKeys = $("form[name='settingsForm']").serialize() + '&' + $.param({ 
					exam_id: 3,
					is_auto_screening  : vm.settingsObj.autoScreen,
					enable_ai_screening : vm.settingsObj.aIScreening,
					enable_full_screen : vm.settingsObj.enableFullscreen,
					reminder_emails    : vm.settingsObj.reminderMail,
					confirmation_email : vm.settingsObj.confirmationMail,
					shuffle_questions  : vm.settingsObj.shuffleQuestions,
					disclaimer         : vm.settingsObj.disclaimer
				});

				$http({
					headers : {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					},
					method  : 'POST',
					data    : apiKeys,
					url     : App.base_url + 'edit_exam_settings',
				})
				.then(function (response) {
					if (response.data.status_code == 200) {

						vm.postSettingsSubmitted  = false;
						vm.postSettingsInProgress = false;
						
						$mdToast.show({
							hideDelay: 4000,
							position: 'top right',
							template: '<md-toast class="mm-toast"><div class="md-toast-text" flex><i class="material-icons">done</i><div class="text"><div class="toast-succ">Success!</div><div class="succ-text">' + response.data.message.msg[0] + '</div></div></div></md-toast>'
						});

					}
					else if (response.data.status_code == 400) {
						$window.location = App.base_url + 'logout';
					}
				});
			}
		}

		
		function copy(e) {
			
			// find target element
			var
				t = e.target,
				c = t.dataset.copytarget,
				inp = (c ? document.querySelector(c) : null);
			// is element selectable?
			if (inp && inp.select) {

				// select text
				inp.select();
				try {
					// copy text
					document.execCommand('copy');
					inp.blur();
					// copied animation
					t.classList.add('copied');
					setTimeout(function () {
						t.classList.remove('copied');
					}, 1500);
				}
				catch (err) {
					alert('please press Ctrl/Cmd+C to copy');
				}

			}
		}

		setTimeout(function () {

			document.getElementsByClassName('btns')[0].addEventListener('click', copy, true);
			document.getElementsByClassName('btns')[0].addEventListener('touchstart', copy, true);

			$('#start_date').datetimepicker({
				minDate: new Date(),
				ignoreReadonly: true,
				format: 'dddd, DD MMM YYYY',
				sideBySide: true,
				useCurrent: true
			});

			$('#end_date').datetimepicker({
				minDate: new Date(),
				ignoreReadonly: true,
				format: 'dddd, DD MMM YYYY',
				sideBySide: true,
				useCurrent: true
			});

			$('#start_time').datetimepicker({
				ignoreReadonly: true,
				format: 'hh:mm A',
				sideBySide: true,
				useCurrent: true
			});

			$('#end_time').datetimepicker({
				ignoreReadonly: true,
				format: 'hh:mm A',
				sideBySide: true,
				useCurrent: true
			});
		})
	}
	  
}());