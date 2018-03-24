var app = angular.module('app', ['ngAnimate','ngTouch', 'ui.grid', 'ui.grid.grouping']);

//alert('Im running');

app.filter('myNumeric', function() {
    return function (value) {
        if (value < 0) {
            value = '(' + Math.abs(value) + ')';
        }
        return value;
    };
});

app.controller('MainCtrl', ['$scope', '$http', 'uiGridGroupingConstants', '$timeout', function ( $scope, $http, uiGridGroupingConstants, $timeout ) {
    $scope.doit = function() {
        console.log('Woot');
    };

    var numberClass = function(grid, row, col, rowRenderIndex, colRenderIndex) {
        if (grid.getCellValue(row,col) < 0) {
            return 'red';
        } else {
            return 'green';
        };
    };

    var myTemplate = '<div><div class="ui-grid-cell-contents">{{COL_FIELD CUSTOM_FILTERS | currency : "" : 0 }}</div></div>';
    var pnlTemplate= '<div><div class="ui-grid-cell-contents">{{COL_FIELD CUSTOM_FILTERS | currency : "" : 0 }}</div></div>';
    var priceTemplate= '<div><div class="ui-grid-cell-contents">{{COL_FIELD CUSTOM_FILTERS | number : 2 }}</div></div>';
    
    $scope.gridOptions = {
        enableFiltering: true,
        enableGropuing : true,
        treeRowHeaderAlwaysVisible: true,
        enableGridMenu : true,
        columnDefs: [
            { name: 'strat', width: '10%' },
            { name: 'contract', width: '10%' },
            { name: 'aggressive', width: '7%' },
            { name: 'position', width: '10%' , cellTemplate : myTemplate, type: 'number', treeAggregationType: uiGridGroupingConstants.aggregation.COUNT, cellClass: numberClass},
            { name: 'orth', width: '5%' , type: 'number', treeAggregationType: uiGridGroupingConstants.aggregation.COUNT},
            { name: 'total'     ,  cellTemplate : pnlTemplate, type: 'number', cellClass : numberClass, width : '13%', treeAggregationType: uiGridGroupingConstants.aggregation.SUM },
            { name: 'unrealised', cellTemplate : pnlTemplate, type: 'number', cellClass : numberClass, treeAggregationType: uiGridGroupingConstants.aggregation.SUM , width: '13%' },
            { name: 'realised', width : '13%', type : 'number', cellClass : numberClass, treeAggregationType: uiGridGroupingConstants.aggregation.SUM },
            { name: 'lastPx', width: '10%', cellTemplate : priceTemplate, cellClass : 'price' }
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
        };

        aggregatesTree = recursiveExtract( $scope.gridApi.grid.treeBase.tree );

        console.log(aggregatesTree);
    };

    $timeout( function() {
        $scope.websocket = new WebSocket('ws://localhost:8889/ws_ticklepnl');
        
        $scope.ticklePnl = function(msg) {
            //console.log("onPnl " + msg);
            $scope.gridOptions.data[msg.idx] = msg.pnl;
        };
        
        $scope.dispatch = {
            pnl: $scope.ticklePnl
        };

        $scope.handle = function(msg) {
            var js = JSON.parse(msg.data);
            if (js.msgType in $scope.dispatch) {
                var target = $scope.dispatch[js.msgType];
                //console.log("Dispatch to " + target);
                target(js);
            } else {
                console.log('No dispatcher for ' + js.msgType);
            };
        };
        
        $scope.websocket.onmessage = function( msg ) {
            //console.log('Got message ' + msg);
            $scope.$apply( function() {
                $scope.handle(msg);
            } );
        };

        $scope.websocket.onopen = function( msg ) {
            console.log('Got open ' + msg.data);
        };
    });
}]);
