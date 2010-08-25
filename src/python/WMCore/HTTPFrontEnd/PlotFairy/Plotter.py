'''
Builds a plot from json data.
'''
from WMCore.WebTools.RESTModel import RESTModel
from WMCore.Services.Requests import JSONRequests
from WMCore.WMFactory import WMFactory

from cherrypy import request
import urllib

try:
    # Python 2.6
    import json
except:
    # Prior to 2.6 requires simplejson
    import simplejson as json
    
class Plotter(RESTModel):
    '''
    A class that generates a plot object to send to the formatter, possibly 
    downloading the data from a remote resource along the way
     
    '''
    def __init__(self, config):
        RESTModel.__init__(self, config)
        
        self.methods['POST'] = {'plot': {'version':1,
                                         'call':self.plot,
                                         'args': ['type', 'data', 'url'],
                                         'expires': 300}}
        self.methods['GET'] = {'plot': {'version':1,
                                         'call':self.plot,
                                         'args': ['type', 'data', 'url'],
                                         'expires': 300},
                               'doc':  {'version':1,
                                         'call':self.doc,
                                         'args': ['type'],
                                         'expires':300}}
        self.factory = WMFactory('plot_fairy',
                                 'WMCore.HTTPFrontEnd.PlotFairy.Plots')
        
    def plot(self, *args, **kwargs):
        input = self.sanitise_input(args, kwargs, 'plot')
        if not input['data']:
            # We have a URL for some json - we hope!
            jr = JSONRequests(input['url'])
            input['data'] = jr.get()
        plot = self.factory.loadObject(input['type'])
        
        return {'figure': plot(input['data'])}
            
    def doc(self, *args, **kwargs):
        input = self.sanitise_input(args, kwargs, 'doc')
        plot = self.factory.loadObject(input['type'])
        return {'doc': plot.doc()}
            
    def validate_input(self, input, verb, method):
        assert 'type' in input.keys(), \
                "no type provided - what kind of plot do you want? " +\
                "Choose one of %s" % self.plot_types.keys()
        if method=='doc':
            return input
        
        if not 'data' in input.keys():
            input['data'] = {}
            assert 'url' in input.keys()
            reg = "(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?"
            assert re.compile(reg).match(input['url']) != None , \
              "'%s' is not a valid URL (regexp: %s)" % (input['url'], reg)
        else:
            input['data'] = json.loads(urllib.unquote(input['data']))
                 
         
        return input