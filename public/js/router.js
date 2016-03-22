// Filename: router.js
define(["views/viewsmanager"], function(viewsmanager) {
    var AppRouter = Backbone.Router.extend({
        routes: {
            'login': 'login',
            'dsp/home': 'dspHome',
            'dsp/settings':'dspSettingsSize',
            'dsp/settings/sizes':'dspSettingsSize',
            'dsp/settings/types':'dspSettingsType',
            'dsp/settings/screens':'dspSettingsScreen',
            'dsp/settings/sitetypes':'dspSettingsSitetypes',
            'dsp/settings/siteurls':'dspSettingsSiteurls',

            'dsp/reports':'dspReportsBid',
            'dsp/reports/bid':'dspReportsBid',
            'dsp/reports/bid-error':'dspReportsBidError',
            'dsp/reports/realtime':'dspReportsRealtime',
            'dsp/reports/history':'dspReportsHistory',
            'dsp/reports/history-site':'dspReportsHistorySite',
            'dsp/reports/history-size':'dspReportsHistorySize',
            'dsp/reports/preference':'dspReportsPreference',
            'dsp/reports/personal':'dspReportsPersonal',

            'dsp/account':'dspAccount',

            'ssp/home':'sspHome',
            'ssp/reports/bid':'sspReportsBid',
            'ssp/reports/realtime':'sspReportsRealtime',
            'ssp/reports/history':'sspReportsHistory',

            'ssp/zones/index':'sspZones',
            'ssp/zones/create':'sspZonesCreate',
            'ssp/settings':'sspSettingsUnion',
            'ssp/settings/union':'sspSettingsUnion',
            'business':'business',
            'business/manage/:type':'business',
            'business/dspSetting':'businessDsp',
            'business/dsp_size':'businessDspSize',


            'admin':'admin',
            "admin/global" :"adminGlobal",
            'account/setting'   :'accountSetting'
        },

        login: function() {
            require(['views/session/loginView'], function(LoginView) {
                var loginView = viewsmanager.create("loginView", LoginView);
                loginView.render();
            });
        },
        //dsp router
        dspHome: function() {
            require(['dsp/views/home/index'], function(DspHomeView) {
                var dspHomeView = viewsmanager.create("dspHomeView", DspHomeView);
                dspHomeView.render();
            });
        },

        //dsp setting
        dspSettingsSize:function(){
            require(['dsp/views/settings/index'], function(DspSettingsView) {
                var dspSettingsView = viewsmanager.create("dspSettingsView", DspSettingsView);
                dspSettingsView.render("sizes");
            });
        },
        dspSettingsType:function(){
            require(['dsp/views/settings/index'], function(DspSettingsView) {
                var dspSettingsView = viewsmanager.create("dspSettingsView", DspSettingsView);
                dspSettingsView.render("types");
            });
        },
        dspSettingsScreen:function(){
            require(['dsp/views/settings/index'], function(DspSettingsView) {
                var dspSettingsView = viewsmanager.create("dspSettingsView", DspSettingsView);
                dspSettingsView.render("screens");
            });
        },
        dspSettingsSitetypes:function(){
            require(['dsp/views/settings/index'], function(DspSettingsView) {
                var dspSettingsView = viewsmanager.create("dspSettingsView", DspSettingsView);
                dspSettingsView.render("sitetypes");
            });
        },
        dspSettingsSiteurls:function(){
            require(['dsp/views/settings/siteurls'], function(DspSettingsViewScreen) {
                var dspSettingsView = viewsmanager.create("dspSettingsViewSiteurls", DspSettingsViewScreen);
                dspSettingsView.render();
            });
        },

        //dsp stats
        dspReportsBid:function(){
            require(['dsp/views/report/bid'], function(DspReportView) {
                var dspReportView = viewsmanager.create("reportViewBid", DspReportView);
                dspReportView.render();
            });
        },
        
        dspReportsBidError:function(){
            require(['dsp/views/report/bid-error'], function(DspReportView) {
                var dspReportView = viewsmanager.create("reportViewBidError", DspReportView);
                dspReportView.render();
            });
        },
        
        dspReportsRealtime:function(){
            require(['dsp/views/report/realtime'], function(DspReportView) {
                var dspReportView = viewsmanager.create("reportViewrRealtime", DspReportView);
                dspReportView.render();
            });
        },
        
        dspReportsHistory:function(){
            require(['dsp/views/report/history'], function(DspReportView) {
                var dspReportView = viewsmanager.create("reportViewHistory", DspReportView);
                dspReportView.render();
            });
        },
        
        dspReportsHistorySite:function(){
            require(['dsp/views/report/history-site'], function(DspReportView) {
                var dspReportView = viewsmanager.create("reportViewHistorySite", DspReportView);
                dspReportView.render();
            });
        },
        
        dspReportsHistorySize:function(){
            require(['dsp/views/report/history-size'], function(DspReportView) {
                var dspReportView = viewsmanager.create("reportViewHistorySize", DspReportView);
                dspReportView.render();
            });
        },

        dspReportsPreference:function(){
            require(['dsp/views/report/preference'], function(DspReportView) {
                var dspReportView = viewsmanager.create("reportViewPreference", DspReportView);
                dspReportView.render();
            });
        },

        dspReportsPersonal:function(){
            require(['dsp/views/report/personal'], function(DspReportView) {
                var dspReportView = viewsmanager.create("reportViewPersonal", DspReportView);
                dspReportView.render();
            });
        },

        dspAccount:function(){
            require(['dsp/views/account/index'], function(DspAccountView) {
                var dspAccountView = viewsmanager.create("accountView", DspAccountView);
                dspAccountView.render();
            });
        },

        //ssp router
        sspHome:function(){
            require(['ssp/views/home/index'], function(SspHomeView) {
                var sspHomeView = viewsmanager.create("sspHomeView", SspHomeView);
                sspHomeView.render();
            });
        },

        sspReportsBid:function(){
            require(['ssp/views/report/bid'], function(SspReportView) {
                var sspReportView = viewsmanager.create("reportViewBid", SspReportView);
                sspReportView.render();
            });
        },

        sspReportsRealtime:function(){
            require(['ssp/views/report/realtime'], function(SspReportView) {
                var sspReportView = viewsmanager.create("sspreportViewrRealtime", SspReportView);
                sspReportView.render();
            });
        },

        sspReportsHistory:function(){
            require(['ssp/views/report/history'], function(SspReportView) {
                var sspReportView = viewsmanager.create("sspreportViewHistory", SspReportView);
                sspReportView.render();
            });
        },
        sspZones:function(){
            require(['ssp/views/zones/index'], function(SspZonesView) {
                var sspZonesView = viewsmanager.create("sspZonesView", SspZonesView);
                sspZonesView.render();
            });
        },
        sspZonesCreate:function(){
            require(['ssp/views/zones/create'], function(SspZonesCreateView) {
                var sspZonesCreateView = viewsmanager.create("sspZonesCreateView", SspZonesCreateView);
                sspZonesCreateView.render();
            });
        },
        sspSettings:function(){
            require(['ssp/views/settings/index'], function(SspSettingsView) {
                var sspSettingsView = viewsmanager.create("sspSettingsView", SspSettingsView);
                sspSettingsView.render();
            });
        }, 
        sspSettingsUnion:function(){
            require(['ssp/views/settings/union'], function(SspSettingsUnionView) {
                var sspSettingsUnionView = viewsmanager.create("sspSettingsViewUnion", SspSettingsUnionView);
                sspSettingsUnionView.render();
            });
        },
        accountSetting:function(){
            require(['views/session/settings'], function(AccountSetting) {
                var accountSetting = viewsmanager.create("accountSettingView", AccountSetting);
                accountSetting.render();
            });
        },
        business:function(type){
            if(app.session && app.session.authorize && app.session.authorize.type <= 4){
                require(['business/views/index'], function(businessView) {
                    var businessView = viewsmanager.create("businessView", businessView);
                    businessView.render(type);
                });
            }
        },
        businessDsp:function(){
            console.log('viewDsp: ');
            if(app.session && app.session.authorize && app.session.authorize.type <= 2){
                require(['business/views/dspSetting'], function(businessView) {
                    var businessViewDsp = viewsmanager.create("businessViewDsp", businessView);
                    businessViewDsp.render();
                });
            }
        },
        businessDspSize:function(){
            if(app.session && app.session.authorize && app.session.authorize.type <= 2){
                require(['business/views/sizeSetting'], function(BusinessViewSize) {
                    var businessViewSize = viewsmanager.create("businessViewDspSize", BusinessViewSize);
                    businessViewSize.render();
                });
            }
        },
        admin:function(){
            if(app.session && app.session.authorize && app.session.authorize.type == 1){
                require(['admin/views/index'], function(adminView) {
                    var adminView = viewsmanager.create("adminView", adminView);
                    adminView.render();
                });
            }
        },
        /*adminDsp:function(){
            if(app.session && app.session.authorize && app.session.authorize.type == 1){
                require(['admin/views/dspSetting'], function(adminView) {
                    var adminViewDsp = viewsmanager.create("adminViewDsp", adminView);
                    adminViewDsp.render();
                });
            }
        },*/
        adminGlobal:function(){
            if(app.session && app.session.authorize && app.session.authorize.type == 1){
                require(['admin/views/globalSetting'], function(adminView) {
                    var adminViewGlobal = viewsmanager.create("adminViewGlobal", adminView);
                    adminViewGlobal.render();
                });
            }
        }
    });


    Backbone.history.on('route', function(r, u) {
        if (['login'].indexOf(u) !== -1) {
            $(".nav").hide();
        } else {
            $(".nav").show();
        }
    });
    return AppRouter;
});
