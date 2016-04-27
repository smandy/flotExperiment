var app = angular.module('app', ['ngAnimate','ngTouch', 'ui.grid', 'ui.grid.grouping']);

//alert('Im running');

app.controller('MainCtrl', ['$scope', '$http', 'uiGridGroupingConstants', function ( $scope, $http, uiGridGroupingConstants ) {
    $scope.doit = function() {
        console.log('Woot');
    };
    
    $scope.gridOptions = {
        enableFiltering: true,
        enableGropuing : true,
        treeRowHeaderAlwaysVisible: true,
        enableGridMenu : true,
        columnDefs: [
            { name: 'strat', width: '10%' },
            { name: 'contract', width: '10%' },
            { name: 'aggressive', width: '7%' },
            { name: 'position', width: '10%' , type: 'number', treeAggregationType: uiGridGroupingConstants.aggregation.COUNT},
            { name: 'total'     ,  type: 'number', cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                if (grid.getCellValue(row,col) < 0) {
                    return 'red';
                }
            }, width : '20%', treeAggregationType: uiGridGroupingConstants.aggregation.SUM },
            { name: 'unrealised', type: 'number', treeAggregationType: uiGridGroupingConstants.aggregation.SUM , width: '20%' },
            { name: 'realised', width : '20%', treeAggregationType: uiGridGroupingConstants.aggregation.SUM },
            { name: 'lastPx', width: '10%' }
        ],
        onRegisterApi: function( gridApi ) {
            $scope.gridApi = gridApi;
        }
    };

    $http.get('pnl.json')
        .success(function(data) {
            $scope.gridOptions.data = data;
        });
    
    $scope.expandAll = function(){
        $scope.gridApi.treeBase.expandAllRows();
    };
    
    $scope.toggleRow = function( rowNum ){
        $scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[rowNum]);
    };
    
    $scope.changeGrouping = function() {
        $scope.gridApi.grouping.clearGrouping();
        $scope.gridApi.grouping.aggregateColumn('strat', uiGridGroupingConstants.aggregation.COUNT);
    };

    $scope.getAggregates = function() {
          var aggregatesTree = [];
          var gender;

          var recursiveExtract = function( treeChildren ) {
              return treeChildren.map( function( node ) {
                  var newNode = {};
                  angular.forEach(node.row.entity, function( attributeCol ) {
                      if( typeof(attributeCol.groupVal) !== 'undefined' ) {
                          newNode.groupVal = attributeCol.groupVal;
                          newNode.aggVal = attributeCol.value;
                      }
                  });
                  newNode.otherAggregations = node.aggregations.map( function( aggregation ) {
                      return { colName: aggregation.col.name, value: aggregation.value, type: aggregation.type };
                  });
                  if( node.children ) {
                      newNode.children = recursiveExtract( node.children );
                  }
                  return newNode;
              });
          }

          aggregatesTree = recursiveExtract( $scope.gridApi.grid.treeBase.tree );

          console.log(aggregatesTree);
      };

    
    
}]);
