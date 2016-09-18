from twisted.protocols.basic import LineReceiver
from twisted.internet.protocol import Factory
from tickerPlant import Plant

class FakeQuoteServerProtocol(LineReceiver):
    def __init__(self, coordinator):
        self.coordinator = coordinator
    
    answers = {'How are you?': 'Fine', None : "I don't know what you mean"}
    def lineReceived(self, line):
        pass

class Coordinator:
    def __init__(self):
        self.tickerPlant = Plant()

    
class FakeQuoteServerFactory(Factory):
    def __init__(self):
        self.users = {} # maps user names to Chat instances

    def buildProtocol(self, addr):
        return FakeQuoteServerProtocol(self.users)
