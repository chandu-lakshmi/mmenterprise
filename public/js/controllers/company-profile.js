(function () {
"use strict";

angular.module('app.company.profile', [])

.controller('CompanyProfileController', ['$state','$window','$http','CONFIG','$scope','$rootScope',function ($state,$window,$http,CONFIG,$scope,$rootScope) {

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

    // this.industry_list = [{'industry_name':'Banking'}]

    /*$scope.image_change = function(event){
        console.log(event)
       console.log(URL.createObjectURL(event.target.files[0]))
    }*/


    this.valid = function(){
        var comp_data_list = $.param({
            'company':scope.comp_name,
            'industry':scope.industry.industry_name,
            'description':scope.desc,
            'website':scope.website,
            'number_of_employees':scope.value,
            'company_logo':scope.logo,
            'user_id':$rootScope.user_id
        });

        var request = $http({
           headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
           },
           method: 'POST',
           url: CONFIG.APP_API_DOMAIN+CONFIG.APP_API_VERSION+'/enterprise/create_company',                               
           data: comp_data_list
       })

       request.success(function(response){
        console.log(response)
           if(response.status_code == 200) {
                console.log(response.data)
           }else if (response.status_code == 403) {

           };
           
       })
       request.error(function(response){
           console.log("Failed Registration")
       })
    }
    
    /*if(this.go_1 == true){
        $("#img").change(function(event){alert()
            console.log(URL.createObjectURL(event.target.files[0]))
           //$("#dp").fadeIn("fast").attr('src',URL.createObjectURL(event.target.files[0]));
        })
    }*/

    this.group_size = ['10-50','50-100','100-500','500-1000','1000-5000','5000+'];

    this.getCheckedCond = function(x){
        if(x == '10-50'){
            return true;
        }
        // console.log(x)
    }
    this.value = this.group_size[0];

    this.go_0 = true;


    this.comp1_show_error = false;
    this.comp2_show_error = false;
    this.comp3_show_error = false;
    
    this.jump = function(go,isValid){
        // console.log(isValid)
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

}]);

    
}());