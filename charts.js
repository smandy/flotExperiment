angular.module('app').controller('MainCtrl', ['$scope', '$timeout', 'gliffy', 'DataService',  function ($scope, $timeout, gliffy, DataService) {
    $scope.gliffy = gliffy;
    $scope.messages = [ { counter : 0 } ];
    $scope.options = {
        series: {
            lines: { show: true,
                     fill: false,
                     steps : true,
                     fillColor: "rgba(0, 255, 255, 0.25)" },
            points: { show: false, fill: false }
        },
        legend: {
            container: '#legend',
            show: true
        }
    };
    
    $scope.dataset = [{ data: DataService.webData(),
                        backgroundColor : 'black',
                        color : 'cyan',
                        lineWidth : 1,
                        //yaxis: 1,
                        label: 'Woot' }];

    $scope.row3Dataset = [{ data: DataService.webData(),
                            backgroundColor : 'black',
                            color : 'lightgreen',
                            steps : true,
                            lineWidth : 3,
                            //yaxis: 1,
                            label: 'Woot' }];

    $scope.row3Options = {
        series: {
            lines: { show: true,
                     fill: false,
                     lineWidth : 2,
                     steps : true,
                     fillColor: "rgba(0, 255,0, 0.15)" },
            points: { show: false, fill: false }
        },
        legend: {
            container: '#legend',
            show: true
        }
    };
    

    $scope.row2Dataset = [{ data: DataService.webData(),
                            backgroundColor : 'black',
                            color : 'red',
                            lineWidth : 3,
                            steps : true,
                            //yaxis: 1,
                            label: 'Woot' }];

    $scope.row2Options = {
        series: {
            lines: { show: true,
                     fill: false,
                     lineWidth : 3,
                     steps : true,
                     fillColor: "rgba(255, 0,0, 0.3)" },
            points: { show: false, fill: false }
        },
        legend: {
            container: '#legend',
            show: true
        }
    };
    
    //$scope.dataLength = 0;
    //$scope.data = DataService.webData();
    console.log( 'Identity ' + $scope.data === DataService.webData() );
    
    
    $timeout( function() { 
        $scope.websocket = new WebSocket('ws://localhost:8889/ws');

        $scope.onTimer = function(msg) {
            $scope.addPoint(msg);
        };

        $scope.onPong = function(msg) {
            $scope.addPoint(msg);
        };

        $scope.addPoint = function(msg) {
            var data = DataService.webData();
            $scope.messages.push( msg);
            DataService.addPoint(msg.data);
            if( DataService.length() > 300 ) {
                DataService.shift();
            };
        };

        $scope.onImage = function(msg) {
            // console.log('Image ' + msg.msgs);
            msg.msgs.forEach( $scope.addPoint );
        };
        
        $scope.dispatch = {
            image : $scope.onImage,
            timer : $scope.onTimer,
            pong  : $scope.onPong
        };

        $scope.handle = function(msg) {
            var js = JSON.parse(msg.data);
            if ( js.msgType in $scope.dispatch) {
                var target = $scope.dispatch[js.msgType];
                //console.log("Dispatch to " + target);
                target(js);
            } else {
                alert('No dispatcher for ' + js.msgType);
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

    $scope.doit = function() {
        $scope.websocket.send( JSON.stringify({ msgType: 'ping' }));
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
}]).factory( 'gliffy', [ function() {
    return function(msg) {
        if (msg.msgType=="pong") {
            return "glyphicon-chevron-left";
        } else {
            return "glyphicon-time";
        };
    };
} ] );;

