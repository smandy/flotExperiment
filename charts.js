angular.module('app').controller('MainCtrl', ['$scope', '$timeout', 'gliffy', 'DataService',  function ($scope, $timeout, gliffy, DataService) {
    $scope.gliffy = gliffy;
    
    $scope.messages = [ { counter : 0 } ];
    
    $scope.showRow1 = false;
    $scope.showRow2 = false;
    $scope.showRow3 = false;
    $scope.showEmitters  = true;
    $scope.showEmitters2 = true;
    $scope.showEmitters3 = true;
    
    $scope.emitters = {
        meh: true,
        dodgy : true,
        allIsWell : true,
        dodgy2 : false,
        lunch : true,
        earthQuake : true,
        disaster : true,
        flood : true,
        arb1: false,
        arb2: false,
        arb3: false,
        arb4: false
    };

    $scope.emitterClass = function(b) {
        //console.log("Chpoink");
        var prefix = "well col-sm-3 div-150 ";
        return b ? prefix + "bg-green" : prefix + "bg-red";
    };
    
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

        $scope.onEmitter = function(msg) {
            if ( msg.emitterName in $scope.emitters) {
                $scope.emitters[msg.emitterName] = msg.emitterValue;
            } else {
                console.log( 'Unknown emitter ' + msg.emitterName + ' all i know is ' + $scope.emitters);
            };
        };

        $scope.onImage = function(msg) {
            // console.log('Image ' + msg.msgs);
            msg.msgs.forEach( $scope.addPoint );
        };
        
        $scope.dispatch = {
            image : $scope.onImage,
            timer : $scope.onTimer,
            pong  : $scope.onPong,
            emitter : $scope.onEmitter
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
}]).factory( 'gliffy', [ function() {
    return function(msg) {
        if (msg.msgType=="pong") {
            return "glyphicon-chevron-left";
        } else {
            return "glyphicon-time";
        };
    };
} ] );;

