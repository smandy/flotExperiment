import cyclone.web
import sys
import json

from twisted.internet import reactor
from twisted.python import log

desc = """One of the things about being a twonk is that no-one really knows
that one is one, its always down %(i)s to others to inform one of ones
twonkness"""

data = []
for i in range(200):
    data.append(  { 'name' : 'Wibble %s' % i      , 'description' : desc % locals() } )
    
class MainHandler(cyclone.web.RequestHandler):
    def get(self):
        self.write("Hello, world")

class DataHandler(cyclone.web.RequestHandler):
    def get(self):
        print self.request
        # This header gets around CORS
        # https://en.wikipedia.org/wiki/JSONP
        if 1:
            self.set_header('Access-Control-Allow-Headers', 'Content-Type')
            self.set_header('Access-Control-Allow-Methods' , 'GET, POST, OPTIONS')
            self.set_header('Access-Control-Allow-Origin' , '*')
        self.set_header('Content-Type' , 'application/javascript')
        self.write(json.dumps(data))

if __name__ == "__main__":
    application = cyclone.web.Application([
        (r"/", MainHandler),
        (r"/data", DataHandler)
    ])
    log.startLogging(sys.stdout)
    reactor.listenTCP(8888,
                      application,
                      interface="127.0.0.1")
    reactor.run()
