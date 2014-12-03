
var wrapper = require('winsystraywrapper');
var spawn = require('child_process').spawn;
var http = require('http');

var settings =
{
    'title'     : 'Transport Manager',
    'icon'      : __dirname + '/../htdocs/icons/Car.ico',
    'exe'       : process.execPath,
    'arguments' : __dirname + '/TransportManager.js',
    'menu'      : [
                    {
                        'caption'  : 'Transport Manager',
                        'default'  : true,
                        'function' : function()
                                     {
                                        spawn('cmd.exe', ['/c', 'start', 'http://localhost:8080']);
                                     }
                    },
                    {
                        'caption'  : 'Server log',
                        'function' : wrapper.showLog
                    },
                    {
                        'caption'  : 'Stop',
                        'function' : function()
                        {
                            function requestFinished()
                            {
                                console.log("request finished");
                                wrapper.waitForExit(5000);
                                wrapper.stop();
                            }
                        
                            var request = http.request({host:'localhost', port:8080, path:'/quitTransportManager'}, requestFinished);
                            
                            request.on('error', function(e)
                            {
                                console.log('problem with request: ' + e.message);
                                requestFinished();
                            });
                            
                            request.end();
                            console.log("request started");
                        }
                    }
                  ]
};

wrapper.run(settings);

var interval = setInterval(function()
{
    var persistSettings = settings;
    var brc = wrapper.poll();
    
    if (brc == false)
    {
        clearInterval(interval);
    }
    
}, 100);

