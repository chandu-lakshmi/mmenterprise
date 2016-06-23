(function () {
"use strict";

angular.module('app.import.contacts', ['ui.grid' ,'ui.grid.selection','ui.grid.infiniteScroll'])

.controller('ImportContactsController', ['$state', '$window', function ($state, $window) {
  this.selectFile = function(){
      $window.scrollTo(0,0);
      $state.go('importContactsList');
      
  }
  this.backToCompleteProfile = function() {
      $window.scrollTo(0,0);
      $state.go('companyProfile');
  }
}])


.controller('ImportContactsListController', ['$rootScope','$window', '$state', '$scope', '$http', '$log', '$timeout', 'uiGridConstants','$uibModal', function ($rootScope, $window, $state, $scope, $http, $log, $timeout, uiGridConstants, $uibModal) {

  // $http.get('public/js/controllers/app.json')
  //   .success(function(data) {
  //     $scope.gridOptions.data = data;
  //     $scope.gridOptions.minRowsToShow = data.length;
  //       $timeout(function() {
  //       if($scope.gridApi.selection.selectRow){
  //         $scope.gridApi.selection.selectRow($scope.gridOptions.data[0]);
  //       }
  //     });
  //   });

  // $scope.gridOptions = {
  //   enableRowSelection: true,
  //   enableHorizontalScrollbar: 0,
  //   enableFullRowSelection:true,
  //   enableSelectAll: true,
  //   selectionRowHeaderWidth: 35,
  //   rowSelection: true,
  //   rowHeight: 35
  // };
  
  // $scope.gridOptions.columnDefs = [
  //   { name: 'name' ,displayName: "NAME"},
  //   { name: 'phoneno', displayName: "PHONE NUMBER"},
  //   { name: 'email', displayName: 'EMAIL'}
  // ];
 
  // $scope.gridOptions.multiSelect = true;
  // $scope.selectedIndexValue = [];
  // $scope.gridOptions.onRegisterApi = function(gridApi){

  //   $scope.gridApi = gridApi;
  //   gridApi.selection.on.rowSelectionChanged($scope,function(row){
  //     if($scope.selectedIndexValue.indexOf(row.entity.id)==-1){
  //        $scope.selectedIndexValue.push(row.entity.id);
  //      }
  //     else{
  //       var index = $scope.selectedIndexValue.indexOf(row.entity.id);
  //       $scope.selectedIndexValue.splice(index,1);
  //     }
  //     console.log( $scope.selectedIndexValue);
  //     var msg = 'row selected ' + row.isSelected;
  //     $log.log(msg);
  //   });

  //   gridApi.selection.on.rowSelectionChangedBatch($scope,function(rows){
      
  //     var msg = 'rows changed ' + rows.length;
  //     $log.log(msg);
  //   });
  // };
  var colNamesAll = {
    columnDefs: [
      { name:'name'},
      { name:'phoneno',displayName:'Cell Number'},
      { name:'email'}
    ]
  };

  var colNamesCommon ={
     columnDefs: [
      { name:'id',displayName:'Employee ID', width:'15%'},
      { name:'name', width:'25%'},
      { name:'email', width:'25%'},
      { name:"phoneno",displayName:'Cell Number', width:'20%'},
      { name:'status', width:'15%'}
    ]
  }

  var gridUrlAll = "public/js/controllers/app.json";

  $scope.importContactGrid = function(url,  colNames, type){
    $scope.allContacts = colNames;
    $scope.gridOptions = {
      infiniteScrollRowsFromEnd: 60,
      enableFullRowSelection:true,
      infiniteScrollUp: true,
      infiniteScrollDown: true,
      enableHorizontalScrollbar: 0,
      rowHeight:35,
      data: 'data',
      onRegisterApi: function(gridApi){
        gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.getDataDown);
        gridApi.infiniteScroll.on.needLoadMoreDataTop($scope, $scope.getDataUp);
        $scope.gridApi = gridApi;
      }
    };
    angular.extend($scope.gridOptions,  $scope.allContacts)

    $scope.data = [];

    $scope.firstPage = 0;
    $scope.lastPage = 0;

    $scope.getFirstData = function() {
      return $http.get(url)
      .then(function(response) {
        var newData = $scope.getPage(response.data[0][type], $scope.lastPage);
        $scope.data = $scope.data.concat(newData);
      });
    };

    $scope.getDataDown = function() {
      return $http.get(url)
      .then(function(response) {
        $scope.lastPage++;
        var newData = $scope.getPage(response.data[0][type], $scope.lastPage);
        $scope.gridApi.infiniteScroll.saveScrollPercentage();
        $scope.data = $scope.data.concat(newData);
        return $scope.gridApi.infiniteScroll.dataLoaded($scope.firstPage > 0, $scope.lastPage < 4).then(function() {$scope.checkDataLength('up');});
      })
      .catch(function(error) {
        return $scope.gridApi.infiniteScroll.dataLoaded();
      });
    };

    $scope.getDataUp = function() {
      return $http.get(url)
      .then(function(response) {
        $scope.firstPage--;
        var newData = $scope.getPage(response.data[0][type], $scope.firstPage);
        $scope.gridApi.infiniteScroll.saveScrollPercentage();
        $scope.data = newData.concat($scope.data);
        return $scope.gridApi.infiniteScroll.dataLoaded($scope.firstPage > 0, $scope.lastPage < 4).then(function() {$scope.checkDataLength('down');});
      })
      .catch(function(error) {
        return $scope.gridApi.infiniteScroll.dataLoaded();
      });
    };

    $scope.getPage = function(data, page) {
      console.log(page)
      var res = [];
      for (var i = (page * 100); i < (page + 1) * 100 && i < data.length; ++i) {
        res.push(data[i]);
      }
      return res;
    };

    $scope.checkDataLength = function( discardDirection) {
      // work out whether we need to discard a page, if so discard from the direction passed in
      if( $scope.lastPage - $scope.firstPage > 3 ){
        // we want to remove a page
        $scope.gridApi.infiniteScroll.saveScrollPercentage();

        if( discardDirection === 'up' ){
          $scope.data = $scope.data.slice(100);
          $scope.firstPage++;
          $timeout(function() {
            // wait for grid to ingest data changes
            $scope.gridApi.infiniteScroll.dataRemovedTop($scope.firstPage > 0, $scope.lastPage < 4);
          });
        } else {
          $scope.data = $scope.data.slice(0, 400);
          $scope.lastPage--;
          $timeout(function() {
            // wait for grid to ingest data changes
            $scope.gridApi.infiniteScroll.dataRemovedBottom($scope.firstPage > 0, $scope.lastPage < 4);
          });
        }
      }
    };

    $scope.reset = function() {
      $scope.firstPage = 2;
      $scope.lastPage = 2;

      // turn off the infinite scroll handling up and down - hopefully this won't be needed after @swalters scrolling changes
      $scope.gridApi.infiniteScroll.setScrollDirections( false, false );
      $scope.data = [];

      $scope.getFirstData().then(function(){
        $timeout(function() {
          // timeout needed to allow digest cycle to complete,and grid to finish ingesting the data
          $scope.gridApi.infiniteScroll.resetScroll( $scope.firstPage > 0, $scope.lastPage < 4 );
        });
      });
    };

    $scope.getFirstData().then(function(){
      $timeout(function() {
        // timeout needed to allow digest cycle to complete,and grid to finish ingesting the data
        // you need to call resetData once you've loaded your data if you want to enable scroll up,
        // it adjusts the scroll position down one pixel so that we can generate scroll up events
        $scope.gridApi.infiniteScroll.resetScroll( $scope.firstPage > 0, $scope.lastPage < 4 );
      });
    });
  }
  $scope.importContactGrid(gridUrlAll, colNamesAll,"all");
  this.allDetails = function(){
    $scope.importContactGrid(gridUrlAll, colNamesAll,"all");  
  }
  this.allemp = function(){
    $scope.importContactGrid(gridUrlAll, colNamesCommon,"employee");  
  }
  this.clients = function(){
    $scope.importContactGrid(gridUrlAll, colNamesAll,"clients");  
  }

  this.candidates = function(){
    $scope.importContactGrid(gridUrlAll, colNamesAll,"candidates");  
  }
  this.isoDev = function(){
    $scope.importContactGrid(gridUrlAll, colNamesCommon,"isoDev");  
  }
  this.architects = function(){
    $scope.importContactGrid(gridUrlAll, colNamesCommon,"architects");  
  }
  this.importSelect = function(){
    $uibModal.open({
      animation: false,
      templateUrl: 'public/templates/dialogs/custom-msg.html',
      openedClass: "import_verify",
      controller: 'modalCtrl',
      controllerAs:"ctrl"
    });
    //$state.go('importContactsList').then(() => $modalInstance.close());
  }
  this.backtoUploadCon = function() {
    $window.scrollTo(0,0);
    $state.go('importContacts');
  }
   
}])
.controller('InviteContacts', ['$window', '$state', '$scope', '$http', '$log', '$timeout', 'uiGridConstants', '$uibModal', function ($window, $state, $scope, $http, $log, $timeout, uiGridConstants, $uibModal) {
  $scope.gridOptions = {
    enableRowSelection: true,
    enableHorizontalScrollbar: 0,
    enableVerticalScrollbar:0,
    enableSelectAll: true,
    selectionRowHeaderWidth: 35,
    rowSelection: true,
    rowHeight: 35
  };
   $scope.gridOptions.enableHorizontalScrollbar = uiGridConstants.scrollbars.NEVER;
  $scope.gridOptions.columnDefs = [
    { name: 'name' ,displayName: "NAME"},
    { name: 'phoneno', displayName: "PHONE NUMBER"},
    { name: 'email', displayName: 'EMAIL'}
  ];
  
  $scope.gridOptions.multiSelect = true;
  loadTime();
  function loadTime(){
    $scope.loading = true;
    $http.get('public/js/controllers/app.json')
    .success(function(data) {
      $scope.gridOptions.data = data;
        $timeout(function() {
          if($scope.gridApi.selection.selectRow){
            $scope.gridApi.selection.selectRow($scope.gridOptions.data[0]);
          }
        });
    }).finally(function(){$scope.loading = false});
  }
  
  
  $scope.gridOptions.onRegisterApi = function(gridApi){
    $scope.gridApi = gridApi;
    gridApi.selection.on.rowSelectionChanged($scope,function(row){
      var msg = 'row selected ' + row.isSelected;
      $log.log(msg);
    });

    gridApi.selection.on.rowSelectionChangedBatch($scope,function(rows){
      var msg = 'rows changed ' + rows.length;
      $log.log(msg);
    });
  }; 

  // this.inviteCustom = function(){
  //   $uibModal.open({
  //     animation: true,
  //     templateUrl: 'public/templates/dialogs/custom-msg.html',
  //     openedClass: "import_verify",
  //     controller: 'modalCtrl',
  //     controllerAs:"ctrl"
  //   });
  // } 

  // this.backToImportContact = function(){
  //   $window.scrollTo(0,0);
  //   $state.go('importContactsList');
  // }
  // this.backToHome = function() {
  //   $window.scrollTo(0,0);
  //     $state.go('home');
  // }
}])
.controller('modalCtrl',['$uibModalInstance', function ($uibModalInstance) {
  this.successMsg = false;
  this.invite = function () {
      this.successMsg = true;
  };
  window.onhashchange = function() {
    $uibModalInstance.dismiss('cancel');
  }
}]);

}());
