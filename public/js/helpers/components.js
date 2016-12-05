(function () {
    "use strict";
    
    angular

    	.module('app.components', ['app.constants'])
    	.directive('bucketsView', bucketsView)
    	// .directive('epiSearch', epiSearch)

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

	function bucketsView(){
		return{
			restrict:'AE',
			scope:{
				buckets:'=',
				checkIds:'=',
				setFn: '&'
			},
			templateUrl:'templates/campaigns/template-bucket.phtml',
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

	/*function epiSearch() {
        return {
            scope: {
                opts: '='
            },
            templateUrl: 'templates/components/search.html',
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
    }*/

}());