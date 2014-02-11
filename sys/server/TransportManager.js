
var http = require('http');
var url = require('url');
var static = require('node-static');
var platform = require("./UsingMSJet4.js");
var schema = require("./Schema.js");
var server = null;
var port = 8080;
var sServerUrl = "http://localhost:" + port + "/";
var bServerIsRunning = false;
var arrOtherInstancePIDS = [];

console.log("");
console.log("    T R A N S P O R T   M A N A G E R");
console.log("");

platform.ensureShortcutExists();

var readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

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
        response.end();
    }
    else
    {
        staticServer.serve(request, response);
    }
}

server = http.createServer(handleRequest);

server.on("listening", function()
{
    bServerIsRunning = true;
    console.log("Server has been started (" + sServerUrl + ")");
    platform.ensureDatabaseIsReady(function()
    {
        promptForCommand();
    });
});

server.on("error", function(e)
{
    if (e.code == 'EADDRINUSE')
    {
        console.log('Port ' + port + ' is already in use');
        promptForCommand();
    }
    else
    {
        throw e;
    }
 });

server.listen(port, 'localhost');

function promptForCommand()
{
    console.log("");
    if (bServerIsRunning)
    {
        promptForCommand2();
    }
    else
    {
        platform.tasklist(function(sText, arrPIDS)
        {
            console.log("THIS SERVER IS NOT RUNNING");
            console.log("");
            
            arrOtherInstancePIDS = arrPIDS;

            if (arrPIDS.length > 0)
            {
                console.log("This usually happens because another instance of the server is already");
                console.log("running on this computer.");
                console.log("");
                console.log(sText);
                console.log("");
                console.log("Use the Q command to quit from a spare instance of the Transport Manager.");

                if (arrPIDS.length == 1)
                {
                    console.log("If the other instance has stopped responding it can be killed");
                    console.log("with the 'K' command or Task Manager.");
                }
                else
                {
                    console.log("If the other instances have stopped responding they can be killed");
                    console.log("with the 'K' command or Task Manager.");
                }
                
                console.log("");
            }

            console.log("If you're not sure what to do, please try rebooting.");
            console.log("");

            promptForCommand2();
        });
    }
}

function promptForCommand2()
{
    console.log("Available commands:");
    console.log("W - Launch a web-browser (" + sServerUrl + ")");

    if (bServerIsRunning == false)
    {
        console.log("K - Kill another instance of the server which has stopped responding");
        console.log("R - Try running the server again");
    }
        
    console.log("Q - Quit");
    console.log("");
    readline.question(">", onServerCommand);
}

function onServerCommand(sCmd)
{
    console.log("");
    
    switch(sCmd.toUpperCase())
    {
    case "Q":
        console.log("Quiting");
        readline.close();
        if (bServerIsRunning)
        {
            server.close();
        }
        return;

    case "W":
        console.log("Launching web-browser (" + sServerUrl + ")");
        platform.launchWebbrowser(sServerUrl);
        break;

    case "K":
        if (bServerIsRunning == false)
        {
            platform.taskkill(arrOtherInstancePIDS, function()
            {
                server.listen(port, 'localhost');
            });
            return;
        }
        break;

    case "R":
        if (bServerIsRunning == false)
        {
            server.listen(port, 'localhost');
            return;
        }
        break;

    case "":
        // No action required
        break;

    default:
        console.log("Command '" + sCmd + "' not recognised");
    }

    promptForCommand();
}

