(function () {
    "use strict";

    angular
            .module('app.constantKeys', ['app.constants'])
    
            .config(function(App){

        		angular.extend(App.lang, {
                            hcm : {
                                successFactors : [
                                    {id: 1, param: 'hcm_url'}, {id: 2, param: 'hcm_username'}, {id: 3, param: 'hcm_password'}
                                ]
                            }
                        })
            })

}());


