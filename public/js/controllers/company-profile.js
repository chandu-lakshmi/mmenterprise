(function () {
"use strict";

angular.module('app.company.profile', [])


// input[type=file] directive(onChange)
.directive('customOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeFunc = scope.$eval(attrs.customOnChange);
      element.bind('change', onChangeFunc);
    }
  };
})

// multiple images upload
.directive('customOnChangeOne', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeFunc = scope.$eval(attrs.customOnChangeOne);
      var index = attrs.customPara;
      console.log(attrs)
      element.bind('change', function customeName(){
        onChangeFunc(index)
      });
    }
  };
})



.controller('CompanyProfileController', ['$state','$window','$http','CompanyDetails','CONFIG','$scope',function ($state,$window,$http,CompanyDetails,CONFIG,$scope) {

    var scope = this;
    this.comp_name = CompanyDetails.company_name;

    // GetIndustries
    var get_industries = $http({
        headers: {
           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        method: 'GET',
        url: CONFIG.APP_DOMAIN+'get_industries'
    })

    get_industries.success(function(response){
       scope.industry_list = response.data.industries;
        
    })
    get_industries.error(function(response){
        scope.industry_list = [];
    })

    // Storing company logo from step3
    var upload_condition = false;
    var logo;
    this.uploadLogo = function(){
        var preview = document.querySelector('#company_logo');
        var files = this.files[0];
        var type = files.type.split('/')[0];
        var reader  = new FileReader();

        reader.addEventListener("load", function () {
            if(type == 'image'){
                if(files.size <= (1 * 1024 *1024)){
                    upload_condition = true;
                    logo = files;
                    preview.src = reader.result;
                    $('#img_err_name').text("");
                }
                else{
                    preview.src = "public/images/icon.png";
                    $('#img_err_name').text("Exceeds Maximum Size");
                }   
            }
            else{
                preview.src = "public/images/icon.png";
                $('#img_err_name').text("Invalid Format");
            }
         }, false);

         if (files) {
           reader.readAsDataURL(files);
         }
    };

    var multipleImages = [];
    this.multipleFiles = function(event,index){
        for(var i = 1; i <= 4; i++){
            $('#multiple_img_error_'+i).text("");
        }
        var preview = document.querySelector('#dp-'+index);
        var files = document.querySelector('#add-image-'+index).files[0];
        var type = files.type.split('/')[0];
        var reader = new FileReader();
        
        reader.addEventListener("load", function () {
            if(type == "image"){
                if(files.size <= (1 * 1024 *1024)){
                    multipleImages[index-1] = files;
                    preview.src = reader.result;
                    $('#multiple_img_error_'+index).text("");
                }
                else{
                    preview.src = "public/images/add.png";
                    $('#multiple_img_error_'+index).text("Exceeds Maximum Size");
                }
            }
            else{
                preview.src = "public/images/add.png";
                $('#multiple_img_error_'+index).text("Invalid Format");
            }
         }, false);

         if (files) {
           reader.readAsDataURL(files);
         }

         document.querySelector('#add-image-'+index).value = null;
    }


    // Uploading Referral Bonus Pdf
    var referralBonus;
    this.uploadPdf = function(){
        var files = this.files[0];
        referralBonus = files;
        if(files.size <= (10 * 1024 *1024)){
            $('#pdf_name').text(files.name);
        }
        else{
            $('#pdf_err_name').text("Exceeds Maximum Size");
        }
    }

    // Posting Data to API
    this.files_error = false;
    scope.disabled = false;
    this.valid = function(){

        scope.disabled = true;
        scope.cont_load = true;

        var formData = new FormData();
        formData.append('company',scope.comp_name);
        formData.append('industry',scope.industry.industry_id);
        formData.append('description',scope.desc);
        formData.append('number_of_employees',scope.groupSize);
        formData.append('website',scope.website);

        if(upload_condition == true){
            formData.append('company_logo', logo);
        }

        for(var i = 0; i < multipleImages.length; i++){
            formData.append('images['+i+']',multipleImages[i]);
        }
            

        var create_company = $http({
            headers: {
                'Content-Type' : undefined
            },
            method : 'POST',
            url : CONFIG.APP_DOMAIN+'update_company',
            data : formData
        });

        create_company.success(function(response){
            if(response.status_code == 200){
                scope.company_code = response.data.company_code;
                scope.go_2 = false;
                scope.cont_load = false;
                $window.scrollTo(0,0);
                scope.go_3 = true;
            }
            else if(response.status_code == 400){
                $window.location = CONFIG.APP_DOMAIN+'logout';
            }
        });

        create_company.error(function(response){
            scope.disabled = false;
            scope.cont_load = false;
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

    // Previous page jumping
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

    
}());
