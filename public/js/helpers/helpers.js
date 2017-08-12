(function () {
        "use strict";
        
        angular

        	.module('app.helpers', ['app.constants'])

        	.config(function(App){

        		angular.extend(App.Components, {
        			spinner: function (opts) {
				        var config = {
				            css: false,
				            src: App.url_spinner
				        };
				        if (opts)
				            $.extend(config, opts);

				        var spinner = "<img src='" + config.src + "' class='spinner" + (config.css ? " " + config.css : "") + "' />"
				        return spinner;
				    },

				    aspectRatio: function(opts){
				    	var config = {
				    		domTarget : ''
				    	}
				    	if (opts)
							$.extend(config, opts);

						return (opts.domTarget.naturalHeight / opts.domTarget.naturalWidth) * 160;				    		
				    }
        		})

        		angular.extend(App.Helpers, {

        			/* VALUMS's plugin for uploading files
					* AJAX kind
					*/
					initUploader: function(opts, cb){
					    var config = {
					        action: false,
					        allowedExtensions: ["jpg", "gif", "png", "jpeg"],
					        buttonClass: false,
					        customParams: {},
					        dragText: "Drop files here to upload",
					        enableDragDrop: true,
					        id: false,
					        multiple: false,
					        minSizeLimit: 0, // min size
					        size: (2*1024),
					        remove: true,
					        removeItemURL: false,
					        uploadButtonText: "Upload a file",
					        showFileInfo: true,
					        shortMessages: false,
					        file_name: "filename",
					        path_name: "filepath",
					        
					        onCancel: function(id, name){},
					        onComplete: function(id, name, response){},
					        onInvalidExtn: function(){},
					        onProgress: function(id, name, loaded, total){},
					        onRemove: function(){},
					        onRemoveComplete: function(){},
					        onSizeError: function(){},
					        onSubmit: function(id, name){},      
					        showMessage: function(){}
					    };
					    if(opts) $.extend(config, opts);

					    if(config.action){
					        new qq.FileUploader({
					            element: document.getElementById(config.id),
					            action: config.action,
					            debug: false,
					            multiple: config.multiple,
					            dragText: config.dragText,
					            uploadButtonText: config.uploadButtonText,
					            enableDragDrop: config.enableDragDrop,
					            onInvalidExtn: config.onInvalidExtn,
					            onSizeError: config.onSizeError,
					            minSizeLimit: config.minSizeLimit,
					            sizeLimit: config.size,
					            allowedExtensions: config.allowedExtensions,
					            hideShowDropArea: false,
					            customParams: config.customParams,
					            buttonClass: config.buttonClass,
					            onCancel: config.onCancel,
					            showMessage: function(msg, obj){
					                $(obj._listElement).html("<li class='qq-upload-fail'><div class='upload-fail'><i class='fa fa-times icon-remove'></i>"+msg+"</div></li>");
					                config.showMessage(msg, obj);
					            },
					            showFileInfo: config.showFileInfo,
					            shortMessages: config.shortMessages,
					            file_name: config.file_name,
					            path_name: config.path_name,
					            onSubmit: config.onSubmit,
					            onComplete: config.onComplete,
					            onProgress: config.onProgress
					        }, function(handler){
					        	if(cb){
					        		cb(handler)
					        	}
					        });
					                    
					        $('#'+config.id+' .qq-upload-list').on('click touchend', '.icon-remove', function(e){
					            var me = $(this);
					            var uploader = me.closest('.qq-uploader');
					            
					            me.closest('li').remove();
					            
					            if(uploader.find('.drag_img').children().length){
					                uploader.find('.drag_txt').fadeOut();
					            }else{
					                uploader.find('.drag_txt').fadeIn();                
					            }
					            
					            config.onRemoveComplete();
					        });            

					        if(config.remove){
					            $('#'+config.id).on("click touchend", '.icon-trash', function(){
					                App.Helpers.removeUploadedFiles({
					                    obj: $('#'+config.id),
					                    url: config.removeItemURL,
					                    params: config.customParams,
					                    onComplete: config.onRemove
					                });
					            });
					        }			

					    }

					},

        			/*for::: valums plugin: remove uploaded file function */
					removeUploadedFiles: function(opts){
					    var config = {
					        obj: false,
					        url: false,
					        params: {},
					        onComplete: function(){}
					    };
					    if(opts) $.extend(config, opts);
					    
					    if(config.url){
					        $.ajax({
					            type: "POST",
					            data: config.params,
					            url: config.url,
					            dataType:'json',
					            success: function(data){
					                if(data.error){
					                }else{
					                    config.obj.find('.drag_img').html("");
					                    config.obj.find('.qq-upload-list').html("");
					                    config.obj.find('.drag_txt').fadeIn();
					                    config.obj.find('.qq-upload-button').fadeIn();
					                    config.onComplete(config.obj);
					                }                            
					            }
					        });
					    }else{
					    	config.obj.find('.qq-upload-drop-area').css('display','none');
					        config.obj.find('.drag_img').html("");
					        config.obj.find('.qq-upload-list').html("");
					        config.obj.find('.qq-upload-list').css('z-index','-1');
					        config.obj.find('.drag_txt').fadeIn();
					        config.obj.find('.qq-upload-button').fadeIn();
					        config.onComplete(config.obj);
					    }

					},

        			loadImage: function(opts){
					    var config = {
					        css: false,
					        domTarget: false,
					        fileName : false,
					        remove: false,
					        view: false,
					        target: false,        
					        url: false,
					        url_prefix: App.API_DOMAIN,        
					        
					        onComplete: function(){},
					        onError: function(){}
					    };
					    if(opts) $.extend(config, opts);

					    if( (config.url && config.target.length) || config.domTarget.length){
					        if(config.target){
					            config.target.html(App.Components.spinner({css: 'small img-thumbnail', src: App.url_spinner_small}));
					            config.target.find('img').fadeIn();
					        }

					        var image = new Image();
					        image.onload = function(){
					            if(config.domTarget){
					                config.domTarget.fadeIn();
					            }else{
					                config.target.html(image);
					                if(config.remove){
					                    config.target.append("<div class='overlay'></div><i class='fa fa-trash-o icon-trash'></i>");
					                }
					                if(config.fileName){
					                	config.target.append("<p class='ellipsis'>"+ config.fileName +"</p>");
					                }
					                /*if(config.view){
					                	if(config.url_prefix){
					                		config.target.append("<a class='fancybox' href=" + config.url_prefix + config.url + "><i class='fa fa-search-plus icon-view'></i></a>");
					                	}else{
					                		config.target.append("<a class='fancybox' href=" + config.url + " title=" + config.url.split('/').pop() + "><i class='fa fa-search-plus icon-view'></i></a>");
					                	}
					                }*/
					                config.target.find('img').hide().fadeIn();
					            }

					            config.onComplete();
					        };
					        image.onerror = function(){
					            if(config.domTarget){
					            }else{
					                config.target.find('img').remove();
					            }
					            
					            config.onError();
					        };
					        
					        if(config.domTarget){
					            image.src = config.domTarget.attr('src');
					        }else{
					            if(config.url_prefix){
					                image.src = config.url_prefix+config.url;
					            }else{
					                image.src = config.url;
					            }

					            if(config.css){
					                image.className = config.css;
					            }
					        }
					      
					    }
					
					},

					setImagePosition: function(){
					    var img = this.target.find('img'),
					        H = this.target.height(),
					        h = img.height();
					        
					    if(!img.hasClass('img-thumbnail') && !img.hasClass('img-circle')){
					    	img.css('margin-top', ((H - h)/2)+"px");
					    }
					
					},

					hasData: function(o) {
					    try{
					        for (var l in o) {
					            if (o.hasOwnProperty(l)) {
					                return true;
					            }
					        }
					    }catch(e){}

					    return false;
					
					}
					
        		})


				function getBrowser() {
				    var ua = window.navigator.userAgent;
				    var msie = ua.indexOf('MSIE ');
				    if (msie > 0) {
				        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
				    }

				    var trident = ua.indexOf('Trident/');
				    if (trident > 0) {
				        var rv = ua.indexOf('rv:');
				        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
				    }

				    var edge = ua.indexOf('Edge/');
				    if (edge > 0) {
				        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
				    }
				    return false;
				}
        	})

}());