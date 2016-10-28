(function () {
	"use strict";

	angular
		.module('app.candidates', ['ui.grid', 'ui.grid.infiniteScroll', 'ui.grid.selection'])
		.controller('CandidateController', CandidateController)
		.controller('ResumeRoomController', ResumeRoomController)

		CandidateController.$inject = [];
		ResumeRoomController.$inject = ['$state', 'uiGridConstants'];



		function CandidateController(){

		}


		function ResumeRoomController($state, uiGridConstants){

			var vm = this;


			// modern select
			$('#mul_select').chosen();

			var obj = [
				 {
				   "candidateName":"Rahul Shah",
				   "referredBy":"Kamal",
				   "job":"Sr.PHP Developer",
				   "resume":"Rahul_cv.pdf",
				   "time":"7 Sep 2016",
				   "status":"Accept",
				   "confidenceScore":"89"
				 },
				 {
				   "candidateName":"Christopher",
				   "referredBy":"Worley",
				   "job":"UX Designer",
				   "resume":"Chris_resume.doc",
				   "time":"6 Sep 2016",
				   "status":"Interviewed",
				   "confidenceScore":"76"
				 },
				 {
				   "candidateName":"Kristene",
				   "referredBy":"Julida Lawson",
				   "job":"Web Developer",
				   "resume":"Kristen.pdf",
				   "time":"25 May 2016",
				   "status":"Offerred",
				   "confidenceScore":"92"
				 },
				 {
				   "candidateName":"Stuart",
				   "referredBy":"Kristene Scot",
				   "job":"QA Engineer",
				   "resume":"QA_Engg-3yrs.doc",
				   "time":"25 May 2016",
				   "status":"Accepted",
				   "confidenceScore":"90"
				 },
				 {
				   "candidateName":"Lawson",
				   "referredBy":"Will Mark",
				   "job":"iOS Developer",
				   "resume":"lawson.pdf",
				   "time":"20 May 2016",
				   "status":"Accept",
				   "confidenceScore":"86"
				 },{
				   "candidateName":"Brandon",
				   "referredBy":"John Butler",
				   "job":"Android Developer",
				   "resume":"MY_resume.doc",
				   "time":"20 May 2016",
				   "status":"Accept",
				   "confidenceScore":"79"
				 },
				 {
				   "candidateName":"John",
				   "referredBy":"Kristene Scot",
				   "job":"Project Manager",
				   "resume":"John_PM.pdf",
				   "time":"19 May 2016",
				   "status":"Accept",
				   "confidenceScore":"86"
				 },
				 {
				   "candidateName":"Steve",
				   "referredBy":"Armen Hodge",
				   "job":"Fresher",
				   "resume":"Steven.doc",
				   "time":"20 May 2016",
				   "status":"Declined",
				   "confidenceScore":"75"
				 },
				 {
				   "candidateName":"Kristene",
				   "referredBy":"Watson",
				   "job":"iOS Developer",
				   "resume":"Resume.pdf",
				   "time":"23 May 2016",
				   "status":"Unsolicited",
				   "confidenceScore":"64"
				 },
				 {
				   "candidateName":"Chris Ray",
				   "referredBy":"Aryan Todd",
				   "job":"Fresher",
				   "resume":"Chris_cv.pdf",
				   "time":"5 May 2016",
				   "status":"Accept",
				   "confidenceScore":"96"
				 }]

		 	vm.gridOptions = {
			    selectionRowHeaderWidth: 44,
			    rowHeight: 70,
			    enableHorizontalScrollbar: 0,
			    columnDefs : [
		            { name: 'candidateName', displayName: 'Candidate Name', headerTooltip: 'Candidate Name'},
		            { name: 'referredBy', displayName: 'Referred By', headerTooltip: 'Referred By'},
		            { name: 'job', displayName: 'Job/Position', headerTooltip: 'Job/Position'},
		            { name: 'resume', displayName: 'Resume', headerTooltip: 'Resume',
					  cellTemplate: '<div class="ui-grid-cell-contents ui-grid-img-down" ng-click="grid.appScope.downloadResume(row)">{{ COL_FIELD }}</div>'
		            },
		            { name: 'time', displayName: 'Time', headerTooltip: 'Time'},
		            { name: 'status', displayName: 'Status', headerTooltip: 'Status',
		              cellTemplate: 'status-change.html'	
		        	}
		        ],
		        data: obj,
		        appScopeProvider : vm
	  		};


	
	  		this.searchFunc = function(e){
  				if(vm.search.length >= 2){
  					vm.gridOptions = {
  						columnDefs : [
				            { name: 'candidateName', displayName: 'Candidate Name', headerTooltip: 'Candidate Name'},
				            { name: 'referredBy', displayName: 'Referred By', headerTooltip: 'Referred By'},
				            { name: 'job', displayName: 'Job/Position', headerTooltip: 'Job/Position'},
				            { name: 'resume', displayName: 'Resume', headerTooltip: 'Resume',
							  cellTemplate: '<div class="ui-grid-cell-contents ui-grid-img-down" ng-click="grid.appScope.downloadResume(row)">{{ COL_FIELD }}</div>'
				            },
				            { name: 'time', displayName: 'Time', headerTooltip: 'Time'},
				            { name: 'status', displayName: 'Status', headerTooltip: 'Status',
				              cellTemplate: 'status-change.html'	
				        	},
				        	{ name: 'confidenceScore', displayName: 'Confidence Score', headerTooltip : 'Confidence Score',
  								cellTemplate: ' <div class="progress" style="margin:25px 0;"> <div class="progress-bar progress-bar-info progress-bar-striped" style="width:{{COL_FIELD}}%">{{COL_FIELD}}%</div> </div>'}
				        ],
  						data : [
	  						{
							   "candidateName":"John",
							   "referredBy":"Kristene Scot",
							   "job":"Project Manager",
							   "resume":"John_PM.pdf",
							   "time":"19 May 2016",
							   "status":"Accept",
							   "confidenceScore":"86"
							 },
							 {
							   "candidateName":"Steve",
							   "referredBy":"Armen Hodge",
							   "job":"Fresher",
							   "resume":"Steven.doc",
							   "time":"20 May 2016",
							   "status":"Declined",
							   "confidenceScore":"75"
							 },
							 {
							   "candidateName":"Kristene",
							   "referredBy":"Watson",
							   "job":"iOS Developer",
							   "resume":"Resume.pdf",
							   "time":"23 May 2016",
							   "status":"Unsolicited",
							   "confidenceScore":"64"
							 }
						]
					}
  				}
  				else if(vm.search.length == 0){
  					vm.close();
  				}
	  		}

	  		this.close = function(){
	  			vm.gridOptions = {columnDefs : [
		            { name: 'candidateName', displayName: 'Candidate Name', headerTooltip: 'Candidate Name'},
		            { name: 'referredBy', displayName: 'Referred By', headerTooltip: 'Referred By'},
		            { name: 'job', displayName: 'Job/Position', headerTooltip: 'Job/Position'},
		            { name: 'resume', displayName: 'Resume', headerTooltip: 'Resume',
					  cellTemplate: '<div class="ui-grid-cell-contents ui-grid-img-down" ng-click="grid.appScope.downloadResume(row)">{{ COL_FIELD }}</div>'
		            },
		            { name: 'time', displayName: 'Time', headerTooltip: 'Time'},
		            { name: 'status', displayName: 'Status', headerTooltip: 'Status',
		              cellTemplate: 'status-change.html'	
		        	}
		        ],
		  			data : obj
		  		}
	  		}
	  	}




}());