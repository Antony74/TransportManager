
var spawn = require('child_process').spawn;

require('winsystraywrapper').run(
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
                        'function' : this.showLog
                    },
                    {
                        'caption'  : 'Stop',
                        'function' : this.stop
                    }
                  ]
});


