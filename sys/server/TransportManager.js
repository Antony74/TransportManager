
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
var schema = require("./Schema.js");
var server = null;
var port = 8080;
var sServerUrl = "http://localhost:" + port + "/";
var bServerIsRunning = false;

console.log("");
console.log("    T R A N S P O R T   M A N A G E R");
console.log("");

platform.ensureShortcutExists();

var staticServer = new static.Server(__dirname + "/../htdocs");

function handleRequest(request, response)
{
    var parsed = url.parse(request.url, true);
    if (parsed.pathname == "/selectSql")
    {
//        response.write(JSON.stringify(parsed));
        var sTable = parsed.query.table;
        var nStart = parseInt(parsed.query.start, 10);
        if (Number.isNaN(nStart))
        {
            nStart = 0;
        }
        
        if (schema.isValidTable(sTable))
        {
            var oOutput = platform.selectSql(sTable, nStart);
            response.write(JSON.stringify(oOutput));
        }
        else
        {
            var oError = {"Error": "Table name " + sTable + " not recognised"};
            response.write(JSON.stringify(oError));
        }
    }
    else if (parsed.pathname == "/quitTransportManager")
    {
        console.log("Quitting");
        response.end("OK");
        request.connection.end();   //close the socket
        request.connection.destroy; //close it really
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
    console.log("Server has been started (" + sServerUrl + ")");
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
        console.log('Port ' + port + ' is already in use');

        platform.tasklist(function(sText, arrPIDS)
        {
            if (arrPIDS.length > 0)
            {
                console.log("This usually happens because another instance of the server is already");
                console.log("running on this computer.");
                console.log("");
                console.log(sText);
                console.log("");
            }
        });
    }
    else
    {
        throw e;
    }
 });

server.listen(port, 'localhost');


})();

