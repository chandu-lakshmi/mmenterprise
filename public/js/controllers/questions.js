(function () {
  "use strict";

  angular
    .module('app.questions', ['ui.grid', 'ui.grid.selection'])

	.controller('QuestionsListController', QuestionsListController)
    .controller('CreateQuestionController', CreateQuestionController)
    .controller('QuestionAddController', QuestionAddController)


    QuestionsListController.$inject  = ['$q', '$timeout', '$mdToast','$uibModal', '$http', '$window', 'App'];
	CreateQuestionController.$inject = ['$scope', '$stateParams', '$timeout', '$state', '$http', '$window', '$mdToast', 'EditTestService', 'App'];
	QuestionAddController.$inject = ['$scope', '$stateParams', '$timeout', '$state', '$http', '$window', '$mdToast', 'EditTestService', 'App'];


	function QuestionsListController($q, $timeout, $mdToast, $uibModal, $http, $window, App) {
		
        var vm = this
        
        this.selectedQuestions = [];

        this.filterOptions = [
            { name: 'Question Type', children: [{ label: 1, value: 'Multiple Choice Questions' }, { label: 0, value: 'Subjective type' }] }
        ];

		this.grid = {
            pageNo : 1,
            filter : [],
            search : null,
			inProgress  : false,
            responseMsg : null,
            totalRecords: 0
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
			{ name: 'question_type', displayName: 'TYPE' },
			{ name: 'question_value', displayName: 'SCORE', width: '10%'},
			{ name: 'question_id', displayName: 'ACTIONS', width: '15%', cellTemplate: 'action.html', cellClass: 'action-view'}
		];

		this.gridOptions.onRegisterApi = function (gridApi) {
			
            gridApi.selection.on.rowSelectionChanged(null, function (row) {
                updateQuestionSelection(row);
            });
            
			gridApi.selection.on.rowSelectionChangedBatch(null, function (rows) {
                if (vm.grid.inProgress){
                    return;
                }
                angular.forEach(rows, function(row){
                    updateQuestionSelection(row)
                });
			});

			vm.gridApi = gridApi;
        }
        
        function updateQuestionSelection(row) {
            var index = vm.selectedQuestions.indexOf(row.entity.question_id);
            if (row.isSelected) {
                if (index == -1) {
                    vm.selectedQuestions.push(row.entity.question_id);
                }
            } else {
                if (index > -1) {
                    vm.selectedQuestions.splice(index, 1);
                }
            }
        }

		this.deleteQuestion = function (id) {
            var textMsgSecond = "delete Question ?",
                questionIds   = [id];

            if(!id) {
                textMsgSecond = "delete selected Questions?";
                questionIds   = vm.selectedQuestions;
            }

			$uibModal.open({
				animation: false,
				backdrop: 'static',
				keyboard: false,
				templateUrl: 'templates/dialogs/common-confirm-msg.phtml',
				openedClass: "referral-status confirm-message",
				resolve: {
					paramsMdService: function () {
						return {
							firstMsg: 'Are you sure you want to ',
                            secondMsg: textMsgSecond,
                            params: { question_id: questionIds},
							apiEndPoint: 'delete_question',
							callback: deleteQeustionCallback
						};
					}
				},
				controller: 'CommonConfirmMessage',
				controllerAs: 'CommonConfirmMsgCtrl'
			})
		}

        var canceler;
        this.getQuestionList = function () {

            if (canceler) {
                canceler.resolve();
            }

            canceler = $q.defer();

            var apiKeys = $.param({
                page_no: vm.grid.pageNo,
                filter: vm.grid.filter,
                search: vm.grid.search
            });
            
            vm.grid.inProgress = true;

            $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                data: apiKeys,
                url: App.base_url + 'get_questions_list',
                timeout: canceler.promise
            })
            .then(function (response) {
                if (response.data.status_code == 200) {
                    vm.gridOptions.data = response.data.data.questions_list;
                    vm.gridApi.selection.clearSelectedRows();
                    $timeout(function(){
                        angular.forEach(vm.gridOptions.data, function (row, index) {
                            if (vm.selectedQuestions.indexOf(row.question_id) > -1) {
                                vm.gridApi.selection.selectRow(vm.gridOptions.data[index]);
                            }
                        });
                    })
                }
                else if (response.data.status_code == 403) {
                    vm.gridOptions.data = [];
                    vm.grid.responseMsg = response.data.message.msg[0];
                }
                else if (response.data.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }
                vm.grid.inProgress = false;
                vm.grid.totalRecords = response.data.data.total_records;
            });
        }

        var prevSelectedVal = [];
        this.applyFilter = function () {

            if (prevSelectedVal.toString() == vm.grid.filter.toString()) {
                return;
            }
            prevSelectedVal = vm.grid.filter;
            vm.getQuestionList();

        }

        this.search_opts = {
            delay: 500,
            progress: false,
            complete: false,
            placeholder: 'Search by Question',
            onSearch: function (val) {
                vm.grid.search = val;
                vm.getQuestionList();
                vm.search_opts.progress = false;
                vm.search_opts.complete = true;
            },
            onClear: function () {
                vm.search_val = "";
                vm.grid.search = null;
                vm.getQuestionList();
            }
        }


		function init() {
			vm.getQuestionList();
		}

		function deleteQeustionCallback(response) {
            vm.selectedQuestions = [];
            vm.grid.pageNo = 1;
            vm.getQuestionList();
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


	function CreateQuestionController($scope, $stateParams, $timeout, $state, $http, $window, $mdToast, EditTestService, App) {
		
		var vm = this;

		this.alphabet      = ['A', 'B', 'C', 'D', 'E', 'F'];
		this.textMode      = "Create Question";
		this.examDetails   = EditTestService.getData();

		this.questionObj = {
			type  : null,
			answerOpts : null,
			libraries : [],
			options: [
				{ option: null, is_correct_answer:0 },
				{ option: null, is_correct_answer:0 },
				{ option: null, is_correct_answer:0 },
				{ option: null, is_correct_answer:0 }
			]
		};
		this.copyQuestionObj = angular.copy(vm.questionObj);
		this.enableViewMode = $stateParams.mode == 'view';

		this.postQuestionInProgressSave = false;
		this.postQuestionInProgressAdd  = false;
		this.postQuestionSubmitted      = false;
		
		if ($stateParams.mode == 'view'){
			this.textMode = "View Question";
		} else if ($stateParams.mode == 'edit') {
			this.textMode = "Edit Question";
		}

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

		this.trashAnswerOption = function($index) {
			prevAnswerIndex = null;
			this.questionObj.options.pop();
			if ($index > 3 && ['E', 'F'].indexOf(vm.questionObj.answerOpts) != -1) {
				vm.questionObj.answerOpts = null;
			}
		}

		this.removeSeletedOpt = function(text, index) {
			if (index > 1 && !text.length && ['C', 'D', 'E', 'F'].indexOf(vm.questionObj.answerOpts) != -1) {
				vm.questionObj.answerOpts = null;
			}
		}

		this.postQuestion = function(form, btnFrom) {
			
			vm.postQuestionSubmitted = true;
			
			if (vm.questionObj.question_type == 1 && !vm.questionObj.answerOpts){
				return;
			}

			if (form.$valid) {

				var tempObj = { libraries: angular.copy(vm.questionObj.libraries) },
					tempFrmData = $("form[name='questionForm'] :not('.hide-from-frm')").serialize();

				if ($stateParams.mode == 'edit') {
					tempObj.question_id = $stateParams.id;
				}

				if (vm.questionObj.question_type == 1) {
					var tempOpts = [];
					angular.forEach(vm.questionObj.options, function (questionOption){
						if (questionOption.option) {
							tempOpts.push(questionOption);
						}
					});
					tempObj.options = tempOpts;
				}

				if (btnFrom == "addAnother") {
					this.postQuestionInProgressAdd = true;
				} else {
					this.postQuestionInProgressSave = true;
				}

				var apiKeys = tempFrmData + '&' + $.param(tempObj);

				if ($stateParams.examId) {
					createQustionExamMode(apiKeys, btnFrom);
				}
				else{
					createQustionNormalMode(apiKeys, btnFrom);
				}
			}
		}


		function init() {
			getAPI();
			if ($stateParams.id != 0) {
				getQuestion();
			}
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

		function getQuestion() {

			vm.qestionViewEditInProgress = true;

			var apiKeys = $.param({ question_id :$stateParams.id});

			$http({
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				method: 'POST',
				data: apiKeys,
				url: App.base_url + 'view_question',
			})
			.then(function (response) {
				if (response.data.status_code == 200) {
					vm.qestionViewEditInProgress = false;
					vm.questionObj = angular.copy(response.data.data)
				}
				else if (response.data.status_code == 400) {
					$window.location = App.base_url + 'logout';
				}
			});
		}
		
		function createQustionNormalMode(apiKeys, btnFrom) {

			var apiEndPoint = 'add_question';

			if ($stateParams.mode == 'edit') {
				apiEndPoint = 'edit_question';
			}

			$http({
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				method: 'POST',
				data: apiKeys,
				url: App.base_url + apiEndPoint,
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
					$timeout(function () {
						if (btnFrom == "goList") {
							$state.go('app.campaigns.QuestionsList');
						} else {
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

		function createQustionExamMode(apiKeys, btnFrom) {
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

					if (btnFrom == "goList") {
						addQuestionExam(response.data.data, "EditTest");
					} else {
						vm.postQuestionSubmitted = false;
						vm.postQuestionInProgressSave = false;
						vm.postQuestionInProgressAdd = false;
						addQuestionExam(response.data.data, "createAnother");
						vm.searchText = null;
						vm.questionObj = angular.copy(vm.copyQuestionObj);
					}
					
				}
				else if (response.data.status_code == 400) {
					$window.location = App.base_url + 'logout';
				}
			});
		}
		
		function addQuestionExam(question, stateGo) {
            
			var apiKeys = $.param({
				exam_id: $stateParams.examId,
                question_id: question.id,
                question_value : question.question_value
			});
			
			$http({
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				method: 'POST',
				data: apiKeys,
				url: App.base_url + 'add_edit_exam_question',
			})
			.then(function (response) {
				if (response.data.status_code == 200) {
					
					$mdToast.show({
						hideDelay: 3000,
						position: 'top right',
						template: '<md-toast class="mm-toast"><div class="md-toast-text" flex><i class="material-icons">done</i><div class="text"><div class="toast-succ">Success!</div><div class="succ-text">' + response.data.message.msg[0] + '</div></div></div></md-toast>'
					});

					if (stateGo == "EditTest") {
						$state.go('app.campaigns.EditTest', { id: $stateParams.examId });
					}
					
				}
				else if (response.data.status_code == 400) {
					$window.location = App.base_url + 'logout';
				}
			});
		}

        init();
        
        $scope.$on('$destroy', function(){
            EditTestService.setData(null);
        });
	}


	function QuestionAddController($scope, $stateParams, $timeout, $state, $http, $window, $mdToast, EditTestService, App) {

		var vm     = this,
			examId = $stateParams.examId;

        this.selectedQuestionsId   = [];
        this.selectedQuestionsArr  = [];
        this.addQuestionInProgress = false;
		this.testDetails = EditTestService.getData();
		this.grid = {
            pageNo : 1,
			inProgress: false,
			responseMsg: null
		};
		this.gridOptions = {
			rowHeight: 70,
			selectionRowHeaderWidth: 44,
			enableHorizontalScrollbar: 0,
			enableSorting: true,
			enableColumnMenus: false,
			enableRowSelection: false,
			enableRowHeaderSelection: true,
			enableFullRowSelection: true,
			data: [],
			appScopeProvider: vm // bindin scope to grid
		};
		this.gridOptions.columnDefs = [
			{ name: 'question', displayName: 'QUESTIONS', width: '52%' },
			{ name: 'question_type', displayName: 'TYPE' },
			{ name: 'question_value', displayName: 'SCORE', width: '10%' },
			{ name: 'question_id', displayName: 'ACTION', width: '15%', cellTemplate: 'action.html', cellClass: 'action-view' }
		];

        this.gridOptions.onRegisterApi = function (gridApi) {

            gridApi.selection.on.rowSelectionChanged(null, function (row) {
              
                updateQuestionSelection(row);
            });

            gridApi.selection.on.rowSelectionChangedBatch(null, function (rows) {
                if (vm.grid.inProgress) {
                    return;
                }
                angular.forEach(rows, function (row) {
                    updateQuestionSelection(row)
                });
            });

            vm.gridApi = gridApi;
        }

        this.gridOptions.isRowSelectable = function (row) {
            return vm.prevSelectedQuestions.indexOf(row.entity.question_id) == -1;
        }

        function updateQuestionSelection(row) {

            var index = vm.selectedQuestionsId.indexOf(row.entity.question_id);
            if (row.isSelected) {
                if (index == -1) {
                    vm.selectedQuestionsId.push(row.entity.question_id);
                    vm.selectedQuestionsArr.push(row.entity);
                }
            } else {
                if (index > -1) {
                    vm.selectedQuestionsId.splice(index, 1);
                    vm.selectedQuestionsArr.splice(index, 1);
                }
            }
        }

		this.addQuestion = function(row) {
			
            
            if(row) {
                //single
                vm.prevSelectedQuestions.push(row.entity.question_id);
                var tempObj = {
                    question_id: row.entity.question_id,
                    question_value: row.entity.question_value
                };
                var apiKeys = $.param({ exam_id: examId, exam_question_arr: [tempObj] });
            } 
            else{ 
                //multiple
                vm.addQuestionInProgress = true;
                vm.prevSelectedQuestions = vm.prevSelectedQuestions.concat(vm.selectedQuestionsId);

                var tempArr = [];
                angular.forEach(vm.selectedQuestionsArr, function(row){
                    var tempObj = {};
                    tempObj.question_id = row.question_id;
                    tempObj.question_value = row.question_value;
                    tempArr.push(tempObj)
                });
                var apiKeys = $.param({ exam_id: examId, exam_question_arr : tempArr});
            }
			

			$http({
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				method: 'POST',
				data: apiKeys,
				url: App.base_url + 'add_edit_exam_question',
			})
			.then(function (response) {
				if (response.data.status_code == 200) {

					$mdToast.show({
						hideDelay: 3000,
						position: 'top right',
						template: '<md-toast class="mm-toast"><div class="md-toast-text" flex><i class="material-icons">done</i><div class="text"><div class="toast-succ">Success!</div><div class="succ-text">' + response.data.message.msg[0] + '</div></div></div></md-toast>'
                    });
                    vm.addQuestionInProgress = false;
                    vm.selectedQuestionsArr  = [];
                    vm.selectedQuestionsId   = [];
                    vm.gridApi.selection.clearSelectedRows();
				}
				else if (response.data.status_code == 400) {
					$window.location = App.base_url + 'logout';
				}
			});

			/* $timeout(function(){
				//vm.testDetails.exam_question_list.push(row.entity);
				$state.go('app.campaigns.EditTest', { id: examId });
			}, 1000); */
		}

        this.getQuestionList = function () {

            var apiKeys = $.param({ page_no: vm.grid.pageNo });

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
                    vm.gridOptions.data = response.data.data.questions_list;
                    vm.gridApi.selection.clearSelectedRows();
                    $timeout(function () {
                        angular.forEach(vm.gridOptions.data, function (row, index) {
                            if (vm.selectedQuestionsId.indexOf(row.question_id) > -1) {
                                vm.gridApi.selection.selectRow(vm.gridOptions.data[index]);
                            }
                        });
                    })
                }
                else if (response.data.status_code == 403) {
                    vm.gridOptions.data = [];
                    vm.grid.responseMsg = response.data.message.msg[0];
                }
                else if (response.data.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }
                vm.grid.inProgress = false;
                vm.grid.totalRecords = response.data.data.total_records;
            });
        }


		function init() {

			vm.getQuestionList();

			vm.prevSelectedQuestions = [];
			angular.forEach(vm.testDetails.exam_question_list, function (question) {
				vm.prevSelectedQuestions.push(question.question_id);
            });
            
		}

		if (!vm.testDetails) {
			$state.go('app.campaigns.EditTest', { id: examId });
		} else {
			init();
		}
        
        
        $scope.$on('$destroy', function () {
            EditTestService.setData(null);
        });

	}

}());

