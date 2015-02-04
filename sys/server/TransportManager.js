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
        var nStartRecord = parseInt(parsed.query.startRecord, 10);
        var nSchemaLevel = parseInt(parsed.query.schemaLevel, 10);

        if (isNaN(nStartRecord))
        {
            nStartRecord = 0;
        }

        if (isNaN(nSchemaLevel))
        {
            nSchemaLevel = 0;
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
            var oOutput = platform.selectSql(
            {
                'query'       : sQuery,
                'startRecord' : nStartRecord,
                'schemaLevel' : nSchemaLevel
            });
            
            response.write(JSON.stringify(oOutput, null, 4));
        }

        response.end();
        request.connection.end();     //close the socket
        request.connection.destroy(); //close it really
    }
    else if (parsed.pathname == "/updateDatabase")
    {
        var sPostedData = '';

        request.on('data', function(data)
        {
            sPostedData += data;
        });

        request.on('end', function()
        {
            var oPostedData = {};
            var bParsedOK = true;

            try
            {
                oPostedData = JSON.parse(sPostedData);
            }
            catch(e)
            {
                var oError = {"Error": e.toString()};
                response.write(JSON.stringify(oError, null, 4));
                bParsedOK = false;
            }

            if (bParsedOK)
            {
                response.write('{"OK":true}');
                console.log(require('util').inspect(oPostedData, {depth: null}));
            }

            response.end();
            request.connection.end();     //close the socket
            request.connection.destroy(); //close it really
        });
    }
    else if (parsed.pathname == "/quitTransportManager")
    {
        process.stdout.write("Quitting\r\n");
        response.end("OK");
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
                switch(sParam.substring(1).toUpperCase())
                {
                case "Q":
                    console.log("Quiting");
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

server.on("error", function(e)
{
    if (e.code == 'EADDRINUSE')
    {
        process.stdout.write('Port ' + port + ' is already in use\r\n');
        process.stdout.write("\r\n");
        process.stdout.write("This usually happens because another instance of the server is already\r\n");
        process.stdout.write("running on this computer.\r\n");

        ec.setExitCode(ec.PORT_IN_USE);
    }
    else
    {
        throw e;
    }
 });

server.listen(port, 'localhost');


})();

