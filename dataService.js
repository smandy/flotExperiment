angular.module('app', ['angular-flot', 'ui.bootstrap']).factory("DataService", function() {
    console.log("Creating dataservice");
    
    var webData = new Array();
    var dataLength = 0;
    var count = 0;
    
    return {
        webData: function() {
            return webData;
        },
        length : function() {
            return dataLength;
        },
        addPoint : function(x) {
            webData[webData.length] = [count,x];
            dataLength += 1;
            count += 1;
        },
        shift : function() {
            webData.shift();
            dataLength -= 1;
        }
    };
});
