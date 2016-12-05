(function () {
	"use strict";

	angular
		.module('app.candidate.details', [])
		.controller('CandidateDetailsController', CandidateDetailsController)

		CandidateDetailsController.$inject = ['$scope', '$http', 'App'];

		function CandidateDetailsController($scope, $http, App){
			
			var vm = this;

			this.errorFileUp = true;
			this.fileName = 'Select a file to upload...';

			$("#can-mobile").intlTelInput({
				preferredCountries: ['in', 'us', 'gb'],
				nationalMode: false,
				initialCountry: "in",
				separateDialCode: true

			});

			vm.postFormData = postFormData;

			function postFormData(formValid){
				
				if(formValid){
					vm.errorRequired = true;
					return;
				}
				console.log('ok')

			}

			var uploader = new qq.FileUploader({
			    
			    element: document.getElementsByClassName('cv-upload')[0],
			    dragText: "",
	            uploadButtonText: "SELECT FILE",
	            multiple : false,
	            sizeLimit: (1*1024*1024),
	            allowedExtensions: ["XLSX", "CSV", "XLS", 'PDF'],
			    action: App.base_url+ 'file_upload',
			    onSubmit: function(id, name){
			    	$('#errorMsgFileUp, .file-name').text('');
		            
	            },
	            onComplete: function(id, name, response){
	                if(response.success){
	         			$('.file-name').text(response.org_name);
	         			vm.fileName = response.org_name;
	         			vm.logo_org_name = response.org_name;
	         			vm.logo_image = response.filename;
	                }
	                else{
	                	$('#errorMsgFileUp').text(response.msg);
	                	vm.logo_org_name = '';
	         			vm.logo_image = '';
	                }
	                $scope.$apply();
	                $('.cv-upload').find('.qq-upload-list').remove();
	            },
	            showMessage: function(msg){
	            	$('#errorMsgFileUp').text(msg);
					$('.cv-upload').find('.qq-upload-list').remove();	 
					vm.fileName = 'Select a file to upload...';
					vm.errorFileUp = false;
					vm.logo_org_name = '';
	         		vm.logo_image = '';
	         		$scope.$apply();           
	            }


			});

			
		}
		
}());