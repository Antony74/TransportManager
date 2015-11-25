///<reference path='../interface/node.d.ts' />

var fs = require('fs');
var dface = require('dface');

var sDatabaseFilename = __dirname + '/../../TransportManager.mdb';

function copyFile(source, target, doneCopying)
{
    var streamIn = fs.createReadStream(source);
    streamIn.on('error', function(err)
    {
        console.log(err);
    });

    var streamOut = fs.createWriteStream(target);
    streamOut.on('error', function(err)
    {
        console.log(err);
    });

    streamOut.on('close', function(ex)
    {
        doneCopying();
    });

    streamIn.pipe(streamOut);
}

function runSQL(sFilenameSql)
{
    console.log('Running ' + sFilenameSql);

    // Load the SQL
    var sSql = fs.readFileSync(sFilenameSql);

    // Strip line comments
    var arrLines = String(sSql).split("\n");
    sSql = "";

    for (var n = 0; n < arrLines.length; ++n)
    {
        var sLine = arrLines[n].trim();
        if (sLine.charAt(0) != '#')
        {
            sSql += sLine;
        }
    }

    // Split into statements
    var arrSql1 = String(sSql).split(';');
    var arrSql2 = [];

    // Remove empty statements
    for (var n = 0; n < arrSql1.length; ++n)
    {
        var sStatement = arrSql1[n].trim();
        
        if (sStatement.length)
        {
            arrSql2.push(sStatement);
        }
    }

    // Run them
    dface.runSql(sDatabaseFilename, arrSql2);
}

function ensureDatabaseIsReady(doneEnsuring)
{
    var sFilenameEmpty = __dirname + '/Blank2002Database.mdb';
    var sFilenameSql = __dirname + '../../TransportManager.sql';

    fs.exists(sDatabaseFilename, function(bExists)
    {
        if (bExists)
        {
            ensureDatabaseIsUpgraded(doneEnsuring);
        }
        else
        {
            console.log('Database not found... creating empty database');

            // Copy empty database
            copyFile(sFilenameEmpty, sDatabaseFilename, function()
            {
                ensureDatabaseIsUpgraded(doneEnsuring);
            });
        }
    });
}

function ensureDatabaseIsUpgraded(doneEnsuring)
{
    var oIndices = dface.getIndices(sDatabaseFilename);

    if (typeof oIndices.records == 'undefined')
    {
        console.log('Error getting information from database: ' + oIndices.Error);
        doneEnsuring(false);
        return;
    }

    var nUpgradeLevel = 0;

    for (var nRecord in oIndices.records)
    {
        var oRecord = oIndices.records[nRecord];
    
        if (oRecord.TABLE_NAME == 'Clients')
        {
            nUpgradeLevel = Math.max(1, nUpgradeLevel);
        }
        else if (oRecord.TABLE_NAME == 'ClientsEx')
        {
            nUpgradeLevel = Math.max(2, nUpgradeLevel);
        }
    }

    if (nUpgradeLevel > 0 && nUpgradeLevel < 1)
    {
        console.log('Upgrading database');
    }

    switch(nUpgradeLevel)
    {
    case 0:
        runSQL(__dirname + '../../TransportManager.sql');
        // Drop through!!1!
    case 1:
        runSQL(__dirname + '../../TransportManagerUpgrade1.sql');
        // Drop through!!1!
    }

    console.log('Database ready');
    doneEnsuring(true);
}

function selectSql(obj)
{
    obj.databaseFilename = sDatabaseFilename;
    obj.numberOfRecordsToGet = 2000;

    var result = dface.selectSql(obj);

    if (typeof result.error == 'string')
    {
        console.log('Error getting data from database: ' + result.error);
    }

    return result;
}

function getIndices()
{
    var result = dface.getIndices(sDatabaseFilename);
    return result;
}

function updateDatabase(obj)
{
    var result = dface.updateDatabase(sDatabaseFilename, obj);

    if (typeof result.Error == 'string')
    {
        console.log('Error updating database: ' + result.Error);
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

    var sBatchFile =  __dirname + '/TransportManager.bat';
    var sScript = '';
    sScript += '@echo off\r\n';
    sScript += '"' + process.execPath + '" "' + __dirname + '\\TransportManagerInWindowsSysTray.js"\r\n';
    fs.writeFile(sBatchFile, sScript);

    var sShortcutFile = __dirname + '/../../TransportManager.url';
    fs.writeFile(sShortcutFile, '[InternetShortcut]\r\n'
                              + 'URL=file://' + __dirname + '\\TransportManager.bat\r\n'
                              + 'WorkingDir=' + __dirname + '\r\n'
                              + 'IconFile=' + __dirname + '\\..\\htdocs\\icons\\Car.ico\r\n'
                              + 'IconIndex=0\r\n');
}

//
// Exports
//

exports.ensureShortcutExists = ensureShortcutExists;
exports.ensureDatabaseIsReady = ensureDatabaseIsReady;
exports.selectSql = selectSql;
exports.getIndices = getIndices;
exports.updateDatabase = updateDatabase;

