$.extend(App.Components, {
    cookie: function (key, value, options) {
        //key and at least value given, set cookie...
        if (arguments.length > 1 && String(value) !== "[object Object]") {
            options = jQuery.extend({expires: 30}, options);

            if (value === null || value === undefined) {
                options.expires = -1;
            }

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }

            value = String(value);

            return (document.cookie = [
                encodeURIComponent(key), '=',
                options.raw ? value : encodeURIComponent(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path ? '; path=' + options.path : '',
                options.domain ? '; domain=' + options.domain : '',
                options.secure ? '; secure' : ''
            ].join(''));
        }

        // key and possibly options given, get cookie...
        options = value || {};
        var result, decode = options.raw ? function (s) {
            return s;
        } : decodeURIComponent;
        return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
    },
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
});

angular.module('app.components', [])

        /*
         * {
         * progress: false,
         * complete: false,
         * onSearch: function(){},
         * onClear: function(){}
         * }
         */
        .directive('epiSearch', [function () {
                return {
                    scope: {
                        opts: '='
                    },
                    templateUrl: App.base_url + 'public/templates/components/search.html',
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
            }])

        .directive('dropDown', function () {
            return {
                restrict: 'C',
                templateUrl: App.base_url + 'public/templates/components/dropdown.html',
                scope: {
                    list: '=list',
                    selectedLable: '=selectedLable',
                    ismultiple: '=ismultiple',
                    type: '=type',
                    opts: '='
                },
                link: function ($scope, elem, attr) {
                    $scope.getSecondLevel = function (id, type, event) {
                        if ($scope.ismultiple && $scope.type == 'banner') {

                        }
                    }
                }
            }
        })

        .directive('singleList', [function () {
                return {
                    restrict: 'C',
                    scope: {
                        list: '=',
                        model: '=',
                        onUpdate: '&',
                        isEditable: '=',
                        customLabel: "=?"
                    },
                    templateUrl: function (elem, attrs) {
                        return attrs.templateUrl || App.base_url + 'public/templates/components/single-list.html'
                    },
                    controller: ['$scope', function ($scope) {

                            function init() {
                                if ($scope.list.length && $scope.model == undefined) {
                                    $scope.model = $scope.list[0];
                                }
                            }

                            this.toggled = function (isOpen) {

                                this.isOpen = isOpen;
                            }

                            this.selectItem = function (item) {
                                if ($scope.model != item) {
                                    $scope.model = item;
                                    $scope.onUpdate({model: $scope.model});
                                }
                            }

                            init();
                        }],
                    controllerAs: 'selectCtrl'
                }
            }])

        .directive('multiList', [function () {
                return {
                    restrict: 'C',
                    scope: {
                        list: '=',
                        model: '=',
                        onUpdate: '&',
                        isEditable: '='
                    },
                    templateUrl: App.base_url + 'public/templates/components/multi-list.html',
                    controller: ['$scope', function ($scope) {

                            function init() {
                                if ($scope.list.length && $scope.model == undefined) {
                                    if ($scope.list[0].options && $scope.list[0].options.length) {
                                        $scope.model = $scope.list[0].options[0];
                                    }
                                }
                            }

                            this.toggled = function (isOpen) {
                                this.isOpen = isOpen;
                            }

                            this.selectItem = function (item) {
                                $scope.model = item;

                                $scope.onUpdate({model: $scope.model});
                            }

                            $scope.$watch('list', function (value) {
                                init();
                            }, true);
                        }],
                    controllerAs: 'selectCtrl'
                }
            }])

        .directive('divisionBannerList', [function () {
                return {
                    restrict: 'C',
                    scope: {
                        list: '=',
                        divisionModel: '=',
                        bannerModel: '=',
                        competitorModel: '=',
                        onUpdate: '&',
                        isEditable: '='
                    },
                    templateUrl: App.base_url + 'public/templates/components/division-banner-list.html',
                    controller: ['$scope', function ($scope) {
                            var self = this,
                                    selected_items = [];

                            this.active_list = [];
                            this.selected_label = "";

                            function init() {
                                updateList();
                                updateSelection();
                                updateLabel();
                            }

                            function updateList() {
                                self.active_list = $scope.list;
                            }

                            function updateSelection() {
                                selected_items = [];

                                if ($scope.divisionModel == undefined) {
                                    var list = {};
                                    if (self.active_list.length) {
                                        list = self.active_list[0];
                                    }
                                    if (list.options && list.options.length) {
                                        $scope.divisionModel = list.options[0];
                                        if ($scope.divisionModel.children && $scope.divisionModel.children.length) {
                                            list = $scope.divisionModel.children[0];
                                            if (list.options && list.options.length) {
                                                $scope.bannerModel = list.options[0];
                                            }
                                        }
                                    }
                                }

                                if ($scope.divisionModel) {
                                    selected_items.push($scope.divisionModel);
                                    if ($scope.bannerModel) {
                                        selected_items.push($scope.bannerModel);
                                    } else if ($scope.competitorModel) {
                                        selected_items.push($scope.competitorModel);
                                    }
                                }
                            }

                            function updateModel() {
                                if (selected_items.length) {
                                    $scope.divisionModel = selected_items[0];
                                    $scope.bannerModel = null;
                                    $scope.competitorModel = null;

                                    if (selected_items.length > 1) {
                                        if ($scope.divisionModel.children[0].options.indexOf(selected_items[1]) > -1) {
                                            $scope.bannerModel = selected_items[1];
                                        } else {
                                            $scope.competitorModel = selected_items[1];
                                        }
                                    }
                                } else {
                                    $scope.divisionModel = null;
                                }

                                $scope.onUpdate({division: $scope.divisionModel, banner: $scope.bannerModel, competitor: $scope.competitorModel});
                            }

                            function updateLabel() {
                                if (selected_items.length) {
                                    if ($scope.list[($scope.list.length - 1)].options.indexOf(selected_items[0]) > -1) {
                                        self.selected_label = "Selected Division > " + $scope.divisionModel.label;
                                    } else {
                                        self.selected_label = $scope.divisionModel.label;
                                        if ($scope.bannerModel && $scope.bannerModel.label) {
                                            self.selected_label += " > " + $scope.bannerModel.label;
                                        } else if ($scope.competitorModel && $scope.competitorModel.label) {
                                            self.selected_label += " > " + $scope.competitorModel.label;
                                        }
                                    }
                                } else {
                                    self.selected_label = "Select Division";
                                }
                            }

                            this.toggled = function (isOpen) {
                                this.isOpen = isOpen;

                                selected_items = [];
                                if (!this.isOpen) {
                                    updateList();
                                }
                            }

                            this.selectItem = function (item, event) {
                                if (item.children) {
                                    event.stopPropagation();
                                    self.active_list = item.children;
                                    selected_items = [item];
                                } else {
                                    selected_items.push(item);

                                    updateModel();
                                    updateLabel();
                                }
                            }

                            $scope.$watch('list', init);

                            init();

                        }],
                    controllerAs: 'selectCtrl'
                }
            }])

        .directive('popOver', function ($compile) {
            var itemsTemplate = '';
            itemsTemplate += '<div class="tri-state-checkbox"';
            itemsTemplate += 'data-list="list" ';
            itemsTemplate += 'data-selectedlist="selected_list"';
            itemsTemplate += 'data-label="lable"';
            itemsTemplate += 'data-name="name">';
            itemsTemplate += '</div>"';
            var getTemplate = function (contentType) {
                var template = '';
                switch (contentType) {
                    case 'list':
                        template = itemsTemplate;
                        break;
                }
                return template;
            }
            return {
                restrict: "A",
                transclude: true,
                container: 'body',
                template: "<span ng-transclude></span>",
                link: function (scope, element, attrs) {
                    var popOverContent;
                    if (scope.list) {
                        var html = getTemplate("list");

                        popOverContent = $compile(html)(scope);
                    }
                    var options = {
                        content: popOverContent,
                        placement: "top",
                        html: true,
                        title: scope.title
                    };
                    $(element).popover(options);
                },
                scope: {
                    list: '=',
                    selected_list: '=',
                    lable: '=',
                    name: '=',
                    title: '@'
                }
            };
        })

        .directive('daterangeList', [function () {
                return {
                    restrict: 'C',
                    scope: {
                        list: '=',
                        model: '=',
                        rangeObj: '=',
                        date: '=',
                        onUpdate: '&',
                        isEditable: '='
                    },
                    templateUrl: App.base_url + 'public/templates/components/daterange-list.html',
                    controller: ['$scope', '$timeout', function ($scope, $timeout) {

                            if (!$scope.rangeObj) {
                                $scope.rangeObj = {};
                            }

                            var self = this;

                            this.selected_item = {};
                            this.rangeOptions = [
                                //{id: 'day', label: 'Day', min: 1, max: 90},
                                {id: 'week', label: 'Week', min: 1, max: 10},
                                {id: 'year', label: 'Year', min: 1, max: 3}
                            ];
                            this.rangeOptionsById = {};
                            angular.forEach(this.rangeOptions, function (opt) {
                                self.rangeOptionsById[opt.id] = opt;
                            });

                            this.rangeObj = {
                                opt: self.rangeOptionsById[$scope.rangeObj.type] || this.rangeOptions[1],
                                param: $scope.rangeObj.param || '+',
                                val: $scope.rangeObj.val || 1
                            };
                            this.tempRangeObj = {
                                opt: self.rangeOptionsById[$scope.rangeObj.type] || this.rangeOptions[1],
                                param: $scope.rangeObj.param || '+',
                                val: Number($scope.rangeObj.val) || 1
                            };
                            this.date = $scope.date ? $scope.date : moment().format('MM/DD/YYYY');


                            function init() {
                                if ($scope.list.length && $scope.model == undefined) {
                                    $scope.model = $scope.list[0];
                                }
                            }

                            this.toggled = function (isOpen) {
                                this.isOpen = isOpen;

                                if (!this.isOpen) {
                                    if (this.selected_item.id == 1) {
                                        if (this.tempRangeObj.val) {
                                            $scope.model = angular.extend({}, this.selected_item);
                                            this.rangeObj = angular.extend({}, this.tempRangeObj);
                                            $scope.onUpdate({model: $scope.model, range: this.rangeObj});
                                        }
                                    } else if (this.selected_item.id == 2) {
                                        if (this.date) {
                                            $scope.model = angular.extend({}, this.selected_item);
                                            $scope.onUpdate({model: $scope.model, date: this.date});
                                        }
                                    }

                                    this.selected_item = {};
                                }
                            }

                            this.selectItem = function (event, item) {
                                if (item.id >= 1) {
                                    event.stopPropagation();
                                    this.selected_item = item;

                                    if (item.id == 2) {
                                        $timeout(function () {
                                            $('.my-date').datetimepicker({
                                                format: 'MM/DD/YYYY',
                                                keepOpen: true,
                                                inline: true,
                                            }).on('dp.change', function (e) {
                                                self.date = moment(e.date).format('MM/DD/YYYY');
                                            });
                                        }, 10);
                                    }
                                } else {
                                    $scope.model = item;
                                    $scope.onUpdate({model: $scope.model});
                                }
                            }

                            this.changeDateOption = function () {
                                if (this.tempRangeObj.val > this.tempRangeObj.opt.max) {
                                    this.tempRangeObj.val = this.tempRangeObj.opt.max;
                                }
                            }

                            this.selectParam = function (val) {
                                this.tempRangeObj.param = val;
                            }

                            this.stopPropagation = function (event) {
                                event.stopPropagation();
                            }

                            init();
                        }],
                    controllerAs: 'selectCtrl'
                }
            }])

        .directive('ajaxOverlay', [function () {
                return {
                    scope: {
                        opts: '='
                    },
                    templateUrl: App.base_url + 'public/templates/components/ajax_overlay.html',
                    link: function (scope, element) {
                        /*scope.$watch('opts.is_active', function(new_value){
                         if(new_value){
                         element.parent().addClass('overlay-in');
                         }else{
                         element.parent().removeClass('overlay-in');
                         }
                         });*/
                    }
                }
            }])

        .directive('ngPlaceholder', function () {
            return {
                restrict: 'A',
                scope: {
                    placeholder: '=ngPlaceholder'
                },
                link: function (scope, elem, attr) {
                    scope.$watch('placeholder', function () {
                        elem[0].placeholder = scope.placeholder;
                    });
                }
            }
        })

        .directive('sliderImgLoad', [function () {
                return {
                    restrict: 'C',
                    scope: {
                        ngSrc: '@',
                        zoom: '='
                    },
                    link: function (scope, elem, attrs) {
                        function loadImage() {
                            if (!scope.in_progress) {
                                elem.closest('.page').removeClass('active').removeAttr('style');
                                elem.removeClass('active');
                                scope.loadImage(elem, scope.ngSrc, 'active');
                            }
                        }

                        scope.$watch('ngSrc', loadImage);

                        App.Events.subscribe('window.resize', 'imgLoad', loadImage);

                        elem.on('slider.update', loadImage);

                        scope.$on('$destroy', function () {
                            App.Events.unsubscribe('window.resize', 'imgLoad', loadImage);
                        });
                    },
                    controller: function ($scope) {

                        function showImage(elem, cls) {
                            elem.closest('.slide').find('.fa-spinner').fadeOut(function () {
                                angular.element(this).remove();
                            });

                            if ($scope.zoom) {
                                var container_width = elem.closest('.slide').width(),
                                        container_height = elem.closest('.slide').height(),
                                        original_width = elem.data('width'),
                                        original_height = elem.data('height'),
                                        //width = elem.width(),
                                        height = elem.height(),
                                        //max_scale = original_height / height,
                                        min_scale = height / original_height,
                                        pan = {
                                            x: (container_width - original_width) * 0.5,
                                            y: (container_height - original_height) * 0.5
                                        };

                                elem.data('minScale', min_scale);
                                elem.data('pan', pan);

                                elem.closest('.page').css({
                                    width: original_width,
                                    height: original_height,
                                    transform: 'matrix(' + min_scale + ', 0, 0, ' + min_scale + ', ' + pan.x + ', ' + pan.y + ')'
                                }).addClass(cls);
                            }
                            elem.addClass(cls);
                        }

                        $scope.loadImage = function (elem, src, cls) {
                            $scope.in_progress = true;
                            elem.closest('.slide').append('<i class="fa fa-spinner fa-spin"></i>');

                            var img = new Image();
                            img.onload = function () {
                                elem.data('width', this.width);
                                elem.data('height', this.height);
                                showImage(elem, cls);
                                $scope.in_progress = false;
                            };
                            img.onerror = function () {
                            };
                            img.src = src;
                        }

                    }
                }
            }])

        .directive('imageSlider', ['$document', '$timeout', '$http', '$rootScope', function ($document, $timeout, $http, $root) {
                return {
                    restrict: 'C',
                    templateUrl: App.base_url + 'public/templates/components/slider.html',
                    scope: {
                        viewModel: '=',
                        images: '=list',
                        colIndex: "@",
                        activeSlide: '=',
                        onChange: '&',
                        opts: '=',
                        fullscreen: '=',
                        printurl: '=',
                        permisions: '=',
                        otherBanners: '=',
                        competitorid: '=',
                        activeBanners: '=',
                        switchCompetitor: '=',
                        bannerId: '=',
                        filters: "=",
                        departments: "=",
                        otherAds: "=?",
                        showHotspots: "=",
                        showSales: "="
                    },
                    link: function (scope, elem, attrs, slider) {

                        if (!scope.opts) {
                            scope.opts = {};
                        }

                        // sales
                        scope.showUPCSpinner = false;
                        scope.formData = {
                            department: {id: "0", label: "All Departments"},
                            search_text: ""
                        };
                        scope.popoverIsOpen = false;
                        scope.gridOptions = {
                            enableSorting: true,
                            showGridFooter: true,
                            gridFooterTemplate: '\
                                <div class="foo_popover">\
                                    <div class="row">\
                                        <div class="col-sm-6">\
                                            Total {{grid.appScope.gridOptions.data.length||0}} item{{grid.appScope.gridOptions.data.length>1 ? "s":""}} in {{grid.appScope.formData.department.id=="0" ? grid.appScope.departments.length : 1}} department{{grid.appScope.formData.department.id=="0" ? "s":""}}\
                                        </div>\
                                        <div class="col-sm-6 text-right">\
                                            <ul class="list-inline list-unstyled">\
                                                <li>TOTAL</li>\
                                                <li>{{grid.appScope.totalSales||0}}</li>\
                                               <!-- <li>{{grid.appScope.totalUnits||"-"}}</li>-->\
                                            </ul>\
                                        </div>\
                                        <div class="clearfix"></div>\
                                    </div>\
                                </div>',
                            enableColumnMenus: false,
                            columnDefs: [
                                {field: 'department', displayName: 'Department', width: "15%", cellTooltip: true},
                                {field: 'category_nm', displayName: 'Category', width: "25%", cellTooltip: true},
                                {field: 'upc_dsc', displayName: 'UPC/Name', width: "25%", cellTooltip: true},
                                {field: 'storeId', displayName: 'Store ID', width: "10%"},
                                {field: 'upc_id', displayName: 'UPC ID', width: "15%", cellTooltip: true},
                                {field: 'sales', displayName: 'Sales', width: "10%", cellClass: 'upc_price text-right', cellTooltip: true},
                            ],
                            width: "*",
                            enableColumnResize: true,
                            enableFilter: true,
                            onRegisterApi: function (gridApi) {
                                scope.gridApi = gridApi;
                            },
                            data: []
                        };

                        scope.search_opts = {
                            progress: false,
                            complete: false,
                            onSearch: function (val) {
                                scope.formData.search_text = val;
                                scope.getSalesData();
                            },
                            spinner: $root.App.url_images + 'spinner_small_dark.gif',
                            onClear: function () {
                                scope.formData.search_text = "";
                                scope.getSalesData();
                            }
                        };
                        scope.changeDepartment = function (department) {
                            scope.formData.department = department;
                            scope.getSalesData();
                        };

                        scope.getSalesData = function (clearFilters) {
                            var clearFilters = clearFilters || false;

                            if (clearFilters) {
                                scope.formData.department = {id: "0", label: "All Departments"};
                                scope.formData.search_text = '';
                            }
                            var division = {id: scope.viewModel.productInputs.division, label: scope.viewModel.productInputs.divisionName}
                            var banner = {id: scope.viewModel.productInputs.banner, label: scope.viewModel.productInputs.bannerName}
                            var params = {
                                board: scope.filters.board.id,
                                department: scope.formData.department,
                                search_text: scope.formData.search_text,
                                division: division,
                                banner: banner,
                                start_date: scope.viewModel.productInputs.startDate,
                                end_date: scope.viewModel.productInputs.endDate,
                                week_no: scope.filters.week.week_no,
                                action: "ProductsGrid"
                            };

                            // show spinner
                            scope.showUPCSpinner = true;
                            $http.post(App.base_url + 'codePlusSalesGrid', $.param(params)).then(function (response) {
                                scope.gridOptions.data = response.data.result.rows;
                                scope.totalSales = response.data.total_sales;
                                scope.totalUnits = response.data.total_units;

                                var scopeData = angular.element('.sales_popover_alb').find('.search-box-icn').scope();
                                if (scopeData['opts'] && scopeData['opts'].progress) {
                                    scopeData['opts'].progress = false;
                                    if (scopeData['opts'].value.length) {
                                        scopeData['opts'].complete = true;
                                    }
                                }
//                                if (!scopeData.$$phase) {
//                                    scopeData.$apply();
//                                }

                                $timeout(function () {
                                    scope.showUPCSpinner = false;
                                }, 100);
                            });
                        }

                        var parent_width = elem[0].clientWidth;
                        var drag = {
                            startX: 0,
                            startY: 0,
                            x: 0,
                            y: 0,
                            abs_x: 0,
                            abs_y: 0,
                            is_swipe: true,
                            swipe_timer: false
                        };
                        //see zoomReset function for available properties
                        var zoom = {};
                        var navigator = {};
                        var is_animating = false,
                                is_fullscreen = !!scope.fullscreen;
                        var double_tap = false,
                                touch_start_time = 0,
                                prev_touch_start_time = 0;

                        var $slides,
                                prev_index = 0,
                                current_index = 1,
                                next_index = 2,
                                temp;

                        slider.slides = [];
                        var booleanIsMouseOrTouch = 'touchstart';

                        function init() {
                            if (scope.images && scope.images.length) {
                                slider.index = 0;

                                $slides = elem.find('.slide');
                                slider.slides.push({
                                    $el: $slides.eq(0).attr('class', 'slide prev'),
                                    data: scope.images[slider.index - 1]
                                });
                                slider.slides.push({
                                    $el: $slides.eq(1).attr('class', 'slide current'),
                                    data: scope.images[slider.index]
                                });
                                slider.slides.push({
                                    $el: $slides.eq(2).attr('class', 'slide next'),
                                    data: scope.images[slider.index + 1]
                                });

                                if (scope.opts.onload) {
                                    var img = new Image();
                                    img.onload = scope.opts.onload;
                                    img.src = scope.images[slider.index].url;
                                }

                                setSlides();
                            }
                            //Is Touch Device Or NOt :: Start
                            var booleanIsTouchDevice = !!('ontouchstart' in window || navigator.maxTouchPoints);
                            if (false == booleanIsTouchDevice) {
                                booleanIsMouseOrTouch = 'mousedown';
                            }
                            //Is Touch Device Or NOt :: End
                        }

                        function setSlides() {

                            slider.slides[current_index].$el.attr('class', 'slide current');
                            slider.slides[next_index].$el.attr('class', 'slide next');
                            slider.slides[prev_index].$el.attr('class', 'slide prev');

                            $slides.removeAttr('style');

                            $timeout(function () {
                                updatePageNumber();
                                is_animating = false;
                            }, 30);
                        }

                        function bindEvents() {
                            var handled = false;
                            elem.on(booleanIsMouseOrTouch, '.slide_container.blur', function (e) {

                                if (e.type == "touchstart") {
                                    handled = true;
                                    slider.toggleCompetitors(e);
                                } else if (e.type == "mousedown" && !handled) {
                                    slider.toggleCompetitors(e);
                                } else {
                                    handled = false;
                                }

                            });
                            elem.on(booleanIsMouseOrTouch, '.slide.current', function (e) {
                                //elem.on('mousedown', '.slide.current', function (e) {
                                if (!is_animating && !elem.find('.slide_container').hasClass('blur')) {
                                    var event = e.originalEvent || e;
                                    e.stopPropagation();
                                    //e.preventDefault();

                                    if (scope.opts.zoom && !zoom.container_offset && typeof (slider.slides[current_index]) != 'undefined') {
                                        //because container_offset might change on scroll

                                        zoom.container_offset = slider.slides[current_index].$el.offset();
                                    }
                                    if (zoom.scale && zoom.scale > zoom.min_scale) {
                                        zoom.status = true;
                                    } else {
                                        zoom.status = false;
                                    }

                                    if (zoom.$el && zoom.$el.find('.page_img').hasClass('page_in_progress')) {
                                        swipeStart(event);
                                    } else {
                                        if (event.touches && event.touches.length > 1) {

                                            if (scope.opts.zoom) {
                                                $document.off('mousemove touchmove', swipeMove);
                                                $document.off('mouseup touchend', swipeEnd);
                                                $document.off('mousemove touchmove', panMove);
                                                $document.off('mouseup touchend', panEnd);

                                                zoomStart(event);
                                            }
                                        } else {
                                            prev_touch_start_time = touch_start_time;
                                            touch_start_time = new Date().getTime();

                                            if (scope.opts.zoom && (drag.x > -100 || drag.x < -100) && (touch_start_time - prev_touch_start_time < 300)) {
                                                drag.x = drag.abs_x = 0;
                                                double_tap = true;
                                                zoomToggle(event);
                                            } else if (zoom.status) {
                                                panStart(event);
                                            } else {
                                                swipeStart(event);
                                            }
                                        }
                                    }
                                }
                            });


                            elem.on('touchstart', '.img-navigator .overlay', function (e) {

                                e.stopPropagation();
                                e.preventDefault();
                            });

                            elem.on(booleanIsMouseOrTouch, '.img-navigator .handle', navigatorStart);
                            //elem.on('mousedown', '.img-navigator .handle', navigatorStart);
                        }

                        function zoomReset() {
                            if (zoom.$el && zoom.$el.length && (zoom.scale != zoom.min_scale || zoom.pan.x != zoom.initial_pan.x || zoom.pan.y != zoom.initial_pan.y)) {
                                zoom.$el.find('.page').css('transform', 'matrix(' + zoom.min_scale + ', 0, 0, ' + zoom.min_scale + ', ' + zoom.initial_pan.x + ', ' + zoom.initial_pan.y + ')');
                            }

                            var page_img = slider.slides[current_index].$el.find('.page_img');

                            if (page_img.hasClass('active')) {
                                zoom = {
                                    min_scale: page_img.data('minScale'),
                                    scale: page_img.data('minScale'),
                                    new_scale: page_img.data('minScale'),
                                    initial_pan: angular.extend({}, page_img.data('pan')),
                                    pan: angular.extend({}, page_img.data('pan')),
                                    new_pan: angular.extend({}, page_img.data('pan')),
                                    origin: {x: 0.5, y: 0.5},
                                    start_distance: 0,
                                    $el: slider.slides[current_index].$el,
                                    //container_offset: slider.slides[current_index].$el.offset(),
                                    container_width: slider.slides[current_index].$el.width(),
                                    container_height: slider.slides[current_index].$el.height(),
                                    image_width: page_img.data('width'),
                                    image_height: page_img.data('height')
                                };
                            } else {
                                zoom = {};
                            }
                        }

                        function updateZoomOrigin(median) {
                            var W, H, w, h, offset, origin = {};

                            W = zoom.image_width;
                            H = zoom.image_height;
                            w = W * zoom.scale;
                            h = H * zoom.scale;
                            offset = {
                                left: ((W - w) * 0.5 + zoom.pan.x),
                                top: ((H - h) * 0.5 + zoom.pan.y)
                            };

                            if (median.x < offset.left) {
                                zoom.origin.x = 0;
                            } else if (median.x > offset.left + w) {
                                zoom.origin.x = 1;
                            } else {
                                origin.x = median.x - offset.left;
                                zoom.origin.x = origin.x / w;
                            }
                            if (median.y < offset.top) {
                                zoom.origin.y = 0;
                            } else if (median.y > offset.top + h) {
                                zoom.origin.y = 1;
                            } else {
                                origin.y = median.y - offset.top;
                                zoom.origin.y = origin.y / h;
                            }
                        }

                        function zoomToggle(event) {
                            addOnActivities();
                            if (!zoom.$el) {
                                return true;
                            }
                            var coordinatesObj,
                                    median,
                                    page = zoom.$el.find('.page');


                            if (zoom.scale > zoom.min_scale) {
                                zoom.scale = zoom.min_scale;
                                zoom.pan = angular.extend({}, zoom.initial_pan);
                                zoom.origin = {
                                    x: 0.5,
                                    y: 0.5
                                }

                            } else {


                                if (event.touches && event.touches.length == 1) {

                                    coordinatesObj = event.touches[0];
                                } else if (event.which == 1) {

                                    coordinatesObj = event;
                                }

                                median = {
                                    x: (coordinatesObj.pageX - zoom.container_offset.left),
                                    y: (coordinatesObj.pageY - zoom.container_offset.top)
                                };
                                updateZoomOrigin(median);

                                zoom.scale = 1;
                                zoom.new_pan = {
                                    x: zoom.pan.x + zoom.image_width * (0.5 - zoom.origin.x),
                                    y: zoom.pan.y + zoom.image_height * (0.5 - zoom.origin.y)
                                }
                                panUpdate();
                            }

                            page.addClass('quick-transition');
                            page.css('transform', 'matrix(' + zoom.scale + ', 0, 0, ' + zoom.scale + ', ' + zoom.pan.x + ', ' + zoom.pan.y + ')');
                            is_animating = true;
                            double_tap = true;

                            $timeout(function () {
                                page.removeClass('quick-transition');
                                is_animating = false;
                                double_tap = false;
                            }, 300);

                            navigatorUpdate();
                        }

                        function zoomStart(event) {

                            if (event.touches.length === 2) {
                                var A, B, C, median;

                                A = {
                                    x: (event.touches[0].pageX - zoom.container_offset.left),
                                    y: (event.touches[0].pageY - zoom.container_offset.top)
                                };
                                B = {
                                    x: (event.touches[1].pageX - zoom.container_offset.left),
                                    y: (event.touches[1].pageY - zoom.container_offset.top)
                                };
                                C = {
                                    x: A.y - B.y,
                                    y: A.x - B.x
                                };
                                median = {
                                    x: (A.x + B.x) * 0.5,
                                    y: (A.y + B.y) * 0.5
                                };
                                updateZoomOrigin(median);

                                //according to pythagoras theorem
                                zoom.start_distance = Math.sqrt(Math.pow(C.x, 2) + Math.pow(C.y, 2));

                                $document.on('touchmove', zoomMove);
                                $document.on('touchend', zoomEnd);
                            }
                        }

                        function zoomMove(e) {
                            e.stopPropagation();
                            e.preventDefault();

                            var event = e.originalEvent || e;

                            if (event.touches.length === 2) {
                                var A = {
                                    x: (event.touches[0].pageX - zoom.container_offset.left),
                                    y: (event.touches[0].pageY - zoom.container_offset.top)
                                },
                                B = {
                                    x: (event.touches[1].pageX - zoom.container_offset.left),
                                    y: (event.touches[1].pageY - zoom.container_offset.top)
                                },
                                C = {
                                    x: A.y - B.y,
                                    y: A.x - B.x
                                },
                                //according to pythagoras theorem
                                distance = Math.sqrt(Math.pow(C.x, 2) + Math.pow(C.y, 2)),
                                        w,
                                        h;

                                zoom.new_scale = zoom.scale + ((distance - zoom.start_distance) * 0.003);
                                if (zoom.new_scale < zoom.min_scale - 0.05) {
                                    zoom.new_scale = zoom.min_scale - 0.05;
                                } else if (zoom.new_scale > 1 + 0.2) {
                                    zoom.new_scale = 1 + 0.2;
                                }

                                w = zoom.image_width * (zoom.new_scale - zoom.scale);
                                h = zoom.image_height * (zoom.new_scale - zoom.scale);

                                zoom.new_pan = {
                                    x: zoom.pan.x + w * (0.5 - zoom.origin.x),
                                    y: zoom.pan.y + h * (0.5 - zoom.origin.y)
                                };

                                if (zoom.new_scale.toFixed(2) === '1.00') {
                                    zoom.final_pan = angular.extend({}, zoom.new_pan);
                                }

                                zoom.$el.find('.page').css('transform', 'matrix(' + zoom.new_scale + ', 0, 0, ' + zoom.new_scale + ', ' + zoom.new_pan.x + ', ' + zoom.new_pan.y + ')');
                            }
                        }

                        function zoomEnd() {

                            var adjust = false;

                            if (!isNaN(zoom.new_scale)) {
                                if (zoom.new_scale <= zoom.min_scale) {
                                    adjust = true;
                                    zoom.scale = zoom.min_scale;
                                } else if (zoom.new_scale > 1) {
                                    adjust = true;
                                    zoom.scale = 1;
                                } else {
                                    zoom.scale = zoom.new_scale;
                                }
                                zoom.pan = angular.extend({}, zoom.new_pan);

                                if (adjust) {
                                    var page = zoom.$el.find('.page');

                                    if (zoom.scale == zoom.min_scale) {
                                        zoom.pan = angular.extend({}, zoom.initial_pan);
                                        zoom.origin = {
                                            x: 0.5,
                                            y: 0.5
                                        }
                                    } else if (zoom.scale === 1) {
                                        zoom.pan = angular.extend({}, zoom.final_pan);
                                    }

                                    page.addClass('quick-transition');
                                    page.css('transform', 'matrix(' + zoom.scale + ', 0, 0, ' + zoom.scale + ', ' + zoom.pan.x + ', ' + zoom.pan.y + ')');

                                    $timeout(function () {
                                        page.removeClass('quick-transition');
                                    }, 300);
                                }
                            }

                            $document.off('touchmove', zoomMove);
                            $document.off('touchend', zoomEnd);

                            navigatorUpdate();
                        }

                        function panStart(event) {
                            addOnActivities();
                            startDrag(event);
                            $document.on('mousemove touchmove', panMove);
                            $document.on('mouseup touchend', panEnd);
                        }

                        function panMove(e) {
                            e.stopPropagation();
                            e.preventDefault();
                            var event = e.originalEvent || e;
                            //not needed but written to be on safe side
                            if (event.touches && event.touches.length > 1) {
                                return;
                            }
                            setDragDistance(event);
                            var page = zoom.$el.find('.page');
                            zoom.new_pan.x = zoom.pan.x + drag.x;
                            zoom.new_pan.y = zoom.pan.y + drag.y;

                            page.css('transform', 'matrix(' + zoom.scale + ', 0, 0, ' + zoom.scale + ', ' + zoom.new_pan.x + ', ' + zoom.new_pan.y + ')');
                        }

                        function panUpdate() {
                            var adjust = {
                                left: 0,
                                top: 0
                            };

                            if (!isNaN(zoom.new_pan.x) && !isNaN(zoom.new_pan.y)) {
                                zoom.pan.x = zoom.new_pan.x;
                                zoom.pan.y = zoom.new_pan.y;
                                //zoom.new_pan = {};
                                if (zoom.scale < zoom.min_scale) {
                                    zoom.scale = zoom.min_scale;
                                } else if (zoom.scale > 1) {
                                    zoom.scale = 1;
                                }

                                var container_width = zoom.container_width,
                                        container_height = zoom.container_height,
                                        W = zoom.image_width,
                                        H = zoom.image_height,
                                        w = W * zoom.scale,
                                        h = H * zoom.scale,
                                        offset = {
                                            left: ((W - w) * 0.5 + zoom.pan.x),
                                            top: ((H - h) * 0.5 + zoom.pan.y)
                                        };

                                if (w > container_width) {
                                    //adjustments if 
                                    //the image width is greater than container_width
                                    if (offset.left > 0) {
                                        adjust.left = -offset.left;
                                    } else if (offset.left + w < container_width) {
                                        adjust.left = container_width - (offset.left + w);
                                    }
                                } else {
                                    //adjustments if 
                                    //the image width is less than container_width
                                    if (offset.left < 0) {
                                        adjust.left = -offset.left;
                                    } else if (offset.left + w > container_width) {
                                        adjust.left = container_width - (offset.left + w);
                                    }
                                }
                                if (h > container_height) {
                                    //adjustments if 
                                    //the image height is greater than container_height
                                    if (offset.top > 0) {
                                        adjust.top = -offset.top;
                                    } else if (offset.top + h < container_height) {
                                        adjust.top = container_height - (offset.top + h);
                                    }
                                } else {
                                    //adjustments if 
                                    //the image height is less than container_height
                                    if (offset.top < 0) {
                                        adjust.top = -offset.top;
                                    } else if (offset.top + h > container_height) {
                                        adjust.top = container_height - (offset.top + h);
                                    }
                                }

                                if (adjust.left || adjust.top) {
                                    zoom.pan.x = zoom.pan.x + adjust.left;
                                    zoom.pan.y = zoom.pan.y + adjust.top;
                                }
                            }

                            return adjust;
                        }

                        function panEnd() {
                            var panAdjust = panUpdate();
                            var W, H, w, h, offset, median;

                            if (panAdjust.left || panAdjust.top) {
                                var page = zoom.$el.find('.page');

                                page.addClass('quick-transition');
                                page.css('transform', 'matrix(' + zoom.scale + ', 0, 0, ' + zoom.scale + ', ' + zoom.pan.x + ', ' + zoom.pan.y + ')');

                                $timeout(function () {
                                    page.removeClass('quick-transition');
                                }, 300);
                            }

                            W = zoom.image_width;
                            H = zoom.image_height;
                            w = W * zoom.scale;
                            h = H * zoom.scale;
                            offset = {
                                left: ((W - w) * 0.5 + zoom.pan.x),
                                top: ((H - h) * 0.5 + zoom.pan.y)
                            };

                            median = {
                                x: zoom.container_width * 0.5 - offset.left,
                                y: zoom.container_height * 0.5 - offset.top
                            };

                            zoom.origin = {
                                x: median.x / w,
                                y: median.y / h
                            };

                            $document.off('mousemove touchmove', panMove);
                            $document.off('mouseup touchend', panEnd);

                            navigatorUpdate();
                        }

                        function resetDrag() {
                            drag = {
                                startX: 0,
                                startY: 0,
                                x: 0,
                                y: 0,
                                abs_x: 0,
                                abs_y: 0,
                                is_swipe: true,
                                swipe_timer: false
                            };
                        }

                        function startDrag(event) {
                            addOnActivities();
                            //set the starting drag coordinates
                            if (event.touches && event.touches.length == 1) {
                                drag.startX = event.touches[0].pageX;
                                drag.startY = event.touches[0].pageY;
                            } else if (event.which == 1) {
                                drag.startX = event.pageX;
                                drag.startY = event.pageY;
                            }
                        }

                        function setDragDistance(event) {
                            if (event.touches && event.touches.length == 1) {
                                drag.x = event.touches[0].pageX - drag.startX;
                                drag.y = event.touches[0].pageY - drag.startY;
                            } else if (event.which == 1) {
                                drag.x = event.pageX - drag.startX;
                                drag.y = event.pageY - drag.startY;
                            }
                            drag.abs_x = Math.abs(drag.x);
                            drag.abs_y = Math.abs(drag.y);
                        }

                        function swipeStart(event) {
							
                            
                            //if a touchstart start event occurred before 300ms
                            //then it must be a double tap
                            //so return from here
                            if (drag.swipe_timer) {
                                $timeout.cancel(drag.swipe_timer);
                                resetDrag();
                                return;
                            }

                            drag.is_swipe = true;
                            drag.swipe_timer = $timeout(function () {
                                drag.is_swipe = false;
                                drag.swipe_timer = false;
                            }, 300);

                            parent_width = (slider.slides[current_index]) ? slider.slides[current_index].$el.width() : '0';
                            startDrag(event);

                            $document.on('mousemove touchmove', swipeMove);
                            $document.on('mouseup touchend', swipeEnd);
                        }

                        function swipeMove(e) {
                            e.stopPropagation();
                            

                            var event = e.originalEvent || e;

                            //not needed but written to be on safe side
                            if (event.touches && event.touches.length > 1) {
                                return;
                            }

                            setDragDistance(event);

                            //if the swipe is vertical
                            //remove the binded events
                            if (drag.abs_y > drag.abs_x) {
                                $slides.removeAttr('style');

                                $document.off('mousemove touchmove', swipeMove);
                                $document.off('mouseup touchend', swipeEnd);

                                resetDrag();
                                return;
                            } else {
                                e.preventDefault();
                            }

                            if (drag.x > 0) {
                                //prev image
                                slider.slides[current_index].$el.css('transform', 'translateX(' + drag.x + 'px)');
                                slider.slides[prev_index].$el.css('transform', 'translateX(' + (drag.x - parent_width) + 'px)');
                            } else if (drag.x < 0) {
                                //next image
                                slider.slides[current_index].$el.css('transform', 'translateX(' + drag.x + 'px)');
                                slider.slides[next_index].$el.css('transform', 'translateX(' + (parent_width + drag.x) + 'px)');
                            }
                        }

                        function swipeEnd() {
                            
                            $document.off('mousemove touchmove', swipeMove);
                            $document.off('mouseup touchend', swipeEnd);

                            //to complete the swipe make sure that it is
                            //not double tap and moved by more than 10 pixels
                            if (!double_tap && (drag.x < -10 || drag.x > 10)) {
                                swipeComplete();
                            } else {
                                if ($slides) {
                                    $slides.removeAttr('style');
                                }

                            }
                        }

                        function swipeComplete() {
							
                            if (drag.x > 0) {
                                //previous image
                                slider.slides[current_index].$el.addClass('quick-transition');
                                slider.slides[prev_index].$el.addClass('quick-transition');

                                if (slider.index > 0 && (drag.is_swipe || drag.abs_x > parent_width * 0.5)) {
                                    slider.slides[current_index].$el.css('transform', 'translateX(100%)');
                                    slider.slides[prev_index].$el.css('transform', 'translateX(0)');
                                    slider.index--;

                                    $timeout(function () {
                                        temp = next_index;
                                        next_index = current_index;
                                        current_index = prev_index;
                                        prev_index = temp;

                                        slider.slides[prev_index].data = scope.images[slider.index - 1];
                                    }, 295);

                                    onSlideChange();
                                } else {
                                    $slides.removeAttr('style');
                                }

                                is_animating = true;
                            } else if (drag.x < 0) {
                                //next image
                                slider.slides[current_index].$el.addClass('quick-transition');
                                slider.slides[next_index].$el.addClass('quick-transition');

                                if (slider.index < scope.images.length - 1 && (drag.is_swipe || drag.abs_x > parent_width * 0.5)) {
                                    slider.slides[current_index].$el.css('transform', 'translateX(-100%)');
                                    slider.slides[next_index].$el.css('transform', 'translateX(0)');
                                    slider.index++;

                                    $timeout(function () {
                                        temp = prev_index;
                                        prev_index = current_index;
                                        current_index = next_index;
                                        next_index = temp;

                                        slider.slides[next_index].data = scope.images[slider.index + 1];
                                    }, 295);

                                    onSlideChange();
                                } else {
                                    $slides.removeAttr('style');
                                }

                                is_animating = true;
                            }

                            resetDrag();
                            $timeout(setSlides, 300);
                        }

                        function gotoSlide(new_index) {
                            if (new_index == slider.index + 1) {
                                slider.nextSlide();
                            } else if (new_index == slider.index - 1) {
                                slider.prevSlide();
                            } else {
                                if (new_index > slider.index) {
                                    slider.slides[next_index].data = scope.images[new_index];
                                    slider.slides[current_index].$el.addClass('slide-moveToLeft');
                                    slider.slides[next_index].$el.addClass('slide-moveFromRight');

                                    $timeout(function () {
                                        temp = prev_index;
                                        prev_index = current_index;
                                        current_index = next_index;
                                        next_index = temp;

                                        slider.slides[next_index].data = scope.images[new_index + 1];
                                        slider.slides[prev_index].data = scope.images[new_index - 1];
                                    }, 595);

                                    is_animating = true;
                                } else if (new_index < slider.index) {
                                    slider.slides[prev_index].data = scope.images[new_index];
                                    slider.slides[current_index].$el.addClass('slide-moveToRight');
                                    slider.slides[prev_index].$el.addClass('slide-moveFromLeft');

                                    $timeout(function () {
                                        temp = next_index;
                                        next_index = current_index;
                                        current_index = prev_index;
                                        prev_index = temp;

                                        slider.slides[next_index].data = scope.images[new_index + 1];
                                        slider.slides[prev_index].data = scope.images[new_index - 1];
                                    }, 595);

                                    is_animating = true;
                                }

                                slider.index = new_index;

                                $timeout(setSlides, 600);
                            }
                        }

                        function onSlideChange() {
                            $(".col.c" + scope.colIndex).find(".svggrp").css('visibility', 'hidden');
                            $timeout(function () {
                                scope.onChange({index: slider.index, slider: scope});
                            }, 10);
                        }

                        function updatePageNumber() {
                            var me = elem.find('.pg-num.active');
                            if (me.length) {
                                var my_left = me.position().left,
                                        my_width = me.outerWidth(),
                                        list = elem.find('.pg-num-box'),
                                        list_width = list.outerWidth(),
                                        scroll_left = list.scrollLeft(),
                                        new_scroll_left = 0;

                                if (my_left + my_width > list_width) {
                                    new_scroll_left = scroll_left + my_left - (list_width - my_width) * 0.5;

                                    list.scrollTo({top: 0, left: new_scroll_left}, 500);
                                } else if (my_left < 0) {
                                    new_scroll_left = scroll_left + my_left - (list_width - my_width) * 0.5;

                                    list.scrollTo({top: 0, left: new_scroll_left}, 500);
                                }
                            }
                        }

                        function loadImage() {
                            if (slider.slides.length) {
                                var img = new Image(),
                                        url;

                                if (slider.slides[current_index].data) {
                                    url = (slider.slides[current_index].data.public_url || slider.slides[current_index].data.url || App.public_url + 'images/processing_images.png');
                                } else {
                                    url = 'images/processing_images.png';
                                }

                                img.onload = function () {
                                    $timeout(zoomReset, 5);
                                    $timeout(function () {
                                        if (scope.showHotspots) {
                                            $(".svggrp").css('visibility', 'visible');
                                        }
                                    }, 1000);

                                };

                                img.src = url;
                            }
                        }

                        function loadNavigator() {
                            if (scope.images && scope.images.length) {
                                var img = new Image();

                                if (scope.images[slider.index].thumb_url) {
                                    img.onload = function () {
                                        var container = elem.find('.img-navigator');

                                        container.width(this.width);
                                        container.height(this.height);
                                        container.find('img').attr('src', this.src);
                                        container.find('.handle').css('background-image', 'url(' + this.src + ')');

                                        navigatorUpdate();
                                    };

                                    img.src = scope.images[slider.index].thumb_url;
                                }
                            }
                        }

                        function navigatorUpdate() {
                            var container = elem.find('.img-navigator'),
                                    thumb_width, thumb_height,
                                    W, H, w, h, offset,
                                    width, height, left, top;

                            if (is_fullscreen && scope.images[slider.index].thumb_url) {

                                container.addClass('active');

                                if (zoom.scale && zoom.min_scale) {
                                    thumb_width = container.find('img').width();
                                    thumb_height = container.find('img').height();
                                    W = zoom.image_width;
                                    H = zoom.image_height;
                                    w = W * zoom.scale;
                                    h = H * zoom.scale;
                                    offset = {
                                        left: ((W - w) * 0.5 + zoom.pan.x),
                                        top: ((H - h) * 0.5 + zoom.pan.y)
                                    };

                                    if (zoom.container_width > w) {
                                        width = 1;
                                    } else {
                                        width = (zoom.container_width / w);
                                    }
                                    if (zoom.container_height > h) {
                                        height = 1;
                                    } else {
                                        height = (zoom.container_height / h);
                                    }
                                    left = -(offset.left / w);
                                    top = -(offset.top / h);
                                    if (left < 0) {
                                        left = 0;
                                    }
                                    if (top < 0) {
                                        top = 0;
                                    }

                                    navigator = {
                                        width: thumb_width * width,
                                        height: thumb_height * height,
                                        left: thumb_width * left,
                                        top: thumb_height * top,
                                        image_width: thumb_width,
                                        image_height: thumb_height,
                                        pixel_ratio: h / thumb_height
                                    };

                                    container.find('.handle').css({
                                        width: navigator.width + 'px',
                                        height: navigator.height + 'px',
                                        left: navigator.left + 'px',
                                        top: navigator.top + 'px',
                                        'background-position': -navigator.left + 'px -' + navigator.top + 'px'
                                    });
                                }
                            } else {
                                container.addClass('down');
                                $timeout(function () {
                                    container.removeClass('down active');
                                }, 300);
                            }
                        }

                        function navigatorStart(e) {
                            e.stopPropagation();
                            e.preventDefault();
                            startDrag(e.originalEvent || e);

                            $document.on('mousemove touchmove', navigatorMove);
                            $document.on('mouseup touchend', navigatorEnd);
                        }

                        function navigatorMove(e) {
                            var event = e.originalEvent || e;

                            //not needed but written to be on safe side
                            if (event.touches && event.touches.length > 1) {
                                return;
                            }

                            setDragDistance(event);

                            navigator.new_left = navigator.left + drag.x;
                            navigator.new_top = navigator.top + drag.y;

                            if (navigator.new_left < 0) {
                                navigator.new_left = 0;
                            } else if (navigator.new_left + navigator.width > navigator.image_width) {
                                navigator.new_left = navigator.image_width - navigator.width;
                            }
                            if (navigator.new_top < 0) {
                                navigator.new_top = 0;
                            } else if (navigator.new_top + navigator.height > navigator.image_height) {
                                navigator.new_top = navigator.image_height - navigator.height;
                            }

                            elem.find('.img-navigator').find('.handle').css({
                                left: navigator.new_left + 'px',
                                top: navigator.new_top + 'px',
                                'background-position': -navigator.new_left + 'px -' + navigator.new_top + 'px'
                            });

                            var W, H, w, h,
                                    left, top, offset, median;

                            W = zoom.image_width;
                            H = zoom.image_height;
                            w = W * zoom.scale;
                            h = H * zoom.scale;

                            left = navigator.new_left / navigator.image_width;
                            top = navigator.new_top / navigator.image_height;
                            offset = {
                                left: -left * zoom.scale * zoom.image_width,
                                top: -top * zoom.scale * zoom.image_height
                            };

                            if (navigator.new_left != navigator.left) {
                                zoom.new_pan.x = offset.left - (W - w) * 0.5;
                            }
                            if (navigator.new_top != navigator.top) {
                                zoom.new_pan.y = offset.top - (H - h) * 0.5;
                            }

                            zoom.$el.find('.page').css('transform', 'matrix(' + zoom.scale + ', 0, 0, ' + zoom.scale + ', ' + zoom.new_pan.x + ', ' + zoom.new_pan.y + ')');

                            median = {
                                x: zoom.container_width * 0.5 - offset.left,
                                y: zoom.container_height * 0.5 - offset.top
                            };

                            zoom.origin = {
                                x: median.x / w,
                                y: median.y / h
                            };
                        }

                        function navigatorEnd() {
                            navigator.left = navigator.new_left;
                            navigator.top = navigator.new_top;

                            zoom.pan = {
                                x: zoom.new_pan.x,
                                y: zoom.new_pan.y
                            };

                            $document.off('mousemove touchmove', navigatorMove);
                            $document.off('mouseup touchend', navigatorEnd);
                        }



                        slider.gotoSlide = function (index) {
                            if (!isNaN(index) && index >= 0 && index != slider.index && index < scope.images.length) {
                                gotoSlide(index);
                                onSlideChange();
                            }
                        }


                        slider.nextSlide = function () {
                            if (is_animating) {
                                return;
                            }
                            if (slider.index < scope.images.length - 1) {
                                slider.slides[current_index].$el.addClass('slide-moveToLeft');
                                slider.slides[next_index].$el.addClass('slide-moveFromRight');
                                is_animating = true;
                                slider.index++;

                                $timeout(function () {
                                    temp = prev_index;
                                    prev_index = current_index;
                                    current_index = next_index;
                                    next_index = temp;

                                    slider.slides[next_index].data = scope.images[slider.index + 1];
                                }, 595);
                                $timeout(setSlides, 600);

                                onSlideChange();
                            }
                        }

                        slider.prevSlide = function () {
                            if (is_animating) {
                                return;
                            }

                            if (slider.index > 0) {
                                slider.slides[current_index].$el.addClass('slide-moveToRight');
                                slider.slides[prev_index].$el.addClass('slide-moveFromLeft');
                                is_animating = true;

                                slider.index--;

                                $timeout(function () {
                                    temp = next_index;
                                    next_index = current_index;
                                    current_index = prev_index;
                                    prev_index = temp;

                                    slider.slides[prev_index].data = scope.images[slider.index - 1];
                                }, 595);
                                $timeout(setSlides, 600);

                                onSlideChange();
                            }
                        }

                        slider.checkZoomInBtn = function () {
                            return zoom.scale < 1;
                        }

                        slider.checkZoomOutBtn = function () {
                            return zoom.scale > zoom.min_scale;
                        }

                        slider.zoomIn = function () {
                            var step = ((1 - zoom.min_scale) / 3) + 0.01;
                            zoom.scale = zoom.scale + step;
                            if (zoom.scale > 1) {
                                zoom.scale = 1;
                            }

                            zoom.new_pan = {
                                x: zoom.pan.x + zoom.scale * (0.5 - zoom.origin.x),
                                y: zoom.pan.y + zoom.scale * (0.5 - zoom.origin.y)
                            }
                            panUpdate();

                            zoom.$el.find('.page').addClass('quick-transition');
                            zoom.$el.find('.page').css('transform', 'matrix(' + zoom.scale + ', 0, 0, ' + zoom.scale + ', ' + zoom.pan.x + ', ' + zoom.pan.y + ')');
                            $timeout(function () {
                                zoom.$el.find('.page').removeClass('quick-transition');
                            }, 300);

                            navigatorUpdate();
                        }

                        slider.zoomOut = function () {
                            var step = ((1 - zoom.min_scale) / 3) + 0.02;

                            zoom.scale = zoom.scale - step;
                            if (zoom.scale < zoom.min_scale) {
                                zoom.scale = zoom.min_scale;
                            }

                            if (zoom.scale == zoom.min_scale) {
                                zoom.pan = angular.extend({}, zoom.initial_pan);
                                zoom.origin = {
                                    x: 0.5,
                                    y: 0.5
                                };
                            } else {
                                zoom.new_pan = {
                                    x: zoom.pan.x + zoom.scale * (0.5 - zoom.origin.x),
                                    y: zoom.pan.y + zoom.scale * (0.5 - zoom.origin.y)
                                }
                                panUpdate();
                            }

                            zoom.$el.find('.page').addClass('quick-transition');
                            zoom.$el.find('.page').css('transform', 'matrix(' + zoom.scale + ', 0, 0, ' + zoom.scale + ', ' + zoom.pan.x + ', ' + zoom.pan.y + ')');
                            $timeout(function () {
                                zoom.$el.find('.page').removeClass('quick-transition');
                            }, 300);

                            navigatorUpdate();
                        }

                        slider.toggleFullscreen = function (e) {
                            addOnActivities();
                            if (!is_animating) {
                                e.stopPropagation();
                                e.preventDefault();

                                if (scope.opts.zoom && !zoom.container_offset) {
                                    //because container_offset might change on scroll
                                    zoom.container_offset = slider.slides[current_index].$el.offset();
                                }

                                var me = angular.element(e.target),
                                        container = me.closest(scope.opts.fullscreenContainer),
                                        page = zoom.$el.find('.page'),
                                        page_img = page.find('.page_img'),
                                        container_width,
                                        container_height,
                                        max_image_width,
                                        max_image_height,
                                        new_scale,
                                        new_pan;

                                is_animating = true;

                                if (me.hasClass('fa-expand')) {
                                    container_width = container.width();
                                    container_height = elem.find('.slide_container').height();
                                    max_image_width = container_width * 0.95;
                                    max_image_height = container_height * 0.98;

                                    new_scale = Math.min(max_image_width / zoom.image_width, max_image_height / zoom.image_height);
                                    if (new_scale > 1) {
                                        new_scale = 1;
                                    }
                                    new_pan = {
                                        x: (container_width - zoom.image_width) * 0.5,
                                        y: (container_height - zoom.image_height) * 0.5
                                    };

                                    me.removeClass('fa-expand').addClass('fa-compress');
                                    if (scope.opts.onToggleFullscreen) {
                                        scope.opts.onToggleFullscreen(e);
                                    }

                                    $timeout(function () {
                                        page.addClass('transition');
                                        page.css('transform', 'matrix(' + new_scale + ', 0, 0, ' + new_scale + ', ' + new_pan.x + ', ' + new_pan.y + ')');
                                    }, 650);
                                    $timeout(function () {
                                        page.removeClass('transition');

                                        page_img.data('minScale', new_scale);
                                        page_img.data('pan', new_pan);
                                        zoom.$el = false;
                                        zoomReset();
                                        page.closest('.slide_container').find('.slide.prev, .slide.next').find('.page_img').trigger('slider.update');
                                        is_animating = false;
                                        navigatorUpdate();
                                    }, 1250);

                                    is_fullscreen = true;
                                } else {
                                    if (container.hasClass('col2')) {
                                        container_width = container.width() * 0.5;
                                    } else {
                                        container_width = container.width() * 0.333333;
                                    }
                                    container_height = elem.find('.slide_container').height();
                                    max_image_width = container_width * 0.95;
                                    max_image_height = container_height * 0.98;
                                    new_scale = Math.min(max_image_width / zoom.image_width, max_image_height / zoom.image_height);
                                    new_pan = {
                                        x: (container_width - zoom.image_width) * 0.5,
                                        y: (container_height - zoom.image_height) * 0.5
                                    }

                                    me.removeClass('fa-compress').addClass('fa-expand');

                                    page.addClass('transition');
                                    page.css('transform', 'matrix(' + new_scale + ', 0, 0, ' + new_scale + ', ' + new_pan.x + ', ' + new_pan.y + ')');
                                    $timeout(function () {
                                        page.removeClass('transition');

                                        if (scope.opts.onToggleFullscreen) {
                                            scope.opts.onToggleFullscreen(e);
                                        }
                                    }, 650);
                                    $timeout(function () {
                                        page_img.data('minScale', new_scale);
                                        page_img.data('pan', new_pan);
                                        zoom.$el = false;
                                        zoomReset();
                                        page.closest('.slide_container').find('.slide.prev, .slide.next').find('.page_img').trigger('slider.update');
                                        is_animating = false;
                                    }, 1250);

                                    is_fullscreen = false;
                                    //update navigator
                                    elem.find('.img-navigator').addClass('down');
                                    $timeout(function () {
                                        elem.find('.img-navigator').removeClass('down active');
                                    }, 300);
                                }
                            }
                        }

                        scope.$watch(angular.bind(this, function () {
                            return current_index;
                        }), loadImage);

                        scope.$watch('slider.index', function () {
                            elem.find('.img-navigator').addClass('down');
                            $timeout(function () {
                                elem.find('.img-navigator').removeClass('down active');
                            }, 300);
                            $timeout(loadNavigator, 650);
                        });

                        scope.$watch('activeSlide', function (new_value) {
                            if (!isNaN(new_value) && new_value >= 0 && new_value != slider.index && new_value < scope.images.length) {
                                gotoSlide(new_value);
                            }
                        });

                        scope.$watch('images', function () {
                            slider.slides = [];
                            prev_index = 0;
                            current_index = 1;
                            next_index = 2;
                            init();

                            elem.find('.img-navigator').addClass('down');
                            $timeout(function () {
                                loadImage();
                                elem.find('.img-navigator').removeClass('down active');
                            }, 300);
                            $timeout(loadNavigator, 650);
                        });

                        App.Events.subscribe('window.resize', 'slider', loadImage);

                        scope.$on('$destroy', function () {
                            App.Events.unsubscribe('window.resize', 'slider', loadImage);
                        });

                        init();

                        bindEvents();



                        slider.toggleCompetitors = function (event) {

                            var me = angular.element(event.target);
                            if (!slider.show_competitors) {
                                me.closest('col').addClass('blur');
                            } else {

                                me.closest('col').removeClass('blur');
                                me.closest('col').find('.slide_container').removeClass('blur');
                            }

                            slider.show_competitors = !slider.show_competitors;

                        }

                        slider.getList = function (required_id, current_id, event) {
                            var me = angular.element(event.target);
                            if (!me.hasClass('animated')) {
                                var me_parent = me.parent();
                                if (!me.hasClass('swap_img')) {
                                    me_parent = me;
                                }
                                var competitorPromise = scope.opts.onBannerChange(scope.viewModel, required_id, current_id);
                                competitorPromise.then(function (data) {
                                    slider.show_competitors = false;
                                    me_parent.parent().addClass('hide');

                                }, function () {

                                    me_parent.addClass('animated shake');
                                    $timeout(function () {
                                        me_parent.removeClass('animated shake');
                                    }, 500);
                                });
                            }
                        }

                    },
                    controller: function () {
                    },
                    controllerAs: 'slider'
                }
            }])

        .directive('videoPlayer', ['$document', '$interval', '$sce', function ($document, $interval, $sce) {
                return {
                    restrict: 'C',
                    templateUrl: App.base_url + 'public/templates/components/video_player.html',
                    scope: {
                        file: '=',
                        opts: '='
                    },
                    link: function (scope, elem, attrs, mediaCtrl) {
                        elem.removeClass('active');
                        var $player = elem.find('video'),
                                player = $player[0],
                                drag = {
                                    startX: 0,
                                    startY: 0,
                                    x: 0,
                                    y: 0,
                                    abs_x: 0,
                                    abs_y: 0
                                };

                        mediaCtrl.player = player;
                        mediaCtrl.currentTime = '0:00';
                        mediaCtrl.duration = '0:00';
                        mediaCtrl.progress = {
                            width: 0
                        };
                        mediaCtrl.volume = {
                            width: App.volume,
                            is_muted: App.is_muted
                        };



                        function init() {

                            bindEvents();
                        }

                        function bindEvents() {
                            $player.on('loadeddata', function () {
                                if (scope.opts.onload) {
                                    scope.opts.onload();
                                }
                                elem.addClass('active');
                                mediaCtrl.duration = toTime(player.duration);
                                player.play();

                                bindProgressEvents();
                                bindVolumeEvents();
                            });

                            $player.on('timeupdate', function () {
                                var value = (100 / player.duration) * player.currentTime;
                                mediaCtrl.progress.width = value;
                            });

                            $interval(function () {
                                mediaCtrl.currentTime = toTime(player.currentTime);
                            }, 1000);

                        }

                        function bindProgressEvents() {
                            mediaCtrl.progress = {
                                type: 'progress',
                                $el: elem.find('.media-progress-wrap').find('.pg-bar'),
                                offset: elem.find('.media-progress-wrap').find('.pg-bg').offset(),
                                total_width: elem.find('.media-progress-wrap').find('.pg-bg').width(),
                                width: 0
                            };

                            //elem.find('.media-progress-wrap').find('.horizontal-progress').on('mousedown touchstart', function (e) {
                            elem.find('.media-progress-wrap').find('.horizontal-progress').on(booleanIsMouseOrTouch, function (e) {
                                e.stopPropagation();
                                e.preventDefault();

                                var event = e.originalEvent || e;

                                dragStart(event, mediaCtrl.progress);
                            });
                        }

                        function bindVolumeEvents() {
                            mediaCtrl.volume = {
                                type: 'volume',
                                $el: elem.find('.volume-wrap').find('.pg-bar'),
                                offset: elem.find('.volume-wrap').find('.pg-bg').offset(),
                                total_width: elem.find('.volume-wrap').find('.pg-bg').width(),
                                width: App.volume,
                                is_muted: App.is_muted
                            };

                            if (mediaCtrl.volume.is_muted) {
                                player.muted = true;
                            }

                            //elem.find('.volume-wrap').find('.horizontal-progress').on('mousedown touchstart', function (e) {
                            elem.find('.volume-wrap').find('.horizontal-progress').on(booleanIsMouseOrTouch, function (e) {
                                e.stopPropagation();
                                e.preventDefault();

                                var event = e.originalEvent || e;

                                dragStart(event, mediaCtrl.volume);
                            });
                        }

                        function dragStart(event, obj) {
                            //set the starting drag coordinates
                            if (event.touches && event.touches.length == 1) {
                                drag.startX = event.touches[0].pageX;
                                drag.startY = event.touches[0].pageY;
                            } else if (event.which == 1) {
                                drag.startX = event.pageX;
                                drag.startY = event.pageY;
                            } else {
                                return;
                            }

                            var l = drag.startX - obj.offset.left,
                                    width;

                            if (l < 0) {
                                l = 0;
                            } else if (l > obj.total_width) {
                                l = obj.total_width;
                            }
                            width = l / obj.total_width;

                            obj.width = width * 100;
                            if (obj.type == 'progress') {
                                var time = player.duration * width;

                                player.pause();
                                player.currentTime = time;
                                mediaCtrl.currentTime = toTime(player.currentTime);
                            } else if (obj.type == 'volume') {
                                player.muted = false;
                                obj.is_muted = false;
                                player.volume = width;
                            }
                            scope.$apply();

                            $document.on('mousemove touchmove', dragMove);
                            $document.on('mouseup touchend', dragEnd);

                            function dragMove(e) {
                                var event = e.originalEvent || e;

                                //not needed but written to be on safe side
                                if (event.touches && event.touches.length > 1) {
                                    return;
                                }

                                e.stopPropagation();
                                e.preventDefault();

                                if (event.touches && event.touches.length == 1) {
                                    drag.x = event.touches[0].pageX - drag.startX;
                                    drag.y = event.touches[0].pageY - drag.startY;
                                } else if (event.which == 1) {
                                    drag.x = event.pageX - drag.startX;
                                    drag.y = event.pageY - drag.startY;
                                }
                                drag.abs_x = Math.abs(drag.x);
                                drag.abs_y = Math.abs(drag.y);

                                var l = drag.startX - obj.offset.left + drag.x,
                                        width;

                                if (l < 0) {
                                    l = 0;
                                } else if (l > obj.total_width) {
                                    l = obj.total_width;
                                }
                                width = l / obj.total_width;

                                obj.width = width * 100;
                                if (obj.type == 'progress') {
                                    var time = player.duration * width;
                                    player.currentTime = time;
                                    mediaCtrl.currentTime = toTime(player.currentTime);
                                } else if (obj.type == 'volume') {
                                    player.volume = width;
                                }
                                scope.$apply();
                            }

                            function dragEnd() {
                                $document.off('mousemove touchmove', dragMove);
                                $document.off('mouseup touchend', dragEnd);

                                if (obj.type == 'progress') {
                                    player.play();
                                }
                                if (mediaCtrl.volume.width > 0) {
                                    App.volume = mediaCtrl.volume.width;
                                } else {
                                    player.muted = true;
                                    mediaCtrl.volume.is_muted = true;
                                    player.volume = width / 100;
                                    mediaCtrl.volume.width = App.volume;
                                }
                                dragReset();
                            }
                        }

                        function dragReset() {
                            drag = {
                                startX: 0,
                                startY: 0,
                                x: 0,
                                y: 0,
                                abs_x: 0,
                                abs_y: 0
                            };
                        }

                        function toTime(t) {
                            t = Math.round(t) || 0;

                            var h = 0,
                                    m = 0,
                                    s = 0,
                                    str = '';

                            if (t > 60) {
                                m = parseInt(t / 60);
                                t = t % 60;
                            }
                            s = t;

                            str = (h > 0 ? h + ':' : '') + m + ':' + (s > 10 ? s : '0' + s);

                            return str;
                        }

                        mediaCtrl.trustedResource = function (url) {
                            return $sce.trustAsResourceUrl(url);
                        }

                        mediaCtrl.toggleFullscreen = function (e) {
                            var me = angular.element(e.target);

                            if (me.hasClass('fa-expand')) {
                                me.removeClass('fa-expand').addClass('fa-compress');
                            } else {
                                me.removeClass('fa-compress').addClass('fa-expand');
                            }

                            if (scope.opts.onToggleFullscreen) {
                                scope.opts.onToggleFullscreen(e);
                            }
                        }

                        mediaCtrl.togglePlay = function () {
                            if (player.paused) {
                                player.play();
                            } else {
                                player.pause();
                            }
                        }

                        mediaCtrl.toggleMute = function () {
                            if (player.muted) {
                                player.muted = false;
                                mediaCtrl.volume.is_muted = false;
                            } else {
                                player.muted = true;
                                mediaCtrl.volume.is_muted = true;
                            }
                        }

                        scope.$on('$destroy', function () {
                            App.volume = mediaCtrl.volume.width;
                            App.is_muted = mediaCtrl.volume.is_muted;
                        });

                        init();
                    },
                    controller: function () {
                    },
                    controllerAs: 'mediaCtrl'
                }
            }])

        .directive('audioPlayer', ['$document', '$interval', function ($document, $interval) {
                return {
                    restrict: 'C',
                    templateUrl: App.base_url + 'public/templates/components/audio_player.html',
                    scope: {
                        file: '=',
                        opts: '='
                    },
                    link: function (scope, elem, attrs, audioCtrl) {
                        elem.addClass('active');
                        var player,
                                drag = {
                                    startX: 0,
                                    startY: 0,
                                    x: 0,
                                    y: 0,
                                    abs_x: 0,
                                    abs_y: 0
                                };

                        audioCtrl.currentTime = '0:00';
                        audioCtrl.duration = '0:00';
                        audioCtrl.is_playing = false;
                        audioCtrl.is_ready = false;
                        audioCtrl.progress = {
                            width: 0
                        };
                        audioCtrl.volume = {
                            width: App.volume,
                            is_muted: App.is_muted
                        };

                        function init() {
                            player = WaveSurfer.create({
                                container: elem.find('.audio-wave')[0],
                                height: 80,
                                waveColor: '#fff',
                                progressColor: '#ee3d37',
                                cursorColor: 'transparent',
                                barWidth: 2,
                                verticalCenter: false
                            });

                            bindEvents();

                            player.load(scope.file.src);
                        }

                        function bindEvents() {
                            player.on('ready', function () {
                                if (scope.opts.onload) {
                                    scope.opts.onload();
                                }

                                audioCtrl.duration = toTime(player.getDuration());
                                player.play();
                                audioCtrl.is_playing = true;
                                audioCtrl.is_ready = true;

                                bindProgressEvents();
                                bindVolumeEvents();
                            });

                            player.on('audioprocess', function () {
                                var value = (100 / player.getDuration()) * player.getCurrentTime();
                                audioCtrl.progress.width = value;
                            });

                            player.on('finish', function () {
                                player.pause();
                                audioCtrl.is_playing = false;
                            });

                            $interval(function () {
                                audioCtrl.currentTime = toTime(player.getCurrentTime());
                            }, 1000);
                        }

                        function bindProgressEvents() {
                            audioCtrl.progress = {
                                type: 'progress',
                                $el: elem.find('.media-progress-wrap').find('.pg-bar'),
                                offset: elem.find('.media-progress-wrap').find('.pg-bg').offset(),
                                total_width: elem.find('.media-progress-wrap').find('.pg-bg').width(),
                                width: 0
                            };

                            //elem.find('.media-progress-wrap').find('.horizontal-progress').on('mousedown touchstart', function (e) {
                            elem.find('.media-progress-wrap').find('.horizontal-progress').on(booleanIsMouseOrTouch, function (e) {
                                e.stopPropagation();
                                e.preventDefault();

                                var event = e.originalEvent || e;

                                dragStart(event, audioCtrl.progress);
                            });
                        }

                        function bindVolumeEvents() {
                            audioCtrl.volume = {
                                type: 'volume',
                                $el: elem.find('.volume-wrap').find('.pg-bar'),
                                offset: elem.find('.volume-wrap').find('.pg-bg').offset(),
                                total_width: elem.find('.volume-wrap').find('.pg-bg').width(),
                                width: App.volume,
                                is_muted: App.is_muted
                            };

                            if (audioCtrl.volume.is_muted) {
                                player.toggleMute();
                            }

                            // elem.find('.volume-wrap').find('.horizontal-progress').on('mousedown touchstart', function (e) {
                            elem.find('.volume-wrap').find('.horizontal-progress').on(booleanIsMouseOrTouch, function (e) {
                                e.stopPropagation();
                                e.preventDefault();

                                var event = e.originalEvent || e;

                                dragStart(event, audioCtrl.volume);
                            });
                        }

                        function dragStart(event, obj) {
                            //set the starting drag coordinates
                            if (event.touches && event.touches.length == 1) {
                                drag.startX = event.touches[0].pageX;
                                drag.startY = event.touches[0].pageY;
                            } else if (event.which == 1) {
                                drag.startX = event.pageX;
                                drag.startY = event.pageY;
                            } else {
                                return;
                            }

                            var l = drag.startX - obj.offset.left,
                                    width;

                            if (l < 0) {
                                l = 0;
                            } else if (l > obj.total_width) {
                                l = obj.total_width;
                            }
                            width = l / obj.total_width;

                            obj.width = width * 100;
                            if (obj.type == 'progress') {
                                player.pause();
                                audioCtrl.is_playing = false;

                                player.seekTo(width)
                                audioCtrl.currentTime = toTime(player.getCurrentTime());
                            } else if (obj.type == 'volume') {
                                if (obj.is_muted) {
                                    player.toggleMute();
                                    obj.is_muted = false;
                                }
                                player.setVolume(width);
                            }
                            scope.$apply();

                            $document.on('mousemove touchmove', dragMove);
                            $document.on('mouseup touchend', dragEnd);

                            function dragMove(e) {
                                var event = e.originalEvent || e;

                                //not needed but written to be on safe side
                                if (event.touches && event.touches.length > 1) {
                                    return;
                                }

                                e.stopPropagation();
                                e.preventDefault();

                                if (event.touches && event.touches.length == 1) {
                                    drag.x = event.touches[0].pageX - drag.startX;
                                    drag.y = event.touches[0].pageY - drag.startY;
                                } else if (event.which == 1) {
                                    drag.x = event.pageX - drag.startX;
                                    drag.y = event.pageY - drag.startY;
                                }
                                drag.abs_x = Math.abs(drag.x);
                                drag.abs_y = Math.abs(drag.y);

                                var l = drag.startX - obj.offset.left + drag.x,
                                        width;

                                if (l < 0) {
                                    l = 0;
                                } else if (l > obj.total_width) {
                                    l = obj.total_width;
                                }
                                width = l / obj.total_width;

                                obj.width = width * 100;
                                if (obj.type == 'progress') {
                                    player.pause();
                                    audioCtrl.is_playing = false;

                                    player.seekTo(width)
                                    audioCtrl.currentTime = toTime(player.getCurrentTime());
                                } else if (obj.type == 'volume') {
                                    player.setVolume(width);
                                }
                                scope.$apply();
                            }

                            function dragEnd() {
                                $document.off('mousemove touchmove', dragMove);
                                $document.off('mouseup touchend', dragEnd);

                                if (obj.type == 'progress') {
                                    player.play();
                                    audioCtrl.is_playing = true;
                                }
                                if (audioCtrl.volume.width > 0) {
                                    App.volume = audioCtrl.volume.width;
                                } else {
                                    player.setVolume(width);
                                    audioCtrl.volume.width = App.volume;
                                    if (!audioCtrl.volume.is_muted) {
                                        player.toggleMute();
                                        audioCtrl.volume.is_muted = true;
                                    }
                                }
                                dragReset();
                            }
                        }

                        function dragReset() {
                            drag = {
                                startX: 0,
                                startY: 0,
                                x: 0,
                                y: 0,
                                abs_x: 0,
                                abs_y: 0
                            };
                        }

                        function toTime(t) {
                            t = Math.round(t) || 0;

                            var h = 0,
                                    m = 0,
                                    s = 0,
                                    str = '';

                            if (t > 60) {
                                m = parseInt(t / 60);
                                t = t % 60;
                            }
                            s = t;

                            str = (h > 0 ? h + ':' : '') + m + ':' + (s > 10 ? s : '0' + s);

                            return str;
                        }

                        audioCtrl.togglePlay = function () {
                            if (audioCtrl.is_ready) {
                                if (player.isPlaying()) {
                                    player.pause();
                                    audioCtrl.is_playing = false;
                                } else {
                                    player.play();
                                    audioCtrl.is_playing = true;
                                }
                            }
                        }

                        audioCtrl.toggleMute = function () {
                            player.toggleMute();
                            audioCtrl.volume.is_muted = !audioCtrl.volume.is_muted;
                        }

                        scope.$on('$destroy', function () {
                            player.destroy();
                            App.volume = audioCtrl.volume.width;
                            App.is_muted = audioCtrl.volume.is_muted;
                        });

                        init();
                    },
                    controller: function () {
                    },
                    controllerAs: 'audioCtrl'
                }
            }])

        .directive('imgLoad', ['$timeout', function ($timeout) {
                return {
                    restrict: 'AC',
                    scope: {
                        ngSrc: '@',
                        src: '=',
                        valign: '=',
                        noimage: '@'
                    },
                    link: function (scope, elem, attrs) {
                        if (!scope.ngSrc && !attrs.ngSrc) {
                            scope.ngSrc = scope.src;
                        }

                        function loadImage() {
                            scope.loadImage(elem, scope.ngSrc, 'active');
                        }
                        loadImage();

                        scope.$watch('ngSrc', function () {
                            elem.removeClass('active');
                            loadImage();
                        });

                        App.Events.subscribe('window.resize', 'imgLoad', loadImage);

                        scope.$on('$destroy', function () {
                            App.Events.unsubscribe('window.resize', 'imgLoad', loadImage);
                        });
                    },
                    controller: ['$scope', function ($scope) {

                            function showImage(elem, cls) {
                                if ($scope.valign) {
                                    $timeout(function () {
                                        var H = elem.parent().height(),
                                                h = elem.height();

                                        var marginTop = (H - h) * 0.5;
                                        elem.css({marginTop: marginTop});
                                    }, 100);
                                }
                                $timeout(function () {
                                    elem.addClass(cls);
                                }, 110);
                            }

                            $scope.loadImage = function (elem, src, cls) {
                                var img = new Image();

                                img.onload = function () {
                                    showImage(elem, cls);
                                };
                                img.onerror = function () {
                                    if ($scope.noimage && elem.attr('src') != $scope.noimage) {
                                        elem.attr('src', $scope.noimage);

                                        $scope.loadImage(elem, $scope.noimage, 'no-img active');
                                    }
                                };

                                img.src = src;
                            }

                        }]
                }
            }])

        .directive('horizontalList', function () {
            return {
                restrict: 'C',
                scope: {
                    container_width: '='
                },
                link: function (scope, elem, attrs) {

                    elem.on('click', '.item', function () {
                        var me = angular.element(this),
                                my_left = me.position().left,
                                my_width = me.outerWidth(),
                                list_width = elem.outerWidth(),
                                scroll_left = elem.scrollLeft(),
                                new_scroll_left = 0;

                        if (my_left + my_width > list_width) {
                            new_scroll_left = scroll_left + (my_left + my_width - list_width) + 10;
                            if (me.next().length) {
                                new_scroll_left += me.next().outerWidth() / 2;
                            } else {
                                new_scroll_left += 100;
                            }

                            elem.scrollTo({top: 0, left: new_scroll_left}, 300);
                        } else if (my_left < 0) {
                            new_scroll_left = scroll_left + my_left - 10;
                            if (me.prev().length) {
                                new_scroll_left -= me.prev().outerWidth() / 2;
                            } else {
                                new_scroll_left -= 100;
                            }

                            elem.scrollTo({top: 0, left: new_scroll_left}, 300);
                        }
                    });

                }
            }
        })

        .directive('daterangePicker', ['$document', function ($document) {
                return {
                    restrict: 'A',
                    templateUrl: App.base_url + 'public/templates/components/daterange.html',
                    replace: true,
                    scope: {
                        opts: '=',
                        range: '='
                    },
                    link: function (scope, elem, attrs, rangeCtrl) {

                        function init() {
                            rangeCtrl.custom_range = {label: "Custom Range", range: []};

                            if (scope.opts.start_date && scope.opts.end_date) {
                                rangeCtrl.start_date = moment(scope.opts.start_date);
                                rangeCtrl.end_date = moment(scope.opts.end_date);
                                rangeCtrl.custom_start_date = moment(scope.opts.start_date);
                                rangeCtrl.custom_end_date = moment(scope.opts.end_date);

                                angular.forEach(scope.opts.ranges, function (obj) {
                                    if (obj.range.length == 2) {
                                        if (rangeCtrl.start_date.isSame(obj.range[0], 'day') && rangeCtrl.end_date.isSame(obj.range[1], 'day')) {

                                            rangeCtrl.selected_range = obj;
                                        }
                                    }
                                });

                                if (!rangeCtrl.selected_range) {
                                    rangeCtrl.selected_range = rangeCtrl.custom_range;
                                    rangeCtrl.show_calendar = true;
                                }

                                if (scope.opts.onChange) {
                                    scope.opts.onChange(rangeCtrl.start_date, rangeCtrl.end_date);
                                }
                            } else {
                                rangeCtrl.custom_start_date = moment();
                                rangeCtrl.custom_end_date = moment();
                            }

                            bindEvents();
                        }

                        function bindEvents() {
                            elem.on('click', '.dropdown-toggle', function () {
                                elem.toggleClass('open');
                            });

                            elem.find('.start_date').datetimepicker({
                                defaultDate: rangeCtrl.start_date ? rangeCtrl.start_date : moment(),
                                format: 'MM/DD/YYYY',
                                keepOpen: true,
                                inline: true
                            }).on('dp.change', function (e) {
                                rangeCtrl.custom_start_date = e.date;
                                if (rangeCtrl.custom_start_date.isAfter(rangeCtrl.custom_end_date)) {
                                    elem.find('.end_date').data('DateTimePicker').date(rangeCtrl.custom_start_date);
                                    return;
                                }

                                if (!scope.$root.$$phase) {
                                    scope.$apply();
                                }
                            });
                            elem.find('.end_date').datetimepicker({
                                defaultDate: rangeCtrl.end_date ? rangeCtrl.end_date : moment(),
                                format: 'MM/DD/YYYY',
                                keepOpen: true,
                                inline: true
                            }).on('dp.change', function (e) {
                                rangeCtrl.custom_end_date = e.date;
                                if (rangeCtrl.custom_end_date.isBefore(rangeCtrl.custom_start_date)) {
                                    elem.find('.start_date').data('DateTimePicker').date(rangeCtrl.custom_end_date);
                                    return;
                                }

                                if (!scope.$root.$$phase) {
                                    scope.$apply();
                                }
                            });

                            elem.find('.hidden-start-date').on('datechange', function () {
                                var date = $.trim($(this).val());

                                if (date == '') {
                                    rangeCtrl.start_date = null;
                                } else {
                                    rangeCtrl.start_date = moment(date);
                                }
                            });
                            elem.find('.hidden-end-date').on('datechange', function () {
                                var date = $.trim($(this).val());

                                if (date == '') {
                                    rangeCtrl.end_date = null;
                                } else {
                                    rangeCtrl.end_date = moment(date);
                                }
                            })

                            $document.on('click', hideDatepicker);
                        }

                        function hideDatepicker(e) {
                            var me = $(e.target);

                            if (me.hasClass('daterange-picker') || me.closest('.daterange-picker').length) {
                            } else {
                                elem.removeClass('open');
                            }
                        }

                        rangeCtrl.selectRange = function (range) {
                            this.selected_range = range;

                            if (this.selected_range.range && this.selected_range.range.length == 2) {
                                this.show_calendar = false;
                                this.start_date = this.selected_range.range[0];
                                this.end_date = this.selected_range.range[1];
                                if (scope.opts.onChange) {
                                    scope.opts.onChange(this.start_date, this.end_date);
                                }

                                elem.removeClass('open');
                                elem.find('.start_date').data('DateTimePicker').date(this.selected_range.range[0]);
                                elem.find('.end_date').data('DateTimePicker').date(this.selected_range.range[1]);
                            } else {
                                this.show_calendar = true;
                            }
                        }

                        rangeCtrl.cancel = function () {
                            elem.removeClass('open');
                        }

                        rangeCtrl.apply = function () {
                            rangeCtrl.start_date = rangeCtrl.custom_start_date.clone();
                            rangeCtrl.end_date = rangeCtrl.custom_end_date.clone();
                            if (scope.opts.onChange) {
                                scope.opts.onChange(this.start_date, this.end_date);
                            }

                            elem.removeClass('open');
                        }

                        scope.$on('$destroy', function () {
                            $document.off('click', hideDatepicker);
                        });

                        init();
                    },
                    controller: function () {
                    },
                    controllerAs: 'rangeCtrl'
                }
            }])

        .directive('calendarWeekly', ['$document', '$timeout', function ($document, $timeout) {
                return {
                    restrict: "A",
                    templateUrl: App.base_url + 'public/templates/components/weekly_calendar.html',
                    transclude: true,
                    scope: {
                        defaultWeek: '=',
                        selectedWeek: '=',
                        onSelect: '&'
                    },
                    link: function (scope, elem, attrs, calCtrl) {
                        elem.on('click', function (e) {
                            if (calCtrl.show_calendar) {
                                calCtrl.show_calendar = false;
                                scope.$apply();
                            } else {
                                calCtrl.show_calendar = true;
                                scope.$apply();
                                $timeout(function () {
                                    elem.find('.wkcal').scrollTo(elem.find('.wkcal').find('.week.active'), 0, {offset: -44});
                                }, 10);
                            }
                        });

                        function hideCalendar(e) {
                            var me = $(e.target);

                            if (me.hasClass('calendar-weekly') || me.closest('.calendar-weekly').length) {
                            } else {
                                calCtrl.show_calendar = false;
                                scope.$apply();
                                calCtrl.updateCalendar();
                            }
                        }

                        $document.on('click', hideCalendar);

                        scope.$on('$destroy', function () {
                            $document.off('click', hideCalendar);
                        });

                    },
                    controller: ['$scope', function (scope) {
                            var self = this;

                            this.currentWeek;
                            this.current_year;
                            this.moment = getCalendarStartDate(moment().format('MM/DD/YYYY'));
                            this.calendar = [];
                            this.show_calendar = false;

                            function init() {
                                generateCalendar();
                                self.selectedWeek = self.currentWeek;
                            }

                            function getCalendarStartDate(date) {
                                var start_date;

                                if (moment(date).day() >= 0 && moment(date).day() <= 2 && moment(date).day(7).year() > moment(date).year()) {
                                    start_date = moment(date).week(1).subtract(1, 'year').day(3);
                                    self.current_year = moment(date).subtract(1, 'year').year();
                                } else {
                                    start_date = moment(date).week(1).day(3);
                                    self.current_year = moment(date).year();
                                }

                                return start_date;
                            }
                            function getISOWeeks(y) {
                                var d,
                                        isLeap;

                                d = new Date(y, 0, 1);
                                isLeap = new Date(y, 1, 29).getMonth() === 1;

                                //check for a Jan 1 that's a Thursday or a leap year that has a 
                                //Wednesday jan 1. Otherwise it's 52
                                return d.getDay() === 4 || isLeap && d.getDay() === 3 ? 53 : 52;
                            }
                            function w2date(year, wn, dayNb) {
                                var j10 = new Date(year, 0, 10, 12, 0, 0),
                                        j4 = new Date(year, 0, 4, 12, 0, 0),
                                        mon1 = j4.getTime() - j10.getDay() * 86400000;
                                return new Date(mon1 + ((wn - 1) * 7 + dayNb) * 86400000);
                            }
                            function generateCalendar() {
                                self.calendar = [];

                                var d = new Date(),
                                        startDate = moment(w2date(self.current_year, d.getWeek(), 2)),
                                        diff;

                                if (d.getDay() <= 2) {
                                    diff = startDate.subtract(d.getDay() + 1, 'days');
                                } else {
                                    diff = startDate;
                                }

                                self.calendar = generateCalender(self.current_year);
                                /*var current = angular.copy(self.calendar);
                                 var prevCalender = generateCalender(self.current_year - 1);
                                 var nextCalender = generateCalender(self.current_year + 1);
                                 var selectedWeek, currentWeek;
                                 angular.forEach(prevCalender, function (object) {
                                 current.push(object);
                                 });
                                 angular.forEach(nextCalender, function (object) {
                                 current.push(object);
                                 });*/

                                angular.forEach(self.calendar, function (object) {
                                    angular.forEach(object.dates, function (date) {
                                        if (date.isSame(diff, 'day')) {
                                            currentWeek = object;
                                            selectedWeek = object;
                                        }
                                    })
                                });
                                self.selectedWeek = selectedWeek;
                                self.currentWeek = currentWeek;
                            }

                            function generateCalender(year) {
                                var calendar = [];
                                var weekNo = getISOWeeks(year);
                                for (var i = 1; i <= weekNo; i++) {
                                    var weekObj = {
                                        week_no: i,
                                        dates: []
                                    };

                                    for (var j = 0; j <= 6; j++) {
                                        weekObj.dates.push(moment(w2date(year, i, 2)).add(j, 'days'));
                                    }
                                    calendar.push(weekObj);
                                }

                                return calendar;
                            }

                            /*function generateCalendarOld() {
                             var i,
                             temp;
                             
                             self.calendar = [];
                             
                             do {
                             temp = {
                             week_no: self.moment.get('week'),
                             dates: []
                             };
                             if (moment(self.defaultWeek).isSame(self.moment, 'day')) {
                             self.currentWeek = temp;
                             self.selectedWeek = temp;
                             }
                             for (i = 1; i <= 7; i++) {
                             temp.dates.push(self.moment.clone());
                             self.moment.add(1, 'day');
                             }
                             self.calendar.push(temp);
                             } while (self.moment.get('week') > 1);
                             }*/

                            this.selectWeek = function (week) {
                                this.selectedWeek = week;
                                this.onSelect({week: this.selectedWeek, isCurrentWeek: (this.selectedWeek == this.currentWeek)});

                                this.show_calendar = false;
                            }

                            this.prevYear = function () {
                                this.current_year--;
                                generateCalendar();
                            }

                            this.nextYear = function () {
                                this.current_year++;
                                generateCalendar();
                            }

                            this.updateCalendar = function () {
                                if (this.selectedWeek && this.selectedWeek.dates[0].year() != this.current_year) {
                                    this.current_year = this.selectedWeek.dates[0].year();
                                    $timeout(generateCalendar, 200);
                                }
                            }

                            this.stopPropagation = function (event) {
                                event.stopPropagation();
                            }

                            scope.$on('selectDefaultWeek', function (event) {
                                if (self.current_year != moment().year()) {
                                    self.current_year = moment().year();
                                    generateCalendar();
                                }
                                self.selectedWeek = self.currentWeek;
                            });

                            init();
                        }],
                    controllerAs: 'calCtrl',
                    bindToController: true
                }
            }])

        .directive('appUpdateNotification', function () {
            return {
                restrict: "C",
                templateUrl: App.base_url + 'public/templates/gallery/app_update.html',
                controller: ['$timeout', '$interval', 'AppUpdateService', function ($timeout, $interval, AppUpdateService) {
                        var self = this;

                        this.status = false;
                        this.active = false;
                        this.time = 90;

                        AppUpdateService.onUpdate().then(enableNotification);

                        function enableNotification() {
                            self.status = true;
                            self.active = true;
                            self.time = 90;

                            $interval(function () {
                                self.time--;
                                if (self.time == 0) {
                                    self.updateNow();
                                }
                            }, 1000);

                            $timeout(function () {
                                self.active = false;
                            }, 10000);
                        }

                        this.updateTimer = function () {
                            var t = this.time,
                                    str = "";

                            if (t > 60) {
                                str = parseInt((t / 60), 10) + ":";
                                t = t % 60;
                            } else {
                                str = "0:";
                            }

                            str += t;

                            return str;
                        }

                        this.updateNow = function () {
                            window.location.reload();
                        }

                        this.updateLater = function () {
                            this.time = 5 * 60;
                            $timeout(function () {
                                this.active = false;
                            }, 800);
                        }

                        this.showNotification = function () {
                            this.active = true;
                        }

                        this.closeNotification = function () {
                            this.active = false;
                        }

                    }],
                controllerAs: 'ctrl'
            }
        })

        .directive('galleryDefaultNav', function () {
            return {
                replace: true,
                templateUrl: App.base_url + 'public/templates/gallery/default_nav.html'
            }
        })

        .directive('galleryDotNav', function () {
            return {
                replace: true,
                templateUrl: App.base_url + 'public/templates/gallery/dot_nav.html'
            }
        })

        .directive('triStateCheckbox', [function () {
                return {
                    restrict: 'C',
                    scope: {
                        list: '=',
                        selectedlist: '=',
                        stopPropagation: '=',
                        label: '=',
                        name: '=',
                        onUpdate: '&',
                        readOnly: '='
                    },
                    templateUrl: App.base_url + 'public/templates/components/tristateCheckbox.html',
                    controllerAs: 'checkboxCtrl',
                    controller: ['$scope', '$timeout', function ($scope, $timeout) {

                            var self = this;
                            this.selectedlistModel = {};

                            if (!$scope.selectedlist) {
                                $scope.selectedlist = [];
                            }

                            function init() {
                                angular.forEach($scope.list, function (obj) {
                                    self.selectedlistModel[obj.id] = {};
                                    if ($scope.selectedlist.indexOf(obj.id) > -1) {
                                        self.selectedlistModel[obj.id].selected = true;
                                    } else {
                                        self.selectedlistModel[obj.id].selected = false;
                                    }
                                });
                                if ($scope.selectedlist.length == $scope.list.length) {
                                    $scope.select_all = true;
                                }
                            }

                            $scope.selectItem = function (item) {
                                var index = $scope.selectedlist.indexOf(item.id);

                                if (self.selectedlistModel[item.id].selected) {
                                    if (index == -1) {
                                        $scope.selectedlist.push(item.id);
                                    }
                                } else {
                                    if (index > -1) {
                                        $scope.selectedlist.splice(index, 1);
                                    }
                                }

                                if ($scope.selectedlist.length == $scope.list.length) {
                                    $scope.select_all = true;
                                } else {
                                    $scope.select_all = false;
                                }

                                $scope.onUpdate();
                            }

                            $scope.selectAll = function (is_selected) {
                                $scope.selectedlist = [];

                                if (is_selected) {
                                    angular.forEach($scope.list, function (obj) {
                                        self.selectedlistModel[obj.id].selected = true;
                                        $scope.selectedlist.push(obj.id);
                                    });
                                } else {
                                    angular.forEach($scope.list, function (obj) {
                                        self.selectedlistModel[obj.id].selected = false;
                                    });
                                }

                                $timeout($scope.onUpdate, 1);
                            }

                            $scope.onListClick = function ($event) {
                                if ($scope.stopPropagation) {
                                    $event.stopPropagation();
                                }
                            }

                            $scope.$watch('selectedlist', function (new_value) {
                                if (new_value) {
                                    init();
                                }
                            });

                            init();

                        }]
                };
            }])

        .directive('notifyChanges', [function () {
                return {
                    restrict: 'C',
                    scope: {
                        model: '='
                    },
                    link: function (scope, element) {

                        scope.$watch('model', function (new_value, old_value) {
                            if (new_value && old_value && new_value != old_value) {
                                element.addClass('changed');

                                setTimeout(function () {
                                    element.removeClass('changed');
                                }, 1000);
                            }
                        });

                    }
                }
            }]);



Date.prototype.getWeek = function () {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
            - 3 + (week1.getDay() + 6) % 7) / 7);
}

/**
 * @author Enterpi
 * @ignore It is used to destroy the UPC Pop Up when Image expanded
 * @returns integer It will return an integer reponse
 */
function addOnActivities() {
    $(".coord").popover('hide');
    return 1;
}

