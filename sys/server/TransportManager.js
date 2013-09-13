
var fs = require("fs");
var http = require('http');
var static = require('node-static');
var platform = require("./UsingMSJet4.js");
var log = require("./Log.js");
var port = 1789;

// Ensure we have a shortcut to make it easier to run this program.  Obviously
// it's annoying having to run once without a shortcut, but it has to contain
// an absolute path which we can't know in advance.  Also it can't contain
// a parameter so we go via a batch file.  Unfortunately his is the best I can
// do right now.
var sShortcutFile = __dirname + "/../../TransportManager.url";
fs.exists(sShortcutFile, function(bExists)
{
    if (bExists == false)
    {
        fs.writeFile(sShortcutFile, "[InternetShortcut]\r\n"
                                  + "URL=file://" + __dirname + "\\TransportManager.bat\r\n"
                                  + "WorkingDir=" + __dirname + "\r\n");
    }
});

var staticServer = new static.Server(__dirname + "/../htdocs");

function handleRequest(req, res)
{
    log.write(req.url);
    staticServer.serve(req, res);
}

platform.ensureDatabaseExists(function()
{
    http.createServer(handleRequest).listen(port, '127.0.0.1');
    log.write("Server is running http://localhost:" + port);
});

