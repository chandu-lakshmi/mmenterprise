(function () {
    "use strict";
    angular

            .module('app.components', ['app.constants'])

            .controller('CommonConfirmMessage', CommonConfirmMessage)

            .service('detectBrowser', detectBrowser)

            .directive('bucketsView', bucketsView)
            .directive('epiSearch', epiSearch)
            .directive('socialSharing', socialSharing)
            .directive('scrollTop', scrollTop)
            .directive('copyUrl', copyUrl)
            .directive('checkCharZero', checkCharZero)
            .directive('ripplelink', ripplelink)
            .directive('dotdotdot' , dotdotdot)
            .directive('myslider', myslider)
            .directive('scheduleStart' , scheduleStart)
            .directive('scheduleEnd' , scheduleEnd)
            .directive('mmUploader', mmUploader)

            .filter('unique', unique)


            //.directive('epiMultipleSelect', epiMultipleSelect)
            // .directive('toolTip', toolTip)

            .config(function (App) {
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
            

    CommonConfirmMessage.$inject = ["$scope", "$uibModalInstance", "paramsMdService", '$window', '$http', '$timeout', 'App'];
    epiSearch.$inject = ['App'];
    myslider.$inject = ['$timeout'];


    
    function CommonConfirmMessage($scope, $uibModalInstance, paramsMdService, $window, $http, $timeout, App){
        var scope = this;


        this.data = paramsMdService;
        this.actionScreen = true;
        this.success_loader = false;
        this.userConfirm = function(){
            scope.success_loader = true;
            
            $http({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                method: 'POST',
                data: $.param(paramsMdService.params),
                url: App.base_url + paramsMdService.apiEndPoint
            })
            .success(function (response) {
                if (response.status_code == 200) {
                    paramsMdService.callback(response);
                    scope.responseMsg = response.message.msg[0];                    
                    scope.actionScreen = false;
                    $timeout(function(){
                      $uibModalInstance.dismiss('cancel');  
                  }, 2000);
                }
                else if (response.status_code == 400) {
                    $window.location = App.base_url + 'logout';
                }
            });
        }

        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            $uibModalInstance.dismiss('cancel');
        })
    }

    function bucketsView() {
        return{
            restrict: 'AE',
            scope: {
                datasource : '='
            },
            templateUrl: 'templates/components/template-bucket.phtml',
            controller : function ($scope, $timeout) {
                
                var vm = this,
                        colorPicker;

                this.selectedBktsString;
                this.selectedBkts = [];
                
                if(this.datasource.type == 1) {
                    colorPicker = ["#229A77", "#21A4AC", "#EE8F3B", "#2A99E0", "#154c50", "#103954", "#342158", "#5B5B29", "#004D40", "#6f2b25"];
                }
                else {
                    colorPicker = ["#5d80cd", "#e8655c", "#81a757", "#8b5eb2", "#e2a746", "#947956", "#a8a53d", "#607D8B", "#484848", "#3c8576"];
                }
                
                this.getColor = function (ind) {
                    return colorPicker[String(ind).slice(-1)];
                }

                this.addBucketContact = function (bucketId) {
                    var index = vm.selectedBkts.indexOf(bucketId);
                    if (index == -1) {
                        vm.selectedBkts.push(bucketId);
                        changePic(bucketId, "public/images/select.svg");
                    }
                    else {
                        vm.selectedBkts.splice(index, 1);
                        changePic(bucketId, "public/images/add.svg");
                    }
                    vm.selectedBktsString = vm.selectedBkts.toString();
                }

                this.init = function (src, bktId) {
                    if (src == 'public/images/select.svg') {
                        vm.selectedBkts.push(bktId);
                        vm.selectedBktsString = vm.selectedBkts.toString();
                    }
                }

                function changePic(bucketId, src){
                    angular.forEach(vm.datasource.list, function(bucket, index){
                        if(bucket.bucket_id == bucketId){
                            bucket.src = src;
                        }
                    });
                }
            },
            controllerAs : 'bucketsViewCtrl',
            bindToController: true
        }
    }

    function epiSearch(App) {
        return {
            scope: {
                opts: '=',
                path: '@'
            },
            templateUrl: function (scope, attrs) {
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

    function socialSharing() {
        return {
            scope: {
                opts: '='
            },
            templateUrl: function (scope, attrs) {
                return attrs.path + '/social-sharing.phtml';
            },
            link: function (scope, element) {
                scope.opts = angular.extend({
                    socialIcons: ['facebook', 'twitter', 'linkedin', 'googlePlus']
                }, scope.opts);
                scope.share = function (event) {
                    console.log(angular.element(event.target))
                }
            },
            controller: function () {
                this.facebook = function (post) {
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
                this.twitter = function (obj) {
                    var twitter_window = window.open('', "Twitter", "status = 1, left = 430, top = 170, height = 500, width = 420, resizable = 0")
                    twitter_window.location.href = "https://twitter.com/intent/tweet?text=" + obj.text + "&url=" + obj.url + "&hashtags=" + obj.hashtags + "&via=" + obj.via + "&related=" + obj.related;
                }
                this.linkedin = function (obj) {
                    var linkedin_window = window.open('', "Linkedin", "status = 1, left = 430, top = 170, height = 500, width = 420, resizable = 0")
                    linkedin_window.location.href = "https://www.linkedin.com/shareArticle?mini=true&url=" + obj.url + "&title=" + obj.title + "&summary=" + obj.summary + "&source=" + obj.source;
                }
                this.googlePlus = function (obj) {
                    var google_window = window.open('', "GooglePlus", "status = 1, left = 430, top = 170, height = 500, width = 420, resizable = 0")
                    google_window.location.href = "https://plus.google.com/share?url=" + obj.url;
                }
            },
            controllerAs: 'socialShareCrtl'
        }
    }

    function scrollTop($window, $anchorScroll, $location) {
        return {
            template: '<div class="{{className}}"><img src="public/images/arrow-top-green.svg" alt="up"/></div>',
            link: function (scope, ele, attr) {
                scope.className = attr.viewLeftRight;
                var id = attr.id ? '#' + attr.id : window,
                    clsName = 'move-' + scope.className;
                $(id).on("scroll", function () {
                    $(id).scrollTop() > 300 ? $('scroll-top div').addClass(clsName) : $('scroll-top div').removeClass(clsName);
                });
                ele.on("click", function (e) {
                    e.preventDefault();
                    if(attr.id){
                        $(id).stop().animate({ scrollTop: 0 }, 1000);
                    }else{
                        $("html, body").animate({
                            scrollTop: 0
                        }, 1000);
                    }
                });
            }
        }
    }

    function copyUrl() {
        return {
            scope: {
                url: '@',
                btnText: '@'
            },
            templateUrl: '../templates/components/copy-url.phtml',
            link: function () {
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
                            setTimeout(function () {
                                t.classList.remove('copied');
                            }, 1500);
                        }
                        catch (err) {
                            alert('please press Ctrl/Cmd+C to copy');
                        }

                    }
                }
            }
        }
    }


    function checkCharZero() {
        return {
            restrict: 'AC',
            link: function (scope, element) {
                element.bind("keypress", function (e) {
                    var pos = element[0].selectionStart;
                    if (e.charCode == 0) {
                        return true;
                    }
                    if (!(e.charCode >= 48 && e.charCode <= 57)) {
                        e.preventDefault();
                    } else {
                        if (pos == 0 && e.charCode == 48) {
                            e.preventDefault();
                        }
                    }
                });
            }
        }
    }


    function ripplelink() {
        return {
            restrict: 'AC',
            link: function (scope, element) {
                var ink, d, x, y;
                element.bind('click', '.ripplelink', function (e) {
                    if ($(this).find(".ink").length === 0) {
                        $(this).prepend("<span class='ink'></span>");
                    }

                    ink = $(this).find(".ink");
                    ink.removeClass("animate");
                    if (!ink.height() && !ink.width()) {
                        d = Math.max($(this).outerWidth(), $(this).outerHeight());
                        ink
                                .css({
                                    height: d,
                                    width: d
                                });
                    }

                    x = e.pageX - $(this).offset().left - ink.width() / 2;
                    y = e.pageY - $(this).offset().top - ink.height() / 2;
                    ink
                            .css({
                                top: y + 'px',
                                left: x + 'px',
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


    function dotdotdot($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attributes) {
                scope.$watch(attributes.dotdotdot, function() {
                    setTimeout(function() {
                        element.dotdotdot();
                    });
                });
            }
        }
    }

    function unique() {
        return function (items, filterOn) {

            if (filterOn === false) {
              return items;
            }

            if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
              var hashCheck = {}, newItems = [];

              var extractValueToCompare = function (item) {
                if (angular.isObject(item) && angular.isString(filterOn)) {
                  return item[filterOn];
                } else {
                  return item;
                }
              };

              angular.forEach(items, function (item) {
                var valueToCheck, isDuplicate = false;

                for (var i = 0; i < newItems.length; i++) {
                  if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                    isDuplicate = true;
                    break;
                  }
                }
                if (!isDuplicate) {
                  newItems.push(item);
                }

              });
              items = newItems;
            }
            return items;
        };
    }

    function myslider($timeout) {
        return {
            scope:{
                data : '='
            },
            template : '<div id="{{data.id}}"><div id="{{data.id}}-handle" class="ui-slider-handle"></div></div',
            restrict :'AE',
            link:function(scope, element, attr){
                $timeout(function(){
                    var handle = $( "#" + scope.data.id + '-handle' );
                    $('#' + scope.data.id ).slider({
                        min: scope.data.min,
                        max: scope.data.max,
                        range: "max",
                        value: scope.data.value,
                        create: function() {
                            var initVal = $( this ).slider( "value" );
                            handle.text( initVal );
                            scope.data.model = initVal;
                        },
                        slide: function( event, ui ) {
                            handle.text( ui.value )
                            scope.data.model = ui.value;
                        }
                    });
                })
            }
        }
    }
    
    function detectBrowser() {
        this.getBrowser = function () {
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
    }

    function scheduleStart() {
        return {
            restrict: 'AC',
            require: '?ngModel',
            link: function (scope, element, attr, ngModel) {
                
                if (!ngModel) return;
                
                ngModel.$render = function() {
                  element.val(ngModel.$viewValue || '');
                };

                element.on("dp.change", function (e) {
                    scope.$apply(function() {
                       ngModel.$setViewValue( !e.date ? '' : e.date);
                    });    
                    element.closest('.sib').next().find('input').data("DateTimePicker").minDate(e.date);
                });  

                element.datetimepicker({
                    minDate : new Date(),
                    ignoreReadonly: true,
                    format: 'MMM DD, YYYY  hh:mm A',
                    sideBySide : true,
                    useCurrent:true
                });
            }
        }
    }

    function scheduleEnd() {
        return {
            restrict: 'AC',
            require: '?ngModel',
            link: function (scope, element, attr, ngModel) {
                
                if (!ngModel) return;
                
                ngModel.$render = function() {
                  element.val(ngModel.$viewValue || '');
                };

                element.on("dp.change", function (e) {
                    scope.$apply(function() {
                       ngModel.$setViewValue( !e.date ? '' : e.date);
                    }); 
                   element.closest('.sib').prev().find('input').data("DateTimePicker").maxDate(e.date);
                }); 

                element.datetimepicker({
                    minDate : new Date(),
                    ignoreReadonly: true,
                    format: 'MMM DD, YYYY  hh:mm A',
                    sideBySide : true,
                    useCurrent : false
                });
            }
        }
    }

    function mmUploader() {
        return{
            restrict: 'EA', 
            scope: {
              datasource : '='
            },
            template : '<div id="{{mmUploaderCtrl.opts.id}}"></div>' ,
            controller: function($scope, $timeout, App){
                var vm = this;
                    vm.opts = vm.datasource;

                function init() {
                    var $company_logo = $('#' + vm.opts.id);
                    App.Helpers.initUploader({
                        id: vm.opts.id,
                        dragText: "",
                        uploadButtonText: vm.opts.uploadButtonText,
                        size: vm.opts.size,
                        allowedExtensions: vm.opts.allowedExtensions,
                        action: App.base_url + vm.opts.action,
                        showFileInfo: false,
                        shortMessages: true,
                        remove: true,
                        file_name: vm.opts.file_name,
                        path_name: vm.opts.path_name,
                        onSubmit: function (id, name) {
                            $company_logo.find('.qq-upload-list').css('z-index', '0');
                        },
                        onComplete: function (id, name, response) {
                            if (response.success) {
                                $company_logo.find('.qq-upload-list').css('z-index', '-1');
                                $company_logo.find('.qq-upload-drop-area').css('display', 'block');
                                vm.update = true;
                                $scope.$apply();
                                App.Helpers.loadImage({
                                    target: $company_logo.find('.drag_img'),
                                    css: 'img-thumbnail',
                                    remove: true,
                                    view: true,
                                    fileName : response.org_name,
                                    url_prefix: App.pre_path,
                                    url: response.filename.split('/').slice(-2).join('/'),
                                    onComplete: App.Helpers.setImagePosition,
                                    onError: function () {
                                        $company_logo.find('.qq-upload-button').show();
                                    }
                                });
                            }
                        },
                        showMessage: function (msg, obj) {
                            $company_logo.closest('.form-group').find('div.error').hide();
                            $company_logo.find('.qq-upload-list').css('z-index', '0');
                            $(obj._listElement).fadeIn();
                        },
                        onRemove: function () {
                            vm.update = true;
                            $scope.$apply();
                        },
                        onRemoveComplete: function () {
                            $company_logo.find('.qq-upload-list').css('z-index', '-1');
                        }
                    });
                }
                
                // initial company logo qq-uploader
                function previewImg(url, name) {
                    var logo = $('#' + vm.opts.id);
                    if(url){
                        logo.find('.qq-upload-drop-area').show();
                        logo.find('.qq-upload-list').html('');
                        App.Helpers.loadImage({
                            target: logo.find('.drag_img'),
                            css: 'img-thumbnail',
                            remove: true,
                            url_prefix: false,
                            view: true,
                            url: url,
                            onComplete: function () {
                                logo.find('.qq-upload-list').append("<li><input type='hidden' value='" + url + "' name='" + name + "'/></li>").show();
                            },
                            onError: function () {
                                logo.find('.qq-upload-drop-area').hide();
                                logo.find('.qq-upload-button').show();
                            }
                        });
                    }else{
                        App.Helpers.removeUploadedFiles({
                            obj: logo
                        })
                    }
                }

                
                $timeout(function(){
                    init();
                    vm.opts.previewImg(previewImg);
                })

            },
            controllerAs: 'mmUploaderCtrl',
            bindToController: true
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

    /*function epiMultipleSelect() {
        return {
            restrict: 'EA',
            scope: {
                model: '=',
                options: '=',
            },
            template: 
                    '<md-input-container class="ml-sl">'+
                    '   <label>White Listing</label>' +
                    '   <input type="text" ng-keyup="filter(search)" ng-model="search">' +
                    '   <i class="material-icons ic-rt">search</i>' +
                    '</md-input-container>' +
                    '<ul class="dp-dw">' +
                    '   <li ng-repeat="opt in options" layout="row">' +
                    '       <span ng-bind="opt.name"></span>' +
                    '       <span flex></span>' +
                    '       <md-checkbox></md-checkbox>' +
                    '   </li>' +
                    '</ul>' ,
            link: function (scope, element) {
                element.find('.search-box').on('focus', function (event) {
                    angular.element(event.target).parent().removeClass('inactive');
                });
                
                scope.filter = function(search){
                    console.log(scope.options)
                }
            }
        }
    }*/

}());