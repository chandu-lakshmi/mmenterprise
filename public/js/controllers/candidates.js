(function () {
	"use strict";

	angular
		.module('app.candidates', ['ui.grid', 'ui.grid.infiniteScroll', 'ui.grid.selection'])
		.controller('CandidateController', CandidateController)
		.controller('ResumeRoomController', ResumeRoomController)

		CandidateController.$inject = [];
		ResumeRoomController.$inject = ['$state', '$window', 'uiGridConstants', '$http', '$q', '$timeout', 'App'];



		function CandidateController(){

		}


		function ResumeRoomController($state, $window, uiGridConstants, $http, $q, $timeout, App){

			var vm = this,canceler,
			gridApiCall = App.base_url + 'get_company_all_referrals';

			vm.noCandidates = false;
			vm.loader = false;
			vm.searchLoader = false;
			vm.statusOptions = ['Default', 'Active', 'Inactive', 'Declined'];

			vm.searchFilter = searchFilter;
			vm.applyFilter = applyFilter;
			vm.clear = clear;

			vm.statusUpdate = statusUpdate;
			vm.downloadResume = downloadResume;


			// checkboxes
			/*vm.unsolicited = false;
			vm.declined = false;
			vm.selectedType = [];
			vm.selectedStatus = [];
			vm.accepted = [
				{id: 1, label: 'Interviewed', name: 'interviewed'},
				{id: 2, label: 'Hired', name: 'hired'},
			]
			vm.status = [
				{id: 1, label: 'Open', name: 'open'},
				{id: 2, label: 'Close', name: 'close'}
			]
			vm.toggle = toggle;
			vm.exists = exists;
			vm.isChecked = isChecked;
			vm.toggleAll = toggleAll;

			function toggle(item, list){
				var idx = list.indexOf(item);
			    if (idx > -1) {
			      	list.splice(idx, 1);
			    }
			    else {
			      	list.push(item);
			    }
			}
			function exists(item, list) {
    			return list.indexOf(item) > -1;
  			};
  			function isChecked(obj, arr){
				return vm[arr].length === vm[obj].length;
			}
			function toggleAll(obj, arr){
				if (vm[arr].length === vm[obj].length) {
			      	vm[arr] = [];
			    }
			    else if (vm[arr].length === 0 || vm[arr].length > 0) {
			      	vm[arr] = vm[obj].slice(0);
			    }
			}*/

			// modern select
			$('select[data-rel="chosen"]').chosen();

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
				/*multiSelect: false,
				modifierKeysToMultiSelect: false,
				noUnselect: true,*/
				infiniteScrollRowsFromEnd: 8,
				infiniteScrollUp:true,
				infiniteScrollDown:true,
				data: 'data',
				appScopeProvider : vm // bindin scope to grid
			};

			vm.gridOptions.columnDefs = [
				{ name: 'fullname', displayName: 'CANDIDATE NAME', headerTooltip: 'Candidate Name'},
	            { name: 'referred_by', displayName: 'REFERRED BY', headerTooltip: 'Referred By'},
	            { name: 'service_name', displayName: 'JOB/POSITION', headerTooltip: 'Job/Position'},
	            { name: 'resume_name', displayName: 'RESUME', headerTooltip: 'RESUME',
				  cellTemplate: 'download-resume.html'
	            },
	            { name: 'created_at', displayName: 'TIME', headerTooltip: 'Time'},
	            { name: 'one_way_status', displayName: 'STATUS', headerTooltip: 'Status',cellTemplate: 'status-change.html', width: '14%' }
			]

			vm.gridOptions.onRegisterApi = function(gridApi){
		      	gridApi.infiniteScroll.on.needLoadMoreData(null, vm.getDataDown);
		      	gridApi.infiniteScroll.on.needLoadMoreDataTop(null, vm.getDataUp);
		      	/*if(userPermissions.run_campaign == 1){
		      		gridApi.selection.on.rowSelectionChanged(null, vm.editCampaigns);
		      	}*/
		      	gridApi.selection.on.rowSelectionChanged(null,function(row){
			        updateRowSelection(row)
		      	});
			 
		      	gridApi.selection.on.rowSelectionChangedBatch(null,function(rows){
			        for(var i = 0; i < rows.length; i++){
			        	updateRowSelection(rows[i]);
			        }
		      	});
		      	vm.gridApi = gridApi;
		    }

		    vm.countArr = [];
		    function updateRowSelection(row){
		    	var index = vm.countArr.indexOf(row.entity.id);
		    	if(row.isSelected){
		    		if(index == -1){
		    			vm.countArr.push(row.entity.id);
		    		}
		    	}
		    	else{
		    		if(index > -1){
		    			vm.countArr.splice(index, 1);
		    		}
		    	}
		    	vm.selectionCount = vm.countArr.length + ' Candidate(s) Selected ';
		    }

		    vm.data = [];
		    vm.gridOptions.data = vm.data;


		  	vm.count = 0;
		    function resetGrid(){
			    vm.firstPage = 0;
	  			vm.lastPage = 0;
			  	vm.pageNo = 1;
			  	vm.totalPages = 1;
			  	vm.noCandidates = false;
			  }

		    vm.getFirstData = function(search, searchLoader) {
		    	resetGrid();
		    	if(searchLoader){
		    		vm.searchLoader = true;
		    	}
		    	else{
		    		vm.searchLoader = false;
		    		vm.loader = true;
		    	}

		    	if(canceler){
		    		canceler.resolve();
		    	}

		    	canceler = $q.defer();

			    var data = $("form[name='candidates_filter_form']").serialize();
			    return $http({
	                headers: {
	                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	                },
	                method: 'POST',
	                url: gridApiCall,
	                data: data + '&' + $.param({
	                	search : search,
	                	page_no : vm.pageNo,
	                }),
	                timeout: canceler.promise
	            })
                .then(function(response){
                	vm.loader = false;
                	vm.searchLoader = false;
                	if(response.data.status_code == 200){
			    		if(response.data.data.length == 0){
			    			vm.noCandidates = true;
			    			vm.gridOptions.data = [];
			    		}
				    	else{
				    		vm.gridOptions.data = response.data.data.referrals;
				    		vm.count = response.data.data.count;
		                	vm.totalRecords = response.data.data.total_records;
		            		vm.totalPages = Math.ceil(vm.totalRecords / 10);
				    	}
			    	}
			    	else if(response.data.status_code == 403){
			    		vm.noCandidates = true;
		    			vm.gridOptions.data = [];
			    	}
			    	else if(response.data.status_code == 400) {
		                $window.location = CONFIG.APP_DOMAIN + 'logout';
		            }
                })
			};

			vm.getDataDown = function() {
			    vm.pageNo++;
			    var data = $("form[name='filter_form']").serialize();
			    vm.loader = true;
			    return $http({
	                headers: {
	                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	                },
	                method: 'POST',
	                url: gridApiCall,
	                data: data + '&' + $.param({
	                	search : vm.search,
	                	page : vm.pageNo
	                })
	            })
                .then(function(response){
                	vm.loader = false;
                	if(response.data.status_code == 200){
                		vm.lastPage++;
                		vm.count = response.data.data.count;
	                	vm.gridApi.infiniteScroll.saveScrollPercentage();
	                	vm.gridOptions.data = vm.gridOptions.data.concat(response.data.data.referrals);
	                	return vm.gridApi.infiniteScroll.dataLoaded(vm.firstPage > 0, vm.lastPage < vm.totalPages - 1).then(function() {
	                		//vm.checkDataLength('up');
	                	});
                	}
                	else if(response.data.status_code == 400) {
		                $window.location = CONFIG.APP_DOMAIN + 'logout';
		            }
                })
                .catch(function(error) {
			      	return vm.gridApi.infiniteScroll.dataLoaded();
			    })
		  	};

		  	function init(search, searchLoader){
		  		vm.getFirstData(search, searchLoader).then(function(){
	    			$timeout(function() {
				      	// timeout needed to allow digest cycle to complete,and grid to finish ingesting the data
				      	// you need to call resetData once you've loaded your data if you want to enable scroll up,
				      	// it adjusts the scroll position down one pixel so that we can generate scroll up events
	      				vm.gridApi.infiniteScroll.resetScroll( vm.firstPage > 0, vm.lastPage < vm.totalPages - 1 );
	    			});
	    		})
		  	}

		  	$timeout(function(){
		  		init('', false);
		  	})

	  		var clearFilterBol = false,
		  	applyFilterBol = false;
		    function applyFilter(search, searchLoader){
		    	if(!searchLoader){
		    		if(vm.selectedType.length || vm.selectedStatus.length || vm.unsolicited || vm.declined || applyFilterBol){
				    	init(search, searchLoader);
				    	clearFilterBol = true;
				    	applyFilterBol = false;	
			    	}
		    	}
		    	else{
		    		init(search, searchLoader);
		    	}
		    }


  			var inputPrev = "";
	  		function searchFilter(val, event){
		    	val = val || '';
		        if(event.keyCode === 32 && val.length === 0 || inputPrev == val){
		            return false;
		        }
		        inputPrev = val;

		    	if(val.length >= 2){
		    		vm.applyFilter(val, true);
		    	}
		    	else if(val.length == 0){
		    		vm.applyFilter('', true)
		    	}
	  		}

	  		function clear(val, searchLoader){
		    	vm.selectedType = [];
				vm.selectedStatus = [];
				vm.unsolicited = false;
				vm.declined = false;
		    	if(clearFilterBol){
		    		applyFilterBol = true;
		    		setTimeout(function(){applyFilter(val, searchLoader);clearFilterBol = false;},100);
		    	}	
		    }

		    function statusUpdate(row, flag){
		    	console.log(row)
		    }

		    function downloadResume(row){
		    	console.log(row)
		    }

	  	}




}());