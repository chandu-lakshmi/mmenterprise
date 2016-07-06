(function () {
"use strict";

angular.module('app.company.profile', [])

.directive('customOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeFunc = scope.$eval(attrs.customOnChange);
      element.bind('change', onChangeFunc);
    }
  };
})


.controller('CompanyProfileController', ['$state','$window','$http','CONFIG','$scope','$rootScope',function ($state,$window,$http,CONFIG,$scope,$rootScope) {
    this.comp_name = $rootScope.company_name;
    var scope = this;
    var request = $http({
        headers: {
           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        method: 'GET',
        url: CONFIG.APP_API_DOMAIN+CONFIG.APP_API_VERSION+'/get_industries'
    })

    request.success(function(response){
       scope.industry_list = response.data.industries;
        
    })
    request.error(function(response){
        scope.industry_list = [];
    })



    scope.form_data = {};
    this.step1 = function(){
        scope.form_data = {
            company_name : scope.comp_name,
            industry : scope.industry.industry_id,
            description : scope.desc,
            number_of_employees : ''
        }
    }
    this.radio = function(radioValue){
        scope.form_data.number_of_employees = radioValue;
    }

    var upload_condition = false;
    this.uploadFile = function(){
        /*var files = this.files[0];
        console.log(files)*/
        upload_condition = true;
    };

    this.uploadPdf = function(){
        var files = this.files[0];
        if(files.size <= (10 * 1024 *1024)){
            $('#pdf_name').text(files.name);
        }
        else{
            $('#pdf_err_name').text("Exceeds Maximum Size");
        }
    }

    this.valid = function(){

        scope.cont_load = true;
        var formData = new FormData();
        formData.append('company',scope.comp_name);
        formData.append('code',$rootScope.company_code);
        formData.append('access_token',$rootScope.access_token);
        formData.append('industry',scope.industry.industry_id);
        formData.append('description',scope.desc);
        formData.append('number_of_employees',scope.form_data.number_of_employees);
        formData.append('website',scope.website);
        formData.append('user_id',$rootScope.user_id);
        if(upload_condition == true){
            formData.append('company_logo', $('input[type=file]#upload-image')[0].files[0]);
        }

        var request = $http({
            headers: {
                'Content-Type' : undefined
            },
            method : 'POST',
            url : CONFIG.APP_API_DOMAIN+CONFIG.APP_API_VERSION+'/enterprise/create_company',
            data : formData
        });
        request.success(function(response){
            if(response.status_code == 200){

                scope.company_code = response.data.company_code;
                scope.go_2 = false;
                scope.cont_load = false;
                $window.scrollTo(0,0);
                scope.go_3 = true;
            }
        });

        request.error(function(response){
            console.log(response);
        })

    }

    this.group_size = ['10-50','50-100','100-500','500-1000','1000-5000','5000+'];



    this.go_0 = true;


    this.comp1_show_error = false;
    this.comp2_show_error = false;
    this.comp3_show_error = false;
    
    this.jump = function(go,isValid){
        if(!isValid){
            if(go == 1)
                this.comp1_show_error = true;
            if(go == 2)
                this.comp2_show_error = true;
            if(go == 3)
                this.comp3_show_error = true;
        }
        else{
            $window.scrollTo(0,0);
            var dif_1 = go - 1;
            var dif_2 = go - 2;
            if(dif_1 >= 0){
                var prev_1 = 'go_'+dif_1;
                this[prev_1] = false;
            }
            if(dif_2 >= 0){
                var prev_2 = 'go_'+dif_2;
                this[prev_2] = false;
            }
            var same = 'go_'+go;
            this[same] = true;

            var sum_1 = go + 1;
            var sum_2 = go + 2;
            var post_1 = 'go_'+sum_1;
            var post_2 = 'go_'+sum_2;
            this[post_1] = false;
            this[post_2] = false;
        }
    }


    this.prev = function(prev, cur){
        $window.scrollTo(0,0);
        var prv = 'go_'+prev;
        this[prv] = true;

        var curr = 'go_'+cur;
        this[curr] = false;
    }


    this.upload_contacts = function(){
        $window.scrollTo(0,0);
        $state.go('importContacts');
    }

}])



.controller('myCtrl', function($scope) {
    $scope.uploadFile = function(){
        var filename = event.target.files[0].name;
        alert('file was selected: ' + filename);
    };
});

    
}());
