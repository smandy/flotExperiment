angular.module('app', ['angular-flot']).factory("DataService", function() {
    var webData = [];
    
    return {
        webData: function() {
            return webData;
        }
    };
});
