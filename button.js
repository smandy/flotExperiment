angular.module('app',[]).controller('MainCtrl', ['$scope', '$timeout', 'gliffy', function ($scope, $timeout, gliffy) {

    $scope.gliffy = gliffy;
    
    $scope.messages = [ { counter : 0 } ];
    
    $timeout( function() {
        $scope.websocket = new WebSocket('ws://localhost:8889/ws');

        $scope.onTimer = function(msg) {
            $scope.messages.push( msg );
        };

        $scope.onPong = function(msg) {
            $scope.messages.push( msg);
        };

        $scope.onImage = function(msg) {
            // console.log('Image ' + msg.msgs);
            msg.msgs.forEach( function(x) {
                $scope.messages.push(x);
            });
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
            //console.log('Got open ' + msg.data);
        };
    });

    $scope.doit = function() {
        //alert('Woot ' + $scope.messages);
        //console.log( $scope.messages );
        $scope.websocket.send( { msgType: 'ping' });
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
      
