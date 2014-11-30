
var spawn = require('child_process').spawn;
var wrapper = require('winsystraywrapper');

wrapper.run(
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
                        'function' : wrapper.stop
                    }
                  ]
});


