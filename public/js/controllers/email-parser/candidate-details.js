(function () {
	"use strict";

	angular
		.module('app.candidate.details', [])
		.controller('UploadController', UploadController)

		UploadController.$inject = ['$scope', '$http', 'App'];

		function UploadController($scope, $http, App){
			
			var vm = this;

			this.fileName = 'Select a file to upload...';

			$("#can-mobile").intlTelInput({
				preferredCountries: ['in', 'us', 'gb'],
				nationalMode: false,
				initialCountry: "in",
				separateDialCode: true

			});

			vm.postFormData = postFormData;


			vm.chkFile = true;
			function postFormData(formValid){
				if(formValid || vm.chkFile){
					vm.errorRequired = true;
					return;
				}
				console.log('ok')

			}

			var bonus_file_path;
			var $upload_resume = $('#upload-resume');
		    App.Helpers.initUploader({
		        id: "upload-resume",
		        dragText: "",
		        uploadButtonText: "SELECT FILE",
		        size: (10 * 1024 * 1024),
		        allowedExtensions: ["XLSX", "CSV", "XLS"],
		        action: App.base_url + "contacts_file_upload",
		        showFileInfo: false,
		        shortMessages: true,
		        remove: false,
		        file_name : 'logo_org_name',
			    path_name : 'logo_image',
		        onSubmit: function(id, name) {
		        	$('.file-check').text('');
		            $upload_resume.find('.qq-upload-list').css('z-index','0');
		            $upload_resume.find('.qq-upload-fail').remove();
		        },
		        onComplete: function(id, name, response) {
		            if (response.success) {
		            	bonus_file_path = App.base_url+response.filename;
		                $upload_resume.find('.qq-upload-list').css('z-index','-1');
			    		$upload_resume.find('.qq-upload-button').hide();
			    		$upload_resume.find('.drag_img').css('background','transparent');
			    		$upload_resume.find('.qq-upload-drop-area').css('display','block');
			    		$upload_resume.find('.qq-upload-drop-area .drag_img').html('<a href="'+bonus_file_path+'" class="view"><img src="../public/images/Applied.svg"><p class="ellipsis">'+response.org_name+'&nbsp;</p></a>');
			    		$upload_resume.find('.drag_img').append('<a href="'+bonus_file_path+'&embedded=true" download class="download"><img src="../public/images/material_icons/download.svg"></a><img src="../public/images/material_icons/circle-close.svg" onclick="angular.element(this).scope().UploadCtrl.trash(true)" style="margin-top:-4px">');
			    		vm.chkFile = false;
			    		$scope.$apply();
		            }
		            else{
			    		$upload_resume.find('.qq-upload-button').show();
			    		$upload_resume.find('.qq-upload-fail').remove();
			    		$upload_resume.append("<div class='qq-upload-fail'><i class='fa fa-times'></i>&nbsp;<span>"+response.msg+"</span></div>");
		    		}
		        },
		        showMessage: function(msg, obj) {
		        	$('.file-check').text('');
		        	$upload_resume.find('.qq-uploader + .qq-upload-fail').remove();
		            $upload_resume.closest('.form-group').find('div.error').hide();
		            $upload_resume.find('.qq-upload-list').css('z-index','0');
		            $(obj._listElement).fadeIn();
		        },
		        onRemove: function() {

		        },
		        onRemoveComplete: function() {
		        	$upload_resume.find('.qq-upload-list').css('z-index','-1');
		        }
		    });


		    this.trash = function(){
		    	$('.file-check').text('Please Select File');
				$upload_resume.find('.drag_img').html('');
				$upload_resume.find('.qq-upload-list').html('');
				$upload_resume.find('.qq-upload-list').css('z-index','-1');
				$upload_resume.find('.qq-upload-drop-area').css('display','none');
				$upload_resume.find('.qq-upload-button').show();
				vm.chkFile = true;
				$scope.$apply();
			}
			
		}
		
}());