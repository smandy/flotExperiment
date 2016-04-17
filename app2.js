angular.module( 'AngularExperiment', []).controller( 'MyController', ['$scope', '$http', function($scope, $http) {
    $http( { method : 'GET', url : 'http://localhost:8888/data'} ).success( function(data) {
        $scope.heads = data;
    });
} ] );
