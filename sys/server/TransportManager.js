
var http = require('http');
var static = require('node-static');
var platform = require("./UsingMSJet4.js");
var log = require("./Log.js");
var port = 1789;

platform.ensureShortcutExists();

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

