(function () {
"use strict";

angular.module('app.import.contacts', ['ui.grid' ,'ui.grid.selection','ui.grid.infiniteScroll'])
// Required input[type=file]
.directive('validFile',function(){
  return {
    require:'ngModel',
    link:function(scope,el,attrs,ngModel){
      //change event is fired when file is selected
      el.bind('change',function(){
        scope.$apply(function(){
          ngModel.$setViewValue(el.val());
          ngModel.$render();
        })
      })
    }
  }
})

// Restriction for already existing bucket names
.directive('bucketNameChk', [function () {
    return{
        require: 'ngModel',
        link:function(scope, elem, attr, ctrl){
            elem.add(attr.id).on('blur', function () {
                scope.$apply(function () {
                    var bkNames = scope.$eval(attr.myBucket);
                    var v = bkNames.indexOf(attr.myName) === -1;
                    ctrl.$setValidity('bucketmatch', v);
                });
            });
        }
    } 
}])


.controller('ImportContactsController', ['$state', '$window', '$uibModal', function ($state, $window, $uibModal) {
  
  var _this = this;

  this.bucketsName = ["employees", "clients", "candidates", "ios developers"];
  var bucketColor = ["#229A77", "#21A4AC", "#EE8F3B", "#2A99E0", "#154c50", "#103954", "#342158", "#5B5B29", "#004D40", "#0E0100"];
  
  this.getColor = function(ind){
      return bucketColor[String(ind).slice(-1)];
  }

  this.selectFile = function(){
      $window.scrollTo(0,0);
      $state.go('importContactsList');     
  }

  this.backToCompleteProfile = function() {
      $window.scrollTo(0,0);
      $state.go('companyProfile');
  }

  this.fileUploadModal = function  (bucketName, color) {
      
      if(bucketName == "+Add Your Own"){
        bucketName = "Add Your Own";
      }
      $uibModal.open({
        animation : true,
        backdrop: 'static',
        templateUrl: 'templates/dialogs/fileUpload.phtml',
        openedClass: "bucket",
        resolve: {
          bucket: function () {
            var bucket = {};
              bucket.color=color;
              bucket.name=bucketName;
              bucket.All = _this.bucketsName;
              return bucket;
            }
        },
        controller: 'fileUpload',
        controllerAs:"fileUp"
      });
  }

}])

.controller("fileUpload", ["$uibModalInstance", "$scope","bucket", "$rootScope", "$http", "CONFIG", function($uibModalInstance, $scope, bucket, $rootScope, $http, CONFIG){

  

    var scope = this;
    this.bucket = bucket;
    var color = this.bucket.color;
    var bucketName = this.bucket.name;
    this.newBucket = false;
    this.emptyVal = false;
    this.new_bucket_flag = 0;
    this.bucketNames = this.bucket.All;
    if(this.bucket.All.indexOf(bucketName) == -1){
        var bucket_id = this.bucket.All.length + 1;
    }
    else{
        var bucket_id = this.bucket.All.indexOf(bucketName) + 1;
    }


    if(bucketName == "Add Your Own"){
      scope.newBucket = true;
      scope.new_bucket_flag = 1;
    }
    
    this.obj={
      "border":"1px solid "+color,
      "color":color
    }

    
    this.upload_load_cond = false;
    this.onfileSubmit = function(valid){

        if(!valid){
            scope.upload_load_cond = false;
            scope.error_msg_show = true;
        }
        else{
            this.upload_load_cond = true;
            // Sending data to post call
            var bucket_data = new FormData();
            bucket_data.append("access_token",'oFOs2PqsK4uNpn2ioXFzYWZOERE3TLW4h0nkaZWN');
            bucket_data.append("contacts_file",$('input[type=file]#fileUploads')[0].files[0])
            bucket_data.append("company_id",$rootScope.company_code);
            bucket_data.append("is_bucket_new",scope.new_bucket_flag);
            bucket_data.append("bucket_name" , bucketName);
            bucket_data.append("bucket_id" , bucket_id);

            // Contacts Upload Ajax Call
            var upload_contacts = $http({
                headers: {
                    'Content-Type' : undefined
                },
                method : 'POST',
                url : CONFIG.APP_API_DOMAIN+CONFIG.APP_API_VERSION+'/enterprise/contacts_upload',
                data : bucket_data
            });
            upload_contacts.success(function(response){
                console.log(response)
                if(response.status_code == 200){
                    scope.upload_load_cond = false;
                    if(scope.newBucket){
                        scope.bucket.All.push(scope.customName);
                    }
                    $uibModalInstance.dismiss('cancel');  
                }
                else if(response.status_code == 403){
                    scope.upload_load_cond = false;
                    if(response.message.hasOwnProperty('contacts_file')){
                        scope.inValidFile = response.message.contacts_file[0];
                    }
                    else{
                        scope.inValidFile = response.message[0];
                    }
                }
            });
            upload_contacts.error(function(response){
                console.log(response);
            })
        }
    }


    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){ 
     
       $uibModalInstance.dismiss('cancel');
      
    })
}])

.controller('ImportContactsListController', ['$rootScope','$window', '$state', '$scope', '$http', '$log', '$timeout', 'uiGridConstants','$uibModal', function ($rootScope, $window, $state, $scope, $http, $log, $timeout, uiGridConstants, $uibModal) {

  var _this = this,
    selectedContacts = [];

  var tabNames  = [
    { id : 1, label : "All" },
    { id : 2, label : "Employees" },
    { id : 3, label : "Clients" },
    { id : 4, label : "Candidates" },
    { id : 5, label : "iOS_Developers" },
    { id : 6, label : "Architects" }
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

  var gridUrlAll = '10000_complex.json';

  var currentTab = "All";

  this.importContactGrid = function(url,  colNames, id, type){
    currentTab = type;
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
        var newData = $scope.getPage(eval(type), $scope.lastPage),
          selectedCount = 0;

        $scope.gridApi.grid.selection.selectAll = false;
        if(selectedContacts.length != 0){
          var a = selectedContacts.length;

          setTimeout(function(){
            for(var i = 0;i < a;i++ ){
              for(var j = 0; j < newData.length; j++){
                if(selectedContacts[i]==newData[j].id){
                  $scope.gridApi.selection.selectRow(newData[j]);
                  selectedCount++;
                  break;    
                }  
              }
            }
            console.log(newData.length + " -- " + selectedCount);
            if (newData.length == selectedCount) {
              $scope.gridApi.grid.selection.selectAll = true;
            } 
          },1);
          
        }
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
    //_this.getRecords();
    _this.importContactGrid(gridUrlAll, colNamesAll, id, type);
  }

 

  function updateRowSelection(row) {
    if (row.isSelected) {
      if(selectedContacts.indexOf(row.entity.id) == -1){
        selectedContacts.push(row.entity.id); 
      }
    } else {
      var index = selectedContacts.indexOf(row.entity.id);
      if (index > -1) {
        selectedContacts.splice(index, 1);
      }
    }
  }

  $scope.gridOptions.onRegisterApi = function(gridApi){
      //set gridApi on scope
      $scope.gridApi = gridApi;
      gridApi.selection.on.rowSelectionChanged($scope,function(row){
        updateRowSelection(row);
      });
 
      gridApi.selection.on.rowSelectionChangedBatch($scope,function(rows){
        for (var i = 0; i < rows.length; i++) {
          updateRowSelection(rows[i]);
        }
      });
    };

  this.importSelect = function(){
    $uibModal.open({
      animation: false,
      templateUrl: 'templates/dialogs/custom-msg.phtml',
      openedClass: "import_verify",
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
