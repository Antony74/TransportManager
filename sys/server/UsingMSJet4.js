///<reference path='../interface/node.d.ts' />

var fs = require('fs');
var dface = require('dface');

var sDatabaseFilename = __dirname + "/../../TransportManager.mdb";

function copyFile(source, target, doneCopying)
{
    var streamIn = fs.createReadStream(source);
    streamIn.on("error", function(err)
    {
        console.log(err);
    });

    var streamOut = fs.createWriteStream(target);
    streamOut.on("error", function(err)
    {
        console.log(err);
    });

    streamOut.on("close", function(ex)
    {
        doneCopying();
    });

    streamIn.pipe(streamOut);
}

function runSQL(sFilenameSql, doneRunning)
{
    console.log("Running " + sFilenameSql);

    // Load the SQL
    fs.readFile(sFilenameSql, function(err, sSql)
    {
        if (err) throw err;

        var arrSql1 = String(sSql).split(";");
        var arrSql2 = [];

        for (var n = 0; n < arrSql1.length - 1; ++n)
        {
            var statement = arrSql1[n].trim();
            if (statement.charAt(0) != "#")
            {
                arrSql2.push(statement);
            }
        }

        dface.runSql(sDatabaseFilename, arrSql2);

        doneRunning();
    });
}

function ensureDatabaseIsReady(doneEnsuring)
{
    var sFilenameEmpty = __dirname + "/Blank2002Database.mdb";
    var sFilenameSql = __dirname + "../../TransportManager.sql";

    fs.exists(sDatabaseFilename, function(bExists)
    {
        if (bExists)
        {
            console.log("Database ready");
            doneEnsuring();
        }
        else
        {
            console.log("Database not found... creating empty database");

            // Copy empty database
            copyFile(sFilenameEmpty, sDatabaseFilename, function()
            {
                runSQL(sFilenameSql, function()
                {
                    console.log("Database ready");
                    doneEnsuring();
                });
            });
        }
    });
}

function selectSql(obj)
{
    obj.databaseFilename = sDatabaseFilename;
    obj.numberOfRecordsToGet = 20;

    var result = dface.selectSql(obj);

    if (typeof result.error == 'string')
    {
        console.log('Error getting data from database: ' + result.error);
    }

    return result;
}

//
// And that should be all the JET database related stuff above, now for some 
// utility functions which are Windows specific.
//

function ensureShortcutExists()
{
    // Ensure we have a shortcut to make it easier to run this program.  Obviously
    // it's annoying having to run once without a shortcut, but it has to contain
    // an absolute path which we can't know in advance.  Also it can't contain
    // a parameter so we go via a batch file.  Unfortunately this is the best I can
    // do right now.

    var sBatchFile =  __dirname + "/TransportManager.bat";
    var sScript = '';
    sScript += '@echo off\r\n';
    sScript += '"' + process.execPath + '" "' + __dirname + '\\TransportManagerInWindowsSysTray.js"\r\n';
    fs.writeFile(sBatchFile, sScript);

    var sShortcutFile = __dirname + "/../../TransportManager.url";
    fs.writeFile(sShortcutFile, "[InternetShortcut]\r\n"
                              + "URL=file://" + __dirname + "\\TransportManager.bat\r\n"
                              + "WorkingDir=" + __dirname + "\r\n"
                              + "IconFile=" + __dirname + "\\..\\htdocs\\icons\\Car.ico\r\n"
                              + "IconIndex=0\r\n");
}

//
// Main exports
//

exports.ensureShortcutExists = ensureShortcutExists;
exports.ensureDatabaseIsReady = ensureDatabaseIsReady;
exports.selectSql = selectSql;

