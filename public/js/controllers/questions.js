(function () {
  "use strict";

  angular
    .module('app.questions', ['ui.grid', 'ui.grid.selection'])

	.controller('QuestionsListController', QuestionsListController)
    .controller('CreateQuestionController', CreateQuestionController)


 	QuestionsListController.$inject = [];
  	CreateQuestionController.$inject = [];


	function QuestionsListController() {
		
		var vm = this;

		this.grid = {
			inProgress: false,
			responseMsg: null,
			totalRecords: 100
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
			{ name: 'all_questions', displayName: 'ALL QUESTIONS', width: '60%' },
			{ name: 'type', displayName: 'TYPE' },
			{ name: 'score', displayName: 'SCORE' },
			{ name: 'actions', displayName: 'ACTIONS' }
		];

		this.gridOptions.onRegisterApi = function (gridApi) {
			gridApi.selection.on.rowSelectionChanged(null, function (row) {

			});

			gridApi.selection.on.rowSelectionChangedBatch(null, function (rows) {

			});

			vm.gridApi = gridApi;
		}


		function init() {
			vm.gridOptions.data = [{ all_questions: 'What is Java?', type: 'Multiple Choice', score: 5, actions:'5822'}];
		}


		init();
		
	}


	function CreateQuestionController() {

		var vm = this;
		
		this.questionTypes = ['Multiple Choice Questions', 'Subjective Type'];
		this.tags = [{ name: 'Software Developer', id: 23 }, { name: 'Freshers', id: 23 }];
		this.selectedTags = [];

		this.showAnswerOptions = 4;
		this.answerOptionsList = [{ label: 'A' }, { label:'B' }, { label:'C' }, { label:'D' }, { label:'E' }, { label:'F' }];

		this.addAnswerOption = function() {
			vm.showAnswerOptions++;
		}

		this.trashAnswerOption = function() {
			vm.showAnswerOptions--;
		}
		
	}

}());