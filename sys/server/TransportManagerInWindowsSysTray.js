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
    var path = require('path');
    var url = require('url');
    var electron = require('electron');
    var app = electron.app;
    var Menu = electron.Menu;
    var Tray = electron.Tray;
    var BrowserWindow = electron.BrowserWindow;

    var transportManager = spawn('cmd.exe', ['/c', 'node', 'TransportManager.js']);

    // Keep a global reference of the window object, if you don't, the window will
    // be closed automatically when the JavaScript object is garbage collected.
    var logWindow = null; // eslint-disable-line no-unused-vars

    app.on('ready', function() {

        var sIconPath = '../htdocs/icons/car.ico';

        //
        // Create server log window
        //

        logWindow = new BrowserWindow({
            width: 500,
            height: 300,
            frame: true,
            closable: false,
            icon: sIconPath,
            show: false,
            title: 'Server log'
        });

        logWindow.setMenu(null);

        logWindow.on('minimize', function() {
            logWindow.hide();
        });

        logWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'ServerLog.html'),
            protocol: 'file:',
            slashes: true
        }));

//        logWindow.toggleDevTools();

        transportManager.stdout.setEncoding('utf8');
        transportManager.stderr.setEncoding('utf8');
        exports.stdout = transportManager.stdout;
        exports.stderr = transportManager.stderr;

        //
        // close
        //
        function close() {
            try {
                transportManager.kill();
            } catch(e) {
            }

            try {
                logWindow.close();
            } catch(e) {
            }
    
            process.exit();
        }

        transportManager.on('close', close);

        //
        // Create tray icon and context menu
        //

        var tray = new Tray(sIconPath);
        var contextMenu = Menu.buildFromTemplate([
            {
                label: 'Transport Manager',
                click: function() {
                    spawn('cmd.exe', ['/c', 'start', 'http://localhost:8080/']);
                }
            },
            {
                label: 'Server log',
                click: function() {
                    logWindow.show();
                }
            },
            {
                label: 'Exit',
                click: function() {

                    var request = http.request({host:'localhost', port:8080, path:'/quitTransportManager'});
                
                    request.on('error', function(e) {

                        console.log('problem with request: ' + e.message);
                        close();
                    });
                
                    request.end();

                    setInterval(close, 5000);
                }
            }
        ]);
        tray.setToolTip('Transport Manager Reports');
        tray.setContextMenu(contextMenu);
    });

})();

