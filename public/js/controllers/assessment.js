(function () {
  "use strict";

  angular
	  .module('app.assessment', ['ui.grid', 'ui.grid.selection'])

	.controller('TestsListController', TestsListController)
    .controller('CreateTestController', CreateTestController)
    .controller('EditTestController', EditTestController)
	.controller('TestSettingsController', TestSettingsController)
	  
	.service('EditTestService', EditTestService)

  	TestsListController.$inject    = ['$timeout', '$mdToast', '$uibModal', '$http', '$window', 'App'];
	CreateTestController.$inject   = ['$state', '$timeout', '$http', '$window', '$mdToast', 'CompanyDetails', 'App'];
	EditTestController.$inject     = ['$stateParams', '$timeout', '$http', '$window', '$mdToast', '$uibModal', 'App', 'EditTestService'];
	TestSettingsController.$inject = ['$state', '$stateParams', '$timeout', '$http', '$window', '$mdToast', 'App'];

	function TestsListController($timeout, $mdToast, $uibModal, $http, $window, App) {

		var vm = this;

		this.grid = {
			pageNo: 1,
			inProgress: false,
			responseMsg: null,
			totalRecords : null
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
			data: [],
			appScopeProvider: vm // bindin scope to grid
		};

		this.gridOptions.columnDefs = [
			{ name: 'name', displayName: 'TEST NAME', cellTemplate: 'test-name.html', cellClass: 'test-name', width: '30%' },
			{ name: 'qcount', displayName: 'QUESTIONS', cellTemplate: '<div class="ui-grid-cell-contents duration"><img class="qst" src="public/images/qstn_list.png" /><span class="qst">{{ COL_FIELD }}</span></div>'},
			{ name: 'max_duration', displayName: 'DURATION', cellTemplate: '<div class="ui-grid-cell-contents duration"><span class="qst">{{ COL_FIELD }}</span></div>'},
			{ name: 'is_active', displayName: 'STATUS', cellTemplate: '<div class="ui-grid-cell-contents duration"><span class="qst">{{ COL_FIELD }}</span></div>'},
			{ name: 'created_by', displayName: 'CREATED BY', cellTemplate: '<div class="ui-grid-cell-contents duration"><span class="qst">{{ COL_FIELD }}</span></div>'},
			{ name: 'created_at', displayName: 'DATE', cellTemplate: '<div class="ui-grid-cell-contents duration"><span class="qst">{{ COL_FIELD }}</span></div>'}
		];

		this.gridOptions.onRegisterApi = function (gridApi) {
			gridApi.selection.on.rowSelectionChanged(null, function (row) {
				
			});

			gridApi.selection.on.rowSelectionChangedBatch(null, function (rows) {

			});

			vm.gridApi = gridApi;
		}


		function init() {
			getTestList();
		}

		function getTestList() {

			var apiKeys = $.param({ page_no: vm.grid.pageNo });
			vm.grid.inProgress = true;

			$http({
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				method: 'POST',
				data: apiKeys,
				url: App.base_url + 'get_company_assessments_all',
			})
				.then(function (response) {
					if (response.data.status_code == 200) {
						vm.gridOptions.data = response.data.data;
					}
					else if (response.data.status_code == 403) {
						vm.gridOptions.data = [];
						vm.grid.responseMsg = response.data.message.msg[0];
					}
					else if (response.data.status_code == 400) {
						$window.location = App.base_url + 'logout';
					}
					vm.grid.inProgress = false;
					vm.grid.totalRecords = vm.gridOptions.data.length;
				});
		}

		init();

	}


	function CreateTestController($state, $timeout, $http, $window, $mdToast, CompanyDetails, App) {

		var vm = this;

		
		this.testObj = {};
		this.testId  = $state.params.examId == 0 ? 0 : $state.params.examId; 
		this.postCreateTestInProgress = false;
		this.postCreateTestSubmitted  = false;
		this.getSettingsInProgress    = false;

		this.setTestName = function() {
			this.testObj.exam_name = CompanyDetails.name + ' - ' + this.testObj.exam_type;
			if (!vm.testObj.exam_type) {
				this.testObj.exam_name = null;
			}
		}	
		
		this.postCreateTest = function(form) {
			
			vm.postCreateTestSubmitted = true;
			
			if (form.$valid) {
				
				vm.postCreateTestInProgress = true;
				var testForm = $("form[name='createTestForm']").serialize();
				
				if ($state.params.examId != 0) {
					testForm = testForm + '&' + $.param({ exam_id: $state.params.examId });
				} 

				var apiKeys = testForm;
				
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
							$state.go('app.campaigns.EditTest', {id: response.data.data.id});
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
			if ($state.params.examId != 0) {
				getSettings();
			}
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

		function getSettings() {

			vm.getSettingsInProgress = true;

			var apiKeys = $.param({ exam_id: $state.params.examId });

			$http({
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				method: 'POST',
				data: apiKeys,
				url: App.base_url + 'get_exam_details',
			})
			.then(function (response) {
				if (response.data.status_code == 200) {
					vm.testObj = response.data.data;
					vm.getSettingsInProgress = false;
				}
				else if (response.data.status_code == 400) {
					$window.location = App.base_url + 'logout';
				}
			});
		}


		init();
	}


	function EditTestController($stateParams, $timeout, $http, $window, $mdToast, $uibModal, App, EditTestService) {
		
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
			/* var data = EditTestService.getData(); 
			if (!data) {
				getTestDetails();
			} else{
				vm.testDetails = data;
			} */
			getTestDetails();
		}

		function getTestDetails() {
			
			vm.getTestDetailsInProgress = true;
			
			$http({
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				method: 'POST',
				data: $.param({ exam_id: $stateParams.id }),
				url: App.base_url + 'view_exam_question',
			})
			.then(function (response) {
				if (response.data.status_code == 200) {
					
					EditTestService.setData(response.data.data);
					vm.testDetails = response.data.data 
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
			angular.forEach(vm.testDetails.exam_question_list, function(element, index) {
				if (response.data.id == element.exam_question_id) {
					vm.testDetails.exam_question_list.splice(index, 1)
				}	
			});				
		}

		init();
	}


	function TestSettingsController($state, $stateParams, $timeout, $http, $window, $mdToast, App) {

		var vm = this;

		this.examId      = $stateParams.id;
		this.statusList  = [{ label: 'Active', value: 1 }, { label: 'Inactive', value: 0 }];

		this.postSettingsInProgress = false;
		this.postSettingsSubmitted  = false;
		this.settingsObj = {
			//aIScreening  : 1,
			is_auto_screening   : 1,
			status : 1
		}
		
		
		this.toogleAutoScreen = function(status) {
			vm.settingsObj.is_auto_screening = status;
		}

		/* this.toogleAIScreening = function (status) {
			vm.settingsObj.aIScreening = status;
		} */

		this.postSettings = function(form) {
			
			vm.postSettingsSubmitted = true;

			if (form.$valid) {

				vm.postSettingsInProgress = true;
				
				var apiKeys = $("form[name='settingsForm']").serialize() + '&' + $.param({ 
					exam_id: $stateParams.id,
					is_auto_screening: vm.settingsObj.is_auto_screening,
					//enable_ai_screening : vm.settingsObj.aIScreening,
					enable_full_screen : vm.settingsObj.enable_full_screen,
					reminder_emails    : vm.settingsObj.reminder_emails,
					confirmation_email : vm.settingsObj.confirmationMail,
					shuffle_questions  : vm.settingsObj.shuffle_questions,
					disclaimer         : vm.settingsObj.disclaimer,
					password_protected : vm.settingsObj.password_protected
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

						$timeout(function() {
							$state.go('app.campaigns.EditTest', { id: $stateParams.id });
						}, 500);

					}
					else if (response.data.status_code == 400) {
						$window.location = App.base_url + 'logout';
					}
				});
			}
		}

		function init() {
			getSettings();
		}

		function getSettings() {

			vm.getSettingsInProgress = true;

			var apiKeys =  $.param({ exam_id: $stateParams.id });

			$http({
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				method: 'POST',
				data: apiKeys,
				url: App.base_url + 'get_exam_details',
			})
			.then(function (response) {
				if (response.data.status_code == 200) {
					vm.getSettingsInProgress = false;
					var data = response.data.data;
					vm.settingsObj = data;
					if (data.hasOwnProperty('start_date')) {
						setTimeout(function () {
							$('#start_date').data("DateTimePicker").minDate(new Date(data.start_date));
							$('#end_date').data("DateTimePicker").minDate(new Date(data.end_date));
							$('#start_date').data("DateTimePicker").date(new Date(data.start_date));
							$('#end_date').data("DateTimePicker").date(new Date(data.end_date));
							$('#start_time').data("DateTimePicker").date(new Date(data.end_date + ' ' + data.start_time));
							$('#end_time').data("DateTimePicker").date(new Date(data.start_date + ' ' + data.end_time));
						})
					}
				}
				else if (response.data.status_code == 400) {
					$window.location = App.base_url + 'logout';
				}
			});

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
				showClose :true,
				format: 'dddd, DD MMM YYYY',
				sideBySide: true,
				useCurrent: true
			})
			.on("dp.change", function (e) {
				$('#end_date').data("DateTimePicker").minDate(e.date);
			});

			$('#end_date').datetimepicker({
				minDate: new Date(),
				ignoreReadonly: true,
				showClose: true,
				format: 'dddd, DD MMM YYYY',
				sideBySide: true,
				useCurrent: false
			})
			.on("dp.change", function (e) {
				$('#start_date').data("DateTimePicker").maxDate(e.date);
			});

			$('#start_time').datetimepicker({
				ignoreReadonly: true,
				format: 'hh:mm A',
				showClose: true,
				sideBySide: true,
				useCurrent: true
			});

			$('#end_time').datetimepicker({
				ignoreReadonly: true,
				showClose: true,
				format: 'hh:mm A',
				sideBySide: true,
				useCurrent: true
			});
		})

		init();
	}


	function EditTestService() {
		
		this.data;

		this.setData = function (data) {
			this.data = angular.copy(data);
		}

		this.getData = function () {
			return this.data;
		}

	}
	  
}());