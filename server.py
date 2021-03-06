import sys
import json
import tornado.websocket
from twisted.internet import reactor
from twisted.python import log
from twisted.internet.task import LoopingCall

import random

class Brownian:
    def __init__(self):
        self.value = 50.0

    def getPoint(self):
        self.value += random.random() - 0.5
        return self.value

b = Brownian()
getPoint = b.getPoint

class WebSocketPnlTickler(tornado.websocket.WebSocketHandler):
    def initialize(self, coordinator):
        self.coordinator = coordinator
        self.websockets = set()
        
    def open(self):
        self.coordinator.newPnl(self )
        log.msg("ws opened %s" % self)

    def on_close(self):
        log.msg("ws closed %s " % self)
        self.coordinator.delPnl(self)


class WebSocketHandler(tornado.websocket.WebSocketHandler):
    def initialize(self, coordinator):
        self.coordinator = coordinator
        self.websockets = set()
        
    def open(self):
        self.coordinator.connectionMade(self )
        log.msg("ws opened %s" % self)

    def on_close(self):
        log.msg("ws closed %s " % self)
        self.coordinator.connectionLost(self)


        
    def on_message(self, message):
        log.msg("got message %s" % message)
        self.coordinator.broadcast({
            'msgType' : 'pong',
            'counter' : 666,
            'x' : getPoint(),
            'y' : getPoint(),
            'data' : getPoint()
        })

class Coordinator:
    def __init__(self):
        self.websockets = set()
        self.pnlWebsockets = set()
        self.counter = 0
        self.messages = []

        self.pnls = json.load( open('pnl.json','r'))
        
        #log.info("Got %s pnls")
        self.emitters = {'meh' : True,
                         'dodgy' : True,
                         'allIsWell' : True,
                         'dodgy2' : False,
                         'lunch' : True,
                         'earthQuake' : True,
                         'disaster' : True,
                         'flood' : True,
                         'arb1' : True,
                         'arb2' : True,
                         'arb3' : True,
                         'arb4' : True }
        
    def broadcast(self, msg):
        """Jsonify and send message to all websockets"""
        msgString = json.dumps(msg)
        #self.messages.append(msg)
        for ws in self.websockets:
            ws.write_message(msgString)
    def pnlBroadcast(self, msg):
        """Jsonify and send message to all websockets"""
        msgString = json.dumps(msg)
        #self.messages.append(msg)
        for ws in self.pnlWebsockets:
            ws.write_message(msgString)

    def newPnl(self, ws):
        print("Add pnl %s" % ws)
        self.pnlWebsockets.add(ws)

    def delPnl(self, ws):
        print("Remove pnl %s" % ws)
        self.pnlWebsockets.remove(ws)
    
    def connectionMade(self, ws):
        print("Adding %s" % ws)
        self.websockets.add( ws )
        ws.write_message( json.dumps( { 'msgType' : 'image',
                                        'data' : getPoint(),
                                        'msgs' : self.messages } ) )
    def connectionLost(self, ws):
        print("Removing %s" % ws)
        self.websockets.remove(ws)

    def onTimer(self, *args):
        self.counter += 1
        if self.counter % 10 == 0:
            log.msg("OnTimer %s (%s sockets)" % (self.counter, len(self.websockets)))
        msg = { 'msgType' : 'timer',
                'data' : getPoint(),
                'x' : getPoint(),
                'y' : getPoint(),
                'counter' : self.counter }
        self.broadcast(msg)
        self.messages.append(msg)
        self.messages = self.messages[-400:]

    def tickleEmitters(self):
        if True or random.choice( [False] * 5 + [True]):
            emitter, value = random.choice(list(self.emitters.items()))
            log.msg("Mutating %s" % emitter)
            newValue = bool(not value)
            msg = { 'msgType' : 'emitter',
                    'emitterName' : emitter,
                    'emitterValue' : newValue }
            self.emitters[emitter] = newValue
            self.broadcast(msg)

    def ticklePnls(self):
        #pnls = []
        for i in range(10):
            idx = random.randint( 0, len(self.pnls)-1)
            pnl = self.pnls[idx]
            pnl['total'] += random.randint(0,1000) - 500
            pnl['realised'] += random.randint(0,1000) - 500
            print(("Beep, ", pnl))
            d = { 'msgType' : 'pnl',
                  'idx' : idx,
                  'pnl' : pnl }
            self.pnlBroadcast( d )
        
        
class TSDataHandler(tornado.web.RequestHandler):
    def initialize(self, coordinator):
        self.coordinator = coordinator
    
    def get(self):
        # This header gets around CORS
        # https://en.wikipedia.org/wiki/JSONP
        if 1:
            self.set_header('Access-Control-Allow-Headers', 'Content-Type')
            self.set_header('Access-Control-Allow-Methods' , 'GET, POST, OPTIONS')
            self.set_header('Access-Control-Allow-Origin' , '*')
            self.set_header('Content-Type' , 'application/javascript')
        self.write(json.dumps(self.coordinator.messages))
        
if __name__ == "__main__":
    coordinator = Coordinator()
    from tornado.platform.twisted import TwistedIOLoop
    TwistedIOLoop().install()
    
    application = tornado.web.Application([
        (r"/", tornado.web.RedirectHandler, dict(url="button.html")),
        (r"/ts", TSDataHandler, dict(coordinator = coordinator)),
        (r"/ws"  , WebSocketHandler, dict( coordinator = coordinator)),
        (r"/ws_ticklepnl"  , WebSocketPnlTickler, dict( coordinator = coordinator)),
        (r'/(.*)' , tornado.web.StaticFileHandler, { 'path' : '.' } ),
    ])
    log.startLogging(sys.stdout)
    #reactor.listenTCP(8889,
    #                  application,
    #                  interface="127.0.0.1")
    application.listen(8889)
    lc  = LoopingCall(coordinator.onTimer)
    lc2 = LoopingCall(coordinator.tickleEmitters)
    
    lc.start(1.0)
    lc2.start(1.5)

    if 'realtime' in sys.argv:
        lc3 = LoopingCall(coordinator.ticklePnls)
        lc3.start(1.1)
    
    reactor.run()
