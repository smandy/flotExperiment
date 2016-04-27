

strats = ['FillScalper','WrigleyVille','Bund','Islington','Fiztrovia']
contracts = ['FDXM','FESX','FDAX','FSMI','FGBL', 'FOAT']

aggressivity = [True, False]

import random, json

out = []
for strat in strats:
    for contract in contracts:
        for aggressive in aggressivity:
            if random.choice( [ False,True,True] ):
                x = { 'contract' : contract,
                      'strat'    : strat,
                      'position' : random.randint(-100,100),
                      'aggressive' : aggressive,
                      'unrealised' : 5000 * random.random() - 2500,
                      'realised' : 5000 * random.random() - 2500,
                      'lastPx'   : 100 + 50 * random.random()
                        }
                x['total'] = x['realised'] + x['unrealised']
                out.append(x)
json.dump( out, open('pnl.json','w'))
    
                
                    
                    
            
        

