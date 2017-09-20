(function () {
  "use strict";

  angular
	  .module('app.assessment', ['ui.grid', 'ui.grid.selection'])

	.controller('TestsListController', TestsListController)
    .controller('CreateTestController', CreateTestController)
    .controller('EditTestController', EditTestController)
    .controller('TestSettingsController', TestSettingsController)

  
	TestsListController.$inject = [];
	CreateTestController.$inject = [];


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


	function CreateTestController() {

		var vm = this;

		this.role = ["Front-End Developer"];

	}


	function EditTestController() {

	}


	function TestSettingsController() {

		var vm = this;

		this.statusList = ['Active', 'Inactive'];
		this.settings = {
			autoScreen : true,
			status : 'Active'
		}

		this.toogleAutoScreen = function(status) {
			vm.settings.autoScreen = status;
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