///<reference path='../interface/node.d.ts' />

if (typeof process == 'undefined' || typeof process.versions == 'undefined' || typeof process.versions.node == 'undefined')
{
    var usage = 'Sorry, Transport Manager can currently only be run on Windows and using ';
    usage +=    'a 32-bit build of Node.js, are you trying to use a different ';
    usage +=    'JavaScript engine?';

    if      (typeof console != 'undefined') (function(){console.log(usage); })();
    else if (typeof alert   != 'undefined') (function(){alert(usage);       })();
    else if (typeof WScript != 'undefined') (function(){WScript.Echo(usage);})();
}
else (function() {

var ec = require('./ErrorCodes.js');

if (process.arch != 'ia32' || process.platform != 'win32')
{
    console.log("");
    console.log("Sorry, Transport Manager can currently only be run on Windows and using");
    console.log("a 32-bit build of Node.js");
    console.log("");
    console.log("Expected: process.arch='ia32', process.platform='win32'");
    console.log("Found:    process.arch='" + process.arch + "', process.platform='" + process.platform + "'");
    console.log("");
    console.log("If you are using the Chocolately Package Manager, then the required install");
    console.log("and run commands respectively are:");
    console.log("");
    console.log("cinst nodejs-win32.commandline");
    console.log("node-win32 TransportManager.js");
    
    ec.setExitCode(ec.PLATFORM_ISSUE);
    
    return;
}

var http = require('http');
var url = require('url');
var fs = require('fs');
var static = require('node-static');
var platform = require('./UsingMSJet4.js');
var proxyGenerator = require('./GenerateProxyApiSourceCode.js');
var server = null;
var port = 8080;
var sServerUrl = 'http://localhost:' + port + '/';
var bServerIsRunning = false;

process.stdout.write('\r\n');
process.stdout.write('    T R A N S P O R T   M A N A G E R\r\n');
process.stdout.write('\r\n');

platform.ensureShortcutExists();

 // Load the core API, then generate the proxy API from it
 
var coreApi = require('./CoreApi');

var proxy = proxyGenerator.generateProxyApiSourceCode(
									coreApi,
									'createCoreApiProxy',
									sServerUrl,
									proxyGenerator.findCallback_LastArgument);

var sProxyApiSourceCode = "///<reference path='../interface/jquery.d.ts' />\n\n"
						+ proxy.sSourceCode;

// Done proxying the core API

var staticServer = new static.Server(__dirname + '/../htdocs');

function handleRequest(request, response)
{
    var parsedUrl = url.parse(request.url, true);

	if (proxy.fnAcceptUrl(parsedUrl))
	{
		proxy.fnHandleRequest(request, response);
	}
    else if (parsedUrl.pathname == '/quitTransportManager')
    {
        process.stdout.write('Quitting\r\n');
        response.end('OK');
        request.connection.end();     //close the socket
        request.connection.destroy(); //close it really
        server.close();
    }
    else
    {
        request.addListener('end', function()
        {
            staticServer.serve(request, response);
        }).resume();
    }
}

server = http.createServer(handleRequest);

server.on('listening', function()
{
    bServerIsRunning = true;
    process.stdout.write('Server has been started (' + sServerUrl + ')\r\n');
    platform.ensureDatabaseIsReady(function(bReady)
    {
        if (bReady == false)
        {
            if (bServerIsRunning)
            {
                server.close();
            }
            return;
        }
    
        process.argv.forEach(function(sParam)
        {
            if (sParam.substring(0,1) == '-')
            {
                switch(sParam.substring(1,2).toUpperCase())
                {
                case 'Q':
                    console.log('Quiting');
                    if (bServerIsRunning)
                    {
                        server.close();
                    }
                    return;
                }
            }
        });
    });
});

server.on('error', function(e)
{
    if (e.code == 'EADDRINUSE')
    {
        process.stdout.write('Port ' + port + ' is already in use\r\n');
        process.stdout.write('\r\n');
        process.stdout.write('This usually happens because another instance of the server is already\r\n');
        process.stdout.write('running on this computer.\r\n');

        ec.setExitCode(ec.PORT_IN_USE);
    }
    else
    {
        throw e;
    }
 });

 // Write the proxy API out to a file where the browser can request it
fs.writeFile(__dirname + '/../htdocs/proxyApi.js', sProxyApiSourceCode, null, function()
{
	// All done, we're ready to start the server
	server.listen(port, 'localhost');
});

})();

