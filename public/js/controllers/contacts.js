(function () {
"use strict";

angular.module('app.contact', [])

.controller('ContactsController',[function(){

	var scope = this;




}])


.controller('UploadContactsController',['CONFIG', function(CONFIG){
	
	var scope = this;

	this.downloadSample = function(){
        window.location.href = CONFIG.APP_DOMAIN+'downloadcsv';
    }



}])



}());