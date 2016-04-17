angular.module( 'AngularExperiment', []).controller( 'MyController', ['$scope', function($scope) {
    $scope.heads = [
        { name : 'Foo'},
        { name : 'Bar'},
        { name : 'Baz'}
    ];
} ] );
