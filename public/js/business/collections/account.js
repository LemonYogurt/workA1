define(['models/account/account'], function(accountModel) {
    var accountCollection = Backbone.Collection.extend({
        model: accountModel,
        url: '/business/account',
        initialize: function() {}
    });
    return accountCollection;
});
