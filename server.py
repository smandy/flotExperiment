import cyclone.web
import sys
import json
import cyclone.websocket
from twisted.internet import reactor
from twisted.python import log
from twisted.internet.task import LoopingCall

import random
desc = """olorem ipso factor twonko """ * 20

data = []
for i in range(50):
    data.append(  { 'name' : 'Wibble %s' % i, 'description' : desc % locals() } )

class WebSocketHandler(cyclone.websocket.WebSocketHandler):
    def initialize(self, coordinator):
        self.coordinator = coordinator
        self.websockets = set()
        
    def connectionMade(self):
        self.coordinator.connectionMade(self )
        log.msg("ws opened %s" % self)

    def connectionLost(self, reason):
        log.msg("ws closed %s " % self)
        self.coordinator.connectionLost(self)

    def messageReceived(self, message):
        log.msg("got message %s" % message)
        self.coordinator.broadcast({
            'msgType' : 'pong',
            'counter' : 666,
            'x' : random.random(),
            'y' : random.random(),
            'data' : random.random()
        })

class Coordinator:
    def __init__(self):
        self.websockets = set()
        self.counter = 0
        self.messages = []

    def broadcast(self, msg):
        """Jsonify and send message to all websockets"""
        msgString = json.dumps(msg)
        self.messages.append(msg)
        for ws in self.websockets:
            ws.sendMessage(msgString)
        
    def connectionMade(self, ws):
        print "Adding %s" % ws
        self.websockets.add( ws)
        ws.sendMessage( json.dumps( { 'msgType' : 'image',
                                      'data' : random.random(),
                                      'msgs' : self.messages } ) )

    def connectionLost(self, ws):
        print "Removing %s" % ws
        self.websockets.remove(ws)

    def onTimer(self, *args):
        self.counter += 1
        log.msg("OnTimer %s" % self.counter)
        msg = { 'msgType' : 'timer',
                'data' : random.random(),
                'x' : random.random(),
                'y' : random.random(),
                'counter' : self.counter }
        self.messages.append( msg )
        msgString = json.dumps(msg)
        for ws in self.websockets:
            ws.sendMessage( msgString )
        
class DataHandler(cyclone.web.RequestHandler):
    def get(self):
        # This header gets around CORS
        # https://en.wikipedia.org/wiki/JSONP
        if 1:
            self.set_header('Access-Control-Allow-Headers', 'Content-Type')
            self.set_header('Access-Control-Allow-Methods' , 'GET, POST, OPTIONS')
            self.set_header('Access-Control-Allow-Origin' , '*')
            self.set_header('Content-Type' , 'application/javascript')
        self.write(json.dumps(data))

if __name__ == "__main__":
    coordinator = Coordinator()
    
    application = cyclone.web.Application([
        (r"/", cyclone.web.RedirectHandler, dict(url="angularExperiment.html")),
        (r"/data", DataHandler),
        (r"/ws"  , WebSocketHandler, dict( coordinator = coordinator)),
        (r'/(.*)' , cyclone.web.StaticFileHandler, { 'path' : '.' } ),
    ])
    log.startLogging(sys.stdout)
    reactor.listenTCP(8889,
                      application,
                      interface="127.0.0.1")
    lc = LoopingCall(coordinator.onTimer)
    lc.start(2)
    reactor.run()
