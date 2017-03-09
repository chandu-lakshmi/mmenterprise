(function () {
    "use strict";
    
    angular

    	.module('app.components', ['app.constants'])
    	.directive('bucketsView', bucketsView)
    	.directive('epiSearch', epiSearch)
        .directive('socialSharing', socialSharing)
        .directive('scrollTop', scrollTop)
        .directive('copyUrl', copyUrl)
        .directive('checkCharZero', checkCharZero)
        .directive('ripplelink', ripplelink)
        // .directive('toolTip', toolTip)

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
			    }
    		})

    	})

    epiSearch.$inject = ['App'];

	function bucketsView(){
		return{
			restrict:'AE',
			scope:{
				buckets:'=',
				checkIds:'=',
				setFn: '&'
			},
			templateUrl:'templates/components/template-bucket.phtml',
			link:function(scope, element, attr){

				
	   			var bucketColor = ["#229A77", "#21A4AC", "#EE8F3B", "#2A99E0", "#154c50", "#103954", "#342158", "#5B5B29", "#004D40", "#6f2b25"];
			    scope.getColor = function(ind) {
			        return bucketColor[String(ind).slice(-1)];
			    }

			    scope.selectedBktsString;
			    scope.selectedBkts = [];

			    var copy = angular.copy(scope.buckets);
			    scope.addBucketContact = function(src, ind, bucketId){
			        if(src == "public/images/add.svg"){
			          scope.selectedBkts.push(bucketId);
			          scope.buckets[ind].src = "public/images/select.svg";
			        }
			        else{
			          var index = scope.selectedBkts.indexOf(bucketId);
			          scope.selectedBkts.splice(index, 1);
			          scope.buckets[ind].src="public/images/add.svg";
			        }
			        scope.selectedBktsString = scope.selectedBkts.toString();
	    		}
	    		scope.initFn = function(src, bktId){
	    			if(src == 'public/images/select.svg'){
	    				scope.selectedBkts.push(bktId);
	    				scope.selectedBktsString = scope.selectedBkts.toString();
	    			}
	    		}
	    		scope.reset = function(){
	    			scope.buckets  = angular.copy(copy);  			
	    			scope.selectedBkts = [];
	    			scope.selectedBktsString = scope.selectedBkts.toString();
	    		}
	    		scope.setFn({dirFn:scope.reset});
			}
		}
	}

	function epiSearch(App) {
        return {
            scope: {
                opts: '=',
                path: '@'
            },
            templateUrl: function(scope, attrs){
                return attrs.path + 'search.phtml';
            },
            link: function (scope, element) {
                scope.opts = angular.extend({
                    value: "",
                    delay: 1000,
                    progress: false,
                    complete: false,
                    onSearch: function (val) {
                    },
                    onClear: function () {
                    }
                }, scope.opts);

                function reset() {
                    scope.opts.progress = false;
                    scope.opts.complete = false;
                }

                scope.search = function () {
                    scope.opts.complete = false;

                    if (scope.opts.value == '') {
                        if (App.timer.search)
                            clearTimeout(App.timer.search);

                        scope.opts.onClear();
                    } else {
                        scope.opts.progress = true;

                        if (App.timer.search)
                            clearTimeout(App.timer.search);
                        App.timer.search = setTimeout(function () {
                            scope.opts.onSearch(scope.opts.value);
                        }, scope.opts.delay);
                    }
                };

                scope.clear = function (event) {
                    var me = angular.element(event.target),
                            search_box = me.closest('.search-box-wrap').find('.search-box');

                    reset();

                    search_box.val('').focus();
                    scope.opts.onClear();
                };

                element.find('.search-box').on('focus', function (event) {
                    angular.element(event.target).parent().removeClass('inactive');
                });

                element.find('.search-box').on('blur', function (event) {
                    var me = angular.element(event.target);

                    if (me.val() == '') {
                        scope.$apply(function () {
                            reset();
                        });
                        me.parent().addClass('inactive');
                    }
                });
            }
        }
    }

    function socialSharing(){
        return {
            scope: {
                opts: '='
            },
            templateUrl: function(scope, attrs){
                return attrs.path + '/social-sharing.phtml';
            },
            link: function (scope, element) {
                scope.opts = angular.extend({
                    socialIcons: ['facebook', 'twitter', 'linkedin', 'googlePlus']
                }, scope.opts);

                scope.share = function(event){
                    console.log(angular.element(event.target))
                }
            },
            controller: function(){
                this.facebook = function(post){
                    var share_object = {
                        method: "feed",
                        name: post.post_title,
                        link: post.post_url,
                        picture: post.post_img || '',
                        caption: (post.post_title < 100 ? post.post_title : ''),                
                        description: $('<div />').html(post.post_msg).text(),
                        quote: 'click below to apply'
                    };
                    
                    FB.ui(share_object, function (response) {
                        if (response && !response.error_code) {
                            console.log(response)
                        }
                    });
                }
                this.twitter = function(obj){
                    var twitter_window = window.open('', "Twitter", "status = 1, left = 430, top = 170, height = 500, width = 420, resizable = 0")
                    twitter_window.location.href = "https://twitter.com/intent/tweet?text=" + obj.text + "&url=" + obj.url + "&hashtags=" + obj.hashtags + "&via=" + obj.via + "&related=" + obj.related; 
                }
                this.linkedin = function(obj){
                    var linkedin_window = window.open('', "Linkedin", "status = 1, left = 430, top = 170, height = 500, width = 420, resizable = 0")
                    linkedin_window.location.href = "https://www.linkedin.com/shareArticle?mini=true&url=" + obj.url + "&title=" + obj.title + "&summary=" + obj.summary + "&source=" + obj.source;
                }
                this.googlePlus = function(obj){
                    var google_window = window.open('', "GooglePlus", "status = 1, left = 430, top = 170, height = 500, width = 420, resizable = 0")
                    google_window.location.href = "https://plus.google.com/share?url=" + obj.url;
                }
            },
            controllerAs: 'socialShareCrtl'
        }
    }

    function scrollTop(){
        return {
            template: '<div id="dyscrollup-btn"><img src="public/images/arrow-top-green.svg" alt="up"/></div>',
            link: function () {
                $(window).on("scroll", function() {
                    $(window).scrollTop() > 300 ? $('scroll-top div').addClass('move') : $('scroll-top div').removeClass('move');
                });
                $("#dyscrollup-btn").on("click", function(e) {
                    e.preventDefault();
                    $("html, body").animate({
                        scrollTop: 0
                    }, 1000);
                    return false;
                });
            }
        }
    }

    function copyUrl(){
        return {
            scope:{
                url : '@',
                btnText : '@'
            },
            templateUrl: '../templates/components/copy-url.phtml',
            link : function(){
            document.getElementsByClassName('btns')[0].addEventListener('click', copy, true);
            document.getElementsByClassName('btns')[0].addEventListener('touchstart', copy, true);

             // event handler
                function copy(e) {

                // find target element
                    var 
                      t = e.target,
                      c = t.dataset.copytarget,
                      inp = (c ? document.querySelector(c) : null);
                      
                    // is element selectable?
                    if (inp && inp.select) {
                      
                      // select text
                      inp.select();

                      try {
                        // copy text
                        document.execCommand('copy');
                        inp.blur();
                        
                        // copied animation
                        t.classList.add('copied');
                        setTimeout(function() { t.classList.remove('copied'); }, 1500);
                      }
                      catch (err) {
                        alert('please press Ctrl/Cmd+C to copy');
                      }
                      
                    }
                }
            }
        }
    }


    function checkCharZero(){
        return {
            restrict : 'AC',
            link: function (scope, element) {
                element.bind("keypress", function (e) {
                    var pos = element[0].selectionStart;
                    if(e.charCode == 0){
                        return true;
                    }
                    if(!(e.charCode >= 48 && e.charCode <= 57)){
                        e.preventDefault();
                    }else{
                        if(pos == 0 && e.charCode == 48){
                            e.preventDefault(); 
                        }
                    }
                });
            }
        }
    }


    function ripplelink(){
        return {
            restrict : 'AC',
            link: function (scope, element) {
                var ink, d, x, y;
                element.bind('click', '.ripplelink', function(e){
                    if($(this).find(".ink").length === 0){
                        $(this).prepend("<span class='ink'></span>");
                    }
                         
                    ink = $(this).find(".ink");
                    ink.removeClass("animate");
                     
                    if(!ink.height() && !ink.width()){
                        d = Math.max($(this).outerWidth(), $(this).outerHeight());
                        ink
                            .css({
                                height: d,
                                width: d
                            });
                    }
                     
                    x = e.pageX - $(this).offset().left - ink.width()/2;
                    y = e.pageY - $(this).offset().top - ink.height()/2;
                     
                    ink
                        .css({
                            top: y+'px',
                            left: x+'px',
                            background: $(this).data("ripple-color")
                        })
                    .addClass("animate");

                /*window.setTimeout(function(){
                    ink.remove();
                }, 2000);*/
                });
            }
        }
    }

    /*function toolTip(){
        return {
            restrict : 'AC',
            link: function (scope, element) {
                element.bind('mouseenter mousemove', function(e){
                    if(e.currentTarget.offsetWidth < e.currentTarget.scrollWidth)
                        element[0].setAttribute('title', element[0].innerText)
                    else
                        element[0].removeAttribute('title')
                });
            }
        }
    }*/

}());