var app = angular.module('app', ['ngTouch', 'ui.grid']);

//alert('Im running');

app.controller('MainCtrl', ['$scope', function ($scope) {
    $scope.doit = function() {
        console.log('Woot');
    };
    
    $scope.myData = [
        {
            "firstName": "Cox",
            "lastName": "Carney",
            "company": "Enormo",
            "employed": true
        },
        {
            "firstName": "Lorraine",
            "lastName": "Wise",
            "company": "Comveyer",
            "employed": false
        },
        {
            "firstName": "Nancy",
            "lastName": "Waters",
            "company": "Fuelton",
            "employed": false
        }
    ];
}]);
