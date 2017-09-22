(function () {
  "use strict";

  angular
    .module('app.questions', ['ui.grid', 'ui.grid.selection'])

	.controller('QuestionsListController', QuestionsListController)
    .controller('CreateQuestionController', CreateQuestionController)


 	QuestionsListController.$inject = ['$http', '$window', 'App'];
	CreateQuestionController.$inject = ['$timeout', '$state', '$http', '$window', '$mdToast', 'App'];


	function QuestionsListController($http, $window, App) {
		
		var vm = this;

		this.grid = {
			pageNo      : 1,
			inProgress  : false,
			responseMsg : null
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
			{ name: 'question', displayName: 'ALL QUESTIONS', width: '52%' },
			{ name: 'question_type_name', displayName: 'TYPE' },
			{ name: 'question_value', displayName: 'SCORE', width: '10%'},
			{ name: 'actions', displayName: 'ACTIONS', width: '15%', cellTemplate: 'action.html', cellClass: 'action-view'}
		];

		this.gridOptions.onRegisterApi = function (gridApi) {
			
			gridApi.selection.on.rowSelectionChanged(null, function (row) {

			});

			gridApi.selection.on.rowSelectionChangedBatch(null, function (rows) {

			});

			vm.gridApi = gridApi;
		}

		this.pageChanged = function(pageNo) {
			vm.grid.pageNo = pageNo;
			getQuestionList();
		}

		function init() {
			getQuestionList();
		}

		function getQuestionList() {

			var apiKeys = $.param({ page_no:vm.grid.pageNo });
			vm.grid.inProgress = true;

			$http({
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				method: 'POST',
				data: apiKeys,
				url: App.base_url + 'get_questions_list',
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
				vm.grid.inProgress   = false;
				vm.grid.totalRecords = vm.gridOptions.data.length;
			});
		}

		init();
		
	}


	function CreateQuestionController($timeout, $state, $http, $window, $mdToast, App) {

		var vm = this;
		

		this.alphabet = ['A', 'B', 'C', 'D', 'E', 'F'];
		this.questionObj = {
			type  : null,
			answerOpts : null,
			selectedTags : [],
			options: [
				{ option: null, is_correct_answer:0 },
				{ option: null, is_correct_answer:0 },
				{ option: null, is_correct_answer:0 },
				{ option: null, is_correct_answer:0 }
			]
		};
		this.copyQuestionObj = angular.copy(vm.questionObj);

		this.postQuestionInProgressSave = false;
		this.postQuestionInProgressAdd  = false;
		this.postQuestionSubmitted      = false;

		var prevAnswerIndex;
		this.getCorrectAnswer = function(isCorrect, index) {
			if (isCorrect) {
				prevAnswerIndex = index;
				vm.questionObj.answerOpts = vm.alphabet[index];
			}
		}

		this.setCorrectAnswer = function(index) {
			if (prevAnswerIndex) {
				vm.questionObj.options[prevAnswerIndex].is_correct_answer = 0;
			}
			vm.questionObj.options[index].is_correct_answer = 1;
			prevAnswerIndex = index;
		}

		this.addAnswerOption = function() {
			if (this.questionObj.options.length < 6) {
				this.questionObj.options.push({ option:null, is_correct_answer:0 });
			}
		}

		this.trashAnswerOption = function() {
			prevAnswerIndex = null;
			this.questionObj.options.pop();
		}

		this.postQuestion = function(form, status) {
			
			vm.postQuestionSubmitted = true;
			
			if (vm.questionObj.type == 1 && !vm.questionObj.answerOpts){
				return;
			}

			if (form.$valid) {

				if (status == "addAnother") {
					this.postQuestionInProgressAdd = true;
				} else {
					this.postQuestionInProgressSave = true;
				}

				var tempObj = { libraries: angular.copy(vm.questionObj.selectedTags) },
					tempFrmData = $("form[name='questionForm'] :not('.hide-from-frm')").serialize()

				if (vm.questionObj.type == 1) {
					tempObj.options = vm.questionObj.options;
				}

				var apiKeys = tempFrmData + '&' + $.param(tempObj);

				$http({
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					},
					method: 'POST',
					data: apiKeys,
					url: App.base_url + 'add_question',
				})
				.then(function (response) {
					if (response.data.status_code == 200) {
						
						vm.postQuestionSubmitted      = false;
						vm.postQuestionInProgressSave = false;
						vm.postQuestionInProgressAdd  = false;
						
						$mdToast.show({
							hideDelay: 3000,
							position: 'top right',
							template: '<md-toast class="mm-toast"><div class="md-toast-text" flex><i class="material-icons">done</i><div class="text"><div class="toast-succ">Success!</div><div class="succ-text">' + response.data.message.msg[0] + '</div></div></div></md-toast>'
						});
						
						$timeout(function(){
							if (status == "addAnother") {
								$state.go('app.campaigns.QuestionsList');
							} else{
								vm.searchText = null;
								vm.questionObj = angular.copy(vm.copyQuestionObj);
							}
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
				headers : {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				method  : 'POST',
				url     : App.base_url + 'get_question_types',
			})
			.then(function (response) {
				if (response.status == 200) {				
					vm.questionTypesList = response.data.data;
				}
				else if (response.data.status_code == 400) {
					$window.location = App.base_url + 'logout';
				}
			});

			$http({
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				method: 'POST',
				url: App.base_url + 'get_question_libraries',
			})
			.then(function (response) {
				if (response.status == 200) {
					vm.tagsList = response.data.data;
				}
				else if (response.data.status_code == 400) {
					$window.location = App.base_url + 'logout';
				}
			});


		}


		init();
	}

}());