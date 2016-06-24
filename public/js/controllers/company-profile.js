(function () {
"use strict";

angular.module('app.company.profile', [])

.controller('CompanyProfileController', ['$state','$window',function ($state,$window) {


    /*this.companyObj = {
        comp_name: '',
        industry: '',
        website: ''
    }*/

    this.industry_list = ['Banking','Computer & Network Security','Computer Networking','Computer Software','Information Technology','Real Estate','Other']
    // this.industry_list = ['.Net Developer','Design','Finance','Information Technology','Java Developer','PHP Developer','Quality Assurance','UI Developer','Others'];
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
        console.log(isValid)
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