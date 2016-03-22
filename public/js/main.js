require.config({
    baseUrl: "./js",
    paths: {
        jquery: '../plugs/jquery.min',
        bootstrap: '../plugs/bootstrap/js/bootstrap.min',
        underscore: '../plugs/underscore-min',
        backbone: '../plugs/backbone-min',
        text: '../plugs/require/text',
        moment: '../plugs/daterangepicker/moment.min',
        Message: '../plugs/toastr/toastr.min',
        daterangepicker: '../plugs/daterangepicker/daterangepicker',
        bootstrapTable: '../plugs/bootstrap/js/bootstrap-table.min',
        bootstrapPaginator: '../plugs/bootstrap/js/bootstrap-paginator.min',
        highcharts: '../plugs/highcharts/highstock',
        tableExport: '../plugs/tableExport',
        templates: '../templates'
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'bootstrap': {
            deps: ['jquery'],
            exports: 'bootstrap'
        },
        'Message': {
            deps: ['jquery'],
            exports: 'Message'
        },
        'bootstrapTable': {
            deps: ['jquery'],
            exports: 'bootstrapTable'
        },
        'tableExport': {
            deps: ['jquery'],
            exports: 'tableExport'
        },
        'daterangepicker': {
            deps: ['bootstrap', 'moment']
        },
        'bootstrapPaginator': {
            deps: ['bootstrap']
        }
    }
});

require(['jquery', 'underscore', 'backbone', 'bootstrap', 'moment', 'daterangepicker', 'bootstrapTable', 'bootstrapPaginator', 'tableExport'],
    function(jQuery, _, Backbone, bootstrap, moment, daterangepicker, bootstrapTable, bootstrapPaginator, tableExport) {
        require(['app', 'router',"models/session/session"], function(app, Router,SessionModel) {
            var sync = Backbone.sync;
            app.secret = app.getCookie("secret");
            var methodMap = {
                'create': 'POST',
                'update': 'PUT',
                'patch': 'PATCH',
                'delete': 'DELETE',
                'read': 'GET'
            };
            Backbone.sync = function(method, model, options) {
                var type = methodMap[method];

                // Default options, unless specified.
                _.defaults(options || (options = {}), {
                    emulateHTTP: Backbone.emulateHTTP,
                    emulateJSON: Backbone.emulateJSON
                });

                // Default JSON-request options.
                var params = {
                    type: type,
                    dataType: 'json',
                    headers: {
                        "authorization": app.secret
                    }
                };

                // Ensure that we have a URL.
                if (!options.url) {
                    params.url = _.result(model, 'url') || urlError();
                }

                // Ensure that we have the appropriate request data.
                if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
                    params.contentType = 'application/json';
                    params.data = JSON.stringify(options.attrs || model.toJSON(options));
                }

                // For older servers, emulate JSON by encoding the request into an HTML-form.
                if (options.emulateJSON) {
                    params.contentType = 'application/x-www-form-urlencoded';
                    params.data = params.data ? {
                        model: params.data
                    } : {};
                }

                if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
                    params.type = type;
                    var _id = (options.attrs || model.toJSON(options))._id;
                    params.url = params.url + "/" + _id;
                }

                // Don't process data on a non-GET request.
                if (params.type !== 'GET' && !options.emulateJSON) {
                    params.processData = false;
                }
                // Pass along `textStatus` and `errorThrown` from jQuery.
                var error = options.error;
                options.error = function(xhr, textStatus, errorThrown) {
                    options.textStatus = textStatus;
                    options.errorThrown = errorThrown;
                    if (error) error.apply(this, arguments);
                };

                // Make the request, allowing the user to override any Ajax options.
                var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
                model.trigger('request', model, xhr, options);
                return xhr;
            };
            var sessionModel = new SessionModel();
            sessionModel.getAuth(function(result) {
                require(["views/appView"], function(AppView) {
                    Backbone.Router.prototype.interceptor = function (r) {
                        var type = r.slice(0,3);
                        if(type !== app.type && ["dsp","ssp"].indexOf(type) !== -1){
                            var flag = false;
                            if(app.isSspAndDsp()){
                                flag = true;
                            }else if(type == "dsp" && app.account.dspId){
                                flag = true;
                            }else if (type == "ssp" && app.account.sspId){
                                flag = true
                            }
                            if(flag){
                                app.setAppType(type);
                                return location.reload();
                            }else{
                                app.router.navigate("/",{trigger:true});
                                return; 
                            }
                        }
                        if(app.session){
                            return true;
                        }else if(r == "login"){
                            return true;
                        }else{
                            location.href = "/#login";
                            return false;
                        }
                    };
                    Backbone.Router.prototype.route = function(route, name, callback) {
                        if (!_.isRegExp(route)) route = this._routeToRegExp(route);
                        if (_.isFunction(name)) {
                            callback = name;
                            name = '';
                        }
                        if (!callback) callback = this[name];
                        var router = this;
                        Backbone.history.route(route, function(fragment) {
                            var args = router._extractParameters(route, fragment);

                            var interceptor = router.interceptor.apply(router, arguments);
                            if (interceptor) {
                                callback && callback.apply(router, args);
                            }

                            router.trigger.apply(router, ['route:' + name].concat(args));
                            router.trigger('route', name, args);
                            Backbone.history.trigger('route', router, name, args);
                        });
                        return this;
                    };
                    app.router = new Router();
                    app.getAppType();
                    Backbone.emulateHTTP = true;
                    Backbone.history.start();
                    new AppView().render();
                });
                
            });
        });
    });
