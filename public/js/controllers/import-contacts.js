(function () {
"use strict";

angular.module('app.import.contacts', ['ui.grid' ,'ui.grid.selection','ui.grid.infiniteScroll'])

.controller('ImportContactsController', ['$state', '$window', '$uibModal', function ($state, $window, $uibModal) {
  
  this.bucketsName = ["employees", "clients", "candidates", "ios developers" ,"+add your own"];
  this.bucketColor = ["#229A77", "#21A4AC", "#EE8F3B", "#2A99E0" ,"#999"];

  this.selectFile = function(){
      $window.scrollTo(0,0);
      $state.go('importContactsList');     
  }

  this.backToCompleteProfile = function() {
      $window.scrollTo(0,0);
      $state.go('companyProfile');
  }

  this.fileUploadModal = function  (bucketName,color) {
      $uibModal.open({
        animation: true,
        backdrop: 'static',
        templateUrl: 'templates/dialogs/fileUpload.phtml',
        resolve: {
          bucket: function () {
            var bucket = {};
              bucket.color=color;
              bucket.name=bucketName;
              return bucket;
            }
        },
        controller: 'fileUpload',
        controllerAs:"fileUp"
      });
  }



}])

.controller("fileUpload", ["$uibModalInstance", "$scope","bucket", function($uibModalInstance, $scope, bucket){
    this.bucket = bucket;
    var color = this.bucket.color;
    var bucketName = this.bucket.name;

    this.obj={
      "border":"1px solid "+color,
      "color":color
    }

    this.uploadFile = function(){
        var uploader = new qq.FileUploader({
        // pass the dom node (ex. $(selector)[0] for jQuery users)
          element: document.getElementById('file-uploader'),
          // path to server-side upload script
          action: '',
          dragText:"Drag Your File Here",
          multiple:false,
          uploadButtonText: 'Browse File !',
          allowedExtensions: ['csv', 'xlxs'],
          params:{
            "name":bucketName
          },
          showMessage: function(message) {
              $('#file-uploader').append('<div class="alert alert-error">' + "Invalid file type. Only csv, xlsx files are allowed." + '</div>');
          },
          onSubmit: function(id, fileName){
          },
          onProgress: function(id, fileName, loaded, total){

          },
          onComplete: function(id, fileName, responseJSON){
            
          },
          onCancel: function(id, fileName){},
          onError: function(id, fileName, xhr){

          }
      });
    }

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){ 
     
       $uibModalInstance.dismiss('cancel');
      
    })
}])

.controller('ImportContactsListController', ['$rootScope','$window', '$state', '$scope', '$http', '$log', '$timeout', 'uiGridConstants','$uibModal', function ($rootScope, $window, $state, $scope, $http, $log, $timeout, uiGridConstants, $uibModal) {

  var _this = this;

  var tabNames  = [
    { id : 1, label : "All" },
    { id : 2, label : "Employees" },
    { id : 3, label : "Clients" },
    { id : 4, label : "Candidates" },
    { id : 5, label : "iOS_Developers" },
    { id : 5, label : "Architects" }
  ];

  this.tabNames = tabNames;

  var colNamesAll = {
    columnDefs: [
      { name:'id'},
      { name:'name',displayName:'Name'},
      { name:'age'}
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

  var All = [
    {id : 1, type : "emp", name : "John-emp" , age : 23 },
    {id : 2, type : "emp", name : "John david-emp" , age : 24 },
    {id : 3, type : "emp", name : "John mickle-emp" , age : 28 },
    {id : 4, type : "client", name : "willam-client" , age : 32 },
    {id : 5, type : "client", name : "willam tinker-client" , age : 35 },
    {id : 6, type : "client", name : "willam crank-client" , age : 33 },
    {id : 7, type : "candidate", name : "miller-candidate" , age : 44 },
    {id : 8, type : "candidate", name : "miller killer-candidate" , age : 45 },
    {id : 9, type : "candidate", name : "miller haddin-candidate" , age : 41 },
    {id : 10, type : "ios", name : "smith roy-ios" , age : 53 },
    {id : 11, type : "ios", name : "smith man-ios" , age : 54 },
    {id : 12, type : "ios", name : "smith hood-ios" , age : 58 },
  ];

  var Clients = [
    {id : 4, type : "client", name : "willam-client" , age : 32 },
    {id : 5, type : "client", name : "willam tinker-client" , age : 35 },
    {id : 6, type : "client", name : "willam crank-client" , age : 33 }
  ];

  var Employees = [
    {id : 1, type : "emp", name : "John-emp" , age : 23 },
    {id : 2, type : "emp", name : "John david-emp" , age : 24 },
    {id : 3, type : "emp", name : "John mickle-emp" , age : 28 }
  ];


  var Candidates = [
    {id : 7, type : "candidate", name : "miller-candidate" , age : 44 },
    {id : 8, type : "candidate", name : "miller killer-candidate" , age : 45 },
    {id : 9, type : "candidate", name : "miller haddin-candidate" , age : 41 }
  ];

  var iOS_Developers = [
    {id : 10, type : "ios", name : "smith roy-ios" , age : 53 },
    {id : 11, type : "ios", name : "smith man-ios" , age : 54 },
    {id : 12, type : "ios", name : "smith hood-ios" , age : 58 }
  ];

  var gridUrlAll = 'https://cdn.rawgit.com/angular-ui/ui-grid.info/gh-pages/data/10000_complex.json';

  this.importContactGrid = function(url,  colNames, id, type){

    $scope.allContacts = colNames;
    $scope.gridOptions = {
      infiniteScrollRowsFromEnd: 60,
      enableFullRowSelection:true,
      infiniteScrollUp: true,
      infiniteScrollDown: true,
      enableHorizontalScrollbar: 1,
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
      return $http.get('https://cdn.rawgit.com/angular-ui/ui-grid.info/gh-pages/data/10000_complex.json')
      .then(function(response) {
        var newData = $scope.getPage(eval(type), $scope.lastPage);
        console.log(type)
        $scope.data = $scope.data.concat(newData);
      });
    };
   
    $scope.getDataDown = function() {
      return $http.get('https://cdn.rawgit.com/angular-ui/ui-grid.info/gh-pages/data/10000_complex.json')
      .then(function(response) {
        $scope.lastPage++;
        var newData = $scope.getPage(eval(type), $scope.lastPage);
        $scope.gridApi.infiniteScroll.saveScrollPercentage();
        $scope.data = $scope.data.concat(newData);
        return $scope.gridApi.infiniteScroll.dataLoaded($scope.firstPage > 0, $scope.lastPage < 4).then(function() {$scope.checkDataLength('up');});
      })
      .catch(function(error) {
        return $scope.gridApi.infiniteScroll.dataLoaded();
      });
    };
   
    $scope.getDataUp = function() {
      return $http.get('https://cdn.rawgit.com/angular-ui/ui-grid.info/gh-pages/data/10000_complex.json')
      .then(function(response) {
        $scope.firstPage--;
        var newData = $scope.getPage(eval(type), $scope.firstPage);
        $scope.gridApi.infiniteScroll.saveScrollPercentage();
        $scope.data = newData.concat($scope.data);
        return $scope.gridApi.infiniteScroll.dataLoaded($scope.firstPage > 0, $scope.lastPage < 4).then(function() {$scope.checkDataLength('down');});
      })
      .catch(function(error) {
        return $scope.gridApi.infiniteScroll.dataLoaded();
      });
    };
   
    $scope.getPage = function(data, page) {
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
 
    $scope.getFirstData().then(function(){
      $timeout(function() {
        // timeout needed to allow digest cycle to complete,and grid to finish ingesting the data
        // you need to call resetData once you've loaded your data if you want to enable scroll up,
        // it adjusts the scroll position down one pixel so that we can generate scroll up events
        $scope.gridApi.infiniteScroll.resetScroll( $scope.firstPage > 0, $scope.lastPage < 4 );
      });
    });

  }
  //default calling all contacts
  _this.importContactGrid(gridUrlAll, colNamesAll, 1, "All");

  this.getInfo = function(id ,type){
      _this.importContactGrid(gridUrlAll, colNamesAll, id, type);
  }

  this.importSelect = function(){
    $uibModal.open({
      animation: false,
      templateUrl: 'public/templates/dialogs/custom-msg.html',
      controller: 'modalCtrl',
      controllerAs:"ctrl"
    });
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
