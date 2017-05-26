angular.module('app')
    .config(function($provide, $httpProvider) {
        $provide.factory('mintmeshHttpInterceptor', function($q) {
            return {
                // On request success
                request: function(config) {
                    // console.log(config); // Contains the data about the request before it is sent.
                    // Return the config or wrap it in a promise if blank.
					//config.param();
					//console.log(config);
					var x = "&time_zone="+new Date().getTimezoneOffset();
					config.data = config.data+x;
					return config || $q.when(config);
                },
                // On request failure
                requestError: function(rejection) {
                    // console.log(rejection); // Contains the data about the error on the request.
                    // Return the promise rejection.
                    return $q.reject(rejection);
                },
                // On response success
                response: function(response) {
                    if(response.data.status_code == 401){
                        
                        window.location.href = "logout";
                    }
                    //console.log("----------")
                   
                   /* if(response.data.result && 
                        angular.isDefined(response.data.result.status_code) &&
                        response.data.result.status_code == '1000'
                        ){
                        window.location.href="logoutsso"
                        return false;
                    }*/
                    return response || $q.when(response);
                },
                // On response failture
                responseError: function(rejection) {
                    // console.log(rejection); // Contains the data about the error.
                    // Return the promise rejection.
                    return $q.reject(rejection);
                }
            };
        });
        $httpProvider.interceptors.push('mintmeshHttpInterceptor');
    })