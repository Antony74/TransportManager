
if (typeof process == 'undefined' || process.versions == 'undefined' || process.versions.node == 'undefined')
{
    var usage = 'Sorry, Transport Manager can currently only be run on Windows and using ';
    usage +=    'a 32-bit build of Node.js, are you trying to use a different ';
    usage +=    'JavaScript engine?';

    if      (typeof console != 'undefined') (function(){console.log(usage); })();
    else if (typeof alert   != 'undefined') (function(){alert(usage);       })();
    else if (typeof WScript != 'undefined') (function(){WScript.echo(usage);})();
}
else (function() {

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
    return;
}

var http = require('http');
var url = require('url');
var static = require('node-static');
var platform = require("./UsingMSJet4.js");
var parser = require("./SelectStatementParser.js");
var server = null;
var port = 8080;
var sServerUrl = "http://localhost:" + port + "/";
var bServerIsRunning = false;

process.stdout.write("\r\n");
process.stdout.write("    T R A N S P O R T   M A N A G E R\r\n");
process.stdout.write("\r\n");

platform.ensureShortcutExists();

var staticServer = new static.Server(__dirname + "/../htdocs");

function handleRequest(request, response)
{
    var parsed = url.parse(request.url, true);
    if (parsed.pathname == "/selectSql")
    {
        var sQuery = parsed.query.query;
        var nStart = parseInt(parsed.query.start, 10);
        if (Number.isNaN(nStart))
        {
            nStart = 0;
        }

        response.setHeader("Content-Type", "application/json");

        var bParsedOK = false;

        try
        {
            parser.parse(sQuery.toLowerCase());
            bParsedOK = true;
        }
        catch(e)
        {
            var oError = {"Error": e.toString()};
            response.write(JSON.stringify(oError, null, 4));
        }

        if (bParsedOK)
        {
            var oOutput = platform.selectSql(sQuery, nStart);
            response.write(JSON.stringify(oOutput, null, 4));
        }

    }
    else if (parsed.pathname == "/quitTransportManager")
    {
        process.stdout.write("Quitting\r\n");
        response.end("OK");
        request.connection.end();     //close the socket
        request.connection.destroy(); //close it really
        server.close();
        return;
    }
    else
    {
        request.addListener('end', function () {
            staticServer.serve(request, response);
        }).resume();
        return;
    }

    response.end();
    request.connection.end();   //close the socket
    request.connection.destroy; //close it really
}

server = http.createServer(handleRequest);

server.on("listening", function()
{
    bServerIsRunning = true;
    process.stdout.write("Server has been started (" + sServerUrl + ")\r\n");
    platform.ensureDatabaseIsReady(function()
    {
        process.argv.forEach(function(sParam)
        {
            if (sParam.substring(0,1) == "-")
            {
                onServerCommand(sParam.substring(1));
            }
        });
    });
});

server.on("error", function(e)
{
    if (e.code == 'EADDRINUSE')
    {
        process.stdout.write('Port ' + port + ' is already in use\r\n');
        process.stdout.write("\r\n");
        process.stdout.write("This usually happens because another instance of the server is already\r\n");
        process.stdout.write("running on this computer.\r\n");

        process.on('exit', function() { process.exit(1); });
    }
    else
    {
        throw e;
    }
 });

server.listen(port, 'localhost');


})();

