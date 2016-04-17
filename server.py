import cyclone.web
import sys
import json

from twisted.internet import reactor
from twisted.python import log

desc = """olorem ipso factor twonko """ * 20

data = []
for i in range(50):
    data.append(  { 'name' : 'Wibble %s' % i, 'description' : desc % locals() } )
    
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
    application = cyclone.web.Application([
        (r"/", cyclone.web.RedirectHandler, dict(url="angularExperiment.html")),
        (r"/data", DataHandler),
        (r'/(.*)' , cyclone.web.StaticFileHandler, { 'path' : '.' } ),
    ])
    log.startLogging(sys.stdout)
    reactor.listenTCP(8889,
                      application,
                      interface="127.0.0.1")
    reactor.run()
