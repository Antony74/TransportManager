if (typeof process == 'undefined' || typeof process.versions == 'undefined' || typeof process.versions.electron == 'undefined') {

    var usage = 'Usage: npm start \n';
    usage +=    'This script is for electron, are you trying to use a different ';
    usage +=    'JavaScript engine?';

    if (typeof console != 'undefined') {
        (function() {
            console.log(usage);
        })();
    } else if (typeof alert   != 'undefined') {
        (function() {
            alert(usage);
        })();
    } else if (typeof WScript != 'undefined') {
        (function() {
            WScript.Echo(usage);
        })();
    }

} else (function() {

    var spawn = require('child_process').spawn;
    var http = require('http');
    var electron = require('electron');
    var app = electron.app;
    var Menu = electron.Menu;
    var Tray = electron.Tray;

    console.log(process.execPath);

    var transportManager = spawn('cmd.exe', ['/c', 'node', 'TransportManager.js']);

    transportManager.stdout.pipe(process.stdout);
    transportManager.stderr.pipe(process.stderr);

    transportManager.on('close', function() {
        process.exit();
    });

    app.on('ready', function() {
        var tray = new Tray('../htdocs/icons/car.ico');
        var contextMenu = Menu.buildFromTemplate([
            {
                label: 'Transport Manager',
                click: function() {
                    spawn('cmd.exe', ['/c', 'start', 'http://localhost:8080/']);
                }
            },
            {
                label: 'Server log'
            },
            {
                label: 'Exit',
                click: function() {

                    var request = http.request({host:'localhost', port:8080, path:'/quitTransportManager'});
                
                    request.on('error', function(e) {

                        console.log('problem with request: ' + e.message);
                        transportManager.kill();
                        process.exit();
                    });
                
                    request.end();

                    setInterval(function() {
                        transportManager.kill();
                        process.exit();
                    }, 5000);
                }
            }
        ]);
        tray.setToolTip('Transport Manager Reports');
        tray.setContextMenu(contextMenu);
    });

})();

