(function () {
	"use strict";

	angular
		.module('app.candidates', ['ui.grid', 'ui.grid.selection'])
		.controller('CandidateController', CandidateController)
		.controller('ResumeRoomController', ResumeRoomController)

		CandidateController.$inject = [];
		ResumeRoomController.$inject = ['$state', '$window', 'uiGridConstants', '$uibModal', '$http', '$q', '$timeout', 'ajaxService', 'App'];



		function CandidateController(){

		}


		function ResumeRoomController($state, $window, uiGridConstants, $uibModal, $http, $q, $timeout, ajaxService, App){

			var vm = this,canceler,
			gridApiCall = App.base_url + 'get_company_all_referrals';

			vm.noCandidates = false;
			vm.loader = false;
			vm.statusOptions = ['Interviewed', 'Offermade', 'Hired'];
			vm.filterOptions = ['Accepted', 'Interviewed', 'Offered', 'Hired', 'Unsolicited', 'Declined']

			vm.applyFilter = applyFilter;
			vm.statusChange = statusChange;
			vm.statusUpdate = statusUpdate;
			vm.awtStatus = awtStatus;
			vm.downloadResume = downloadResume;
			vm.pageChanged = pageChanged;

			// epi search directive
			vm.search_opts= {
				delay: 500,
                progress: false,
                complete: false,
                placeholder:'Search By Job or Status',
                onSearch: function (val) {
                    vm.search_val = val;
                    if (vm.search_opts.progress) {
                        if (vm.search_opts.value) {
                            gridCall(vm.search_val, function(){
		                        vm.search_opts.progress = false;
		                        vm.search_opts.complete = true;
                            });
                        }
                    }
                },
                onClear: function () {
                    vm.search_val = "";
                    gridCall('');
                }
			}

			// filter api call
			function applyFilter(){
				if(vm.filterList != undefined){
					gridCall(vm.search_val);
				}
			}

			// grid function
			vm.gridOptions = {
				rowHeight:70,
				selectionRowHeaderWidth: 44,
				enableHorizontalScrollbar : 0,
				enableSorting:true,
				enableColumnMenus:false,
				enableRowSelection: true,
				enableRowHeaderSelection: true,
				enableFullRowSelection: true,
				data: 'data',
				appScopeProvider : vm // bindin scope to grid
			};

			vm.gridOptions.columnDefs = [
				{ name: 'fullname', displayName: 'CANDIDATE NAME', headerTooltip: 'Candidate Name'},
	            { name: 'referred_by_name', displayName: 'REFERRED BY', headerTooltip: 'Referred By'},
	            { name: 'service_name', displayName: 'JOB/POSITION', headerTooltip: 'Job/Position'},
	            { name: 'resume_name', displayName: 'RESUME', headerTooltip: 'RESUME',
				  cellTemplate: 'download-resume.html'
	            },
	            { name: 'created_at', displayName: 'TIME', headerTooltip: 'Time'},
	            { name: 'one_way_status', displayName: 'STATUS', headerTooltip: 'Status',cellTemplate: 'status-change.html', width: '14%' }
			]

			vm.gridOptions.onRegisterApi = function(gridApi){
		      	gridApi.selection.on.rowSelectionChanged(null,function(row){
			        updateRowSelection(row)
		      	});
			 
		      	gridApi.selection.on.rowSelectionChangedBatch(null,function(rows){
		      		for (var i = 0; i < rows.length; i++) {
		                updateRowSelection(rows[i]);    
		            }
		      	});
		      	vm.gridApi = gridApi;
		    }

		    vm.countArr = [];
		    vm.countHiredVsDeclined = [];
		    function updateRowSelection(row){
		    	var index = vm.countArr.indexOf(row.entity.id);
		    	var indexHireVsDecline = vm.countHiredVsDeclined.indexOf(row.entity.id);
		    	if(row.isSelected){
		    		if(indexHireVsDecline == -1 && (row.entity.one_way_status == 'DECLINED' || row.entity.awt_status == 'HIRED' || row.entity.one_way_status == 'UNSOLICITED' || row.entity.one_way_status == 'PENDING')){
		    			vm.countHiredVsDeclined.push(row.entity.id);	
		    		}else if(index == -1 && (row.entity.one_way_status != 'DECLINED' || row.entity.awt_status != 'HIRED' || row.entity.one_way_status != 'UNSOLICITED' || row.entity.one_way_status != 'PENDING')){
		    			vm.countArr.push(row.entity.id);
		    		}
		    	}
		    	else{
		    		if(index > -1){
		    			vm.countArr.splice(index, 1);
		    		}
		    		if(indexHireVsDecline > -1){
		    			vm.countHiredVsDeclined.splice(indexHireVsDecline, 1);	
		    		}
		    	}
		    	vm.selectionCount = vm.countArr.length + vm.countHiredVsDeclined.length + ' Candidate(s) Selected ';
		    }

		    vm.data = [];
		    vm.gridOptions.data = vm.data;

		    // pagination
		  	function pageChanged(pageNo,search, callBack){
		  		vm.noCandidates = false;
	    		vm.loader = true;

	    		vm.countArr = [];
	    		vm.selectionCount = '';

		    	if(canceler){
		    		canceler.resolve();
		    	}

		    	canceler = $q.defer();

			    var data = $("form[name='filter_form']").serialize();
			    return $http({
	                headers: {
	                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	                },
	                method: 'POST',
	                url: gridApiCall,
	                data: data + '&' + $.param({
	                	search : search,
	                	page_no : pageNo,
	                }),
	                timeout: canceler.promise
	            })
                .then(function(response){
                	vm.loader = false;
		    		if(callBack != undefined){
		    			callBack();
		    		}
                	if(response.data.status_code == 200){
                		vm.gridApi.selection.clearSelectedRows();
			    		if(response.data.data.length == 0){
			    			vm.noCandidates = true;
			    			vm.gridOptions.data = [];
			    		}
				    	else{
				    		vm.gridOptions.data = response.data.data.referrals;
		                	if(pageNo == 1){
		                		vm.totalRecords = response.data.data.total_records;
		                	}
				    	}
			    	}
			    	else if(response.data.status_code == 403){
			    		vm.noCandidates = true;
		    			vm.gridOptions.data = [];
			    	}
			    	else if(response.data.status_code == 400) {
		                $window.location = App.base_url + 'logout';
		            }
                })
		  	}

		  	$timeout(function(){
		  		pageChanged('1', '');
		  	})

		    function gridCall(val, callBack){
		    	pageChanged('1', val, callBack);
		    }


		    function statusChange(option){
		    	if(canceler){
		    		canceler.resolve();
		    	}

		    	canceler = $q.defer();

		    	$http({
	                headers: {
	                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	                },
	                method: 'POST',
	                url: App.base_url + 'multiple_awaiting_action',
	                data: $.param({
	                	id : vm.countArr,
	                	awaiting_action_status : option
	                }),
	                timeout: canceler.promise
	            })
	            .then(function(response){
	            	if(response.data.status_code == 200){
            			angular.forEach(vm.gridOptions.data, function(data, index){
	            			angular.forEach(vm.countArr, function(list, indx){
	            				if(vm.gridOptions.data[index].id == list){
	            					if(option == 'Interviewed' && vm.gridOptions.data[index].awt_status== 'ACCEPTED'){
	            						vm.gridOptions.data[index].awt_status = response.data.data.awt_status;
	            					}
	            					if(option == 'Offermade' && vm.gridOptions.data[index].awt_status== 'INTERVIEWED'){
	            						vm.gridOptions.data[index].awt_status = response.data.data.awt_status;
	            					}
	            					if(option == 'Hired' && vm.gridOptions.data[index].awt_status== 'OFFERMADE'){
	            						vm.gridOptions.data[index].awt_status = response.data.data.awt_status;
	            					}
	            				}
	            			});
	            		})
	            		vm.status = '';
	            		vm.gridApi.selection.clearSelectedRows();
	            	}
	            })
		    }

		    function statusUpdate(row, flag, e){
		    	flag = flag == 1 ? 'ACCEPTED' : 'DECLINED'

		    	if(flag == 'DECLINED'){
		    		$uibModal.open({
	                    animation: false,
	                    backdrop: 'static',
	                    keyboard: false,
	                    templateUrl: 'templates/dialogs/referral_status.phtml',
	                    openedClass: "referral-status",
	                    resolve: {
	                        referralObj: function() {
	                            var referralObj = row.entity;
	                            referralObj.tabName = 1;
	                            referralObj.ajaxFunCall = pageChanged;
	                            return referralObj;
	                        }
	                    },
	                    controller: 'ReferralStatus',
	                    controllerAs: "refStatus"
	                });
	                return;
		    	}
		    	vm.loader = true;
		    	var ajax = ajaxService.async(row.entity, flag);
	            ajax.success(function(response){
	            	vm.loader = false;
	                if(response.status_code == 200){
	                    var match = row.entity.id;
		                angular.forEach(vm.gridOptions.data, function( row, index){
					    	if(vm.gridOptions.data[index].id == match){
					    		vm.gridOptions.data[index].one_way_status = response.data.one_way_status;
					    		vm.gridOptions.data[index].awt_status = response.data.one_way_status;
					    		return false;
					    	}
					  	});
					  	vm.gridApi.selection.clearSelectedRows();
	                }
	                else if(response.status_code == 400){
	                    $window.location = CONFIG.APP_DOMAIN+'logout';
	                }
	                
	            })
		    }

		    function awtStatus(row){
		    	return row.entity.awt_status;
		    }

		    function downloadResume(row){
		    	return row.entity.resume_path;
		    }

	  	}




}());