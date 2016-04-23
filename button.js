angular.module('app').controller('MainCtrl', ['$scope', '$timeout', 'gliffy', 'DataService',  function ($scope, $timeout, gliffy, DataService) {
    $scope.gliffy = gliffy;
    
    $scope.messages = [ { counter : 0 } ];

    $scope.data = DataService.webData();

    //$scope.flot = $controller('FlotCtrl');
    
	$scope.series = [{
		data: $scope.data,
		lines: {
			fill: true
		}
    }];
    
    $timeout( function() {
	    var container = $("#placeholder");

        console.log("Container is " + container);

        $scope.websocket = new WebSocket('ws://localhost:8889/ws');

        $scope.onTimer = function(msg) {
            $scope.addPoint(msg);
            $scope.redraw();
            //$flot.dataset = $scope.data;
        };

        $scope.onPong = function(msg) {
            $scope.addPoint(msg);
            $scope.redraw();
        };

        $scope.addPoint = function(msg) {
            $scope.messages.push( msg);
            var x = [ $scope.data.length, msg.data];
            //console.log('adding ' + x);
            $scope.data[$scope.data.length] = x;
        };

        $scope.onImage = function(msg) {
            // console.log('Image ' + msg.msgs);
            msg.msgs.forEach( $scope.addPoint );
            $scope.redraw();
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

        $scope.redraw = function() {
            // console.log('Redraw ' + $scope.data );
		    $scope.series[0].data = $scope.data;
		    $scope.plot.setData($scope.series);
		    $scope.plot.draw();
        };

	    $scope.plot = $.plot(container, $scope.data, {
		    grid: {
			    borderWidth: 1,
			    minBorderMargin: 20,
			    labelMargin: 10,
			    backgroundColor: {
				    colors: ["#fff", "#e4f4f4"]
			    },
			    margin: {
				    top: 8,
				    bottom: 20,
				    left: 20
			    },
			    markings: function(axes) {
				    var markings = [];
				    var xaxis = axes.xaxis;
				    for (var x = Math.floor(xaxis.min); x < xaxis.max; x += xaxis.tickSize * 2) {
					    markings.push({ xaxis: { from: x, to: x + xaxis.tickSize }, color: "rgba(232, 232, 255, 0.2)" });
				    }
				    return markings;
			    }
		    },
		    xaxis: {
                min : 0,
                max : 1000,
			    tickFormatter: function() {
				    return "";
			    }
		    },
		    yaxis: {
			    min: 0,
			    max: 110
		    },
		    legend: {
			    show: true
		    }
	    });

        
    });

    $scope.doit = function() {
        //alert('Woot ' + $scope.messages);
        //console.log( $scope.messages );
        $scope.websocket.send( JSON.stringify({ msgType: 'ping' }));

        // console.log("Dataset is " + FlotCtrl.dataChart);
        // console.log("Dataset is " + FlotCtrl.dataset);
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

