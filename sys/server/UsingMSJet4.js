var fs = require('fs');
var win32ole = require('win32ole');

var sDatabaseFilename = __dirname + "/../../TransportManager.mdb";

// Define the ADO constants that we need

// SchemaEnumConstants
var adSchemaIndexes = 12;
var adSchemaTables = 20;

// CursorTypeEnum constants
var adOpenStatic = 3;
var adOpenKeyset = 1;

// LockTypeEnum constants
var adLockReadOnly = 1;
var adLockOptimistic = 3;

// CommandTypeEnum constants
var adCmdTable = 2;
var adCmdTableDirect = 512;

// DataTypeEnum constants
var adInteger = 3;
var adDate = 7;
var adBoolean = 11;
var adVarWChar = 202;
var adLongVarWChar = 203;

// BookmarkEnum
var adBookmarkCurrent = 0;
var adBookmarkFirst = 1;
var adBookmarkLast = 2;

function openAccessDatabase(sFilename)
{
    var db = win32ole.client.Dispatch('ADODB.Connection');
    db.Provider = "Microsoft.Jet.OLEDB.4.0";
    db.Open(sFilename);
    return db;
}

function createRecordset()
{
    return win32ole.client.Dispatch('ADODB.Recordset');
}


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

        // Run the SQL on the empty database
        var db = openAccessDatabase(sDatabaseFilename);

        arrSql = String(sSql).split(";");
        for (var n = 0; n < arrSql.length - 1; ++n)
        {
            var statement = arrSql[n].trimLeft();
            if (statement.charAt(0) != "#")
            {
                db.Execute(statement);
            }
        }

        db.Close();
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

function selectSql(sTable, nStart)
{
    var arr = [];
    var db = openAccessDatabase(sDatabaseFilename);
    var rs = createRecordset();
    
    rs.Open(sTable, db, adOpenStatic);

    var nRecordCount = nStart < rs.RecordCount;

    if (nRecordCount == -1)
    {
        console.log("Problem getting RecordCount");
    }
    else if (nStart < nRecordCount)
    {
        rs.Move(nStart, adBookmarkFirst);
        
        var nRecords = 20;
        
        while(rs.EOF == false && nRecords > 0)
        {
            var oRecord = {};

            for (var nField = 0; nField < rs.Fields.Count; ++nField)
            {
                oRecord[rs.Fields(nField).Name.toString()] = rs.Fields(nField).Value.toString();
            }
            
            arr.push(oRecord);

            --nRecords;
            rs.MoveNext();
        }
    }
        
    rs.close();
    db.close();
    return arr;
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
    var sBatchFile = __dirname + "/TransportManager.bat";
    fs.exists(sBatchFile, function(bExists)
    {
        if (bExists == false)
        {
            fs.writeFile(sBatchFile, 'powershell -ExecutionPolicy unrestricted ../wintaskbar/TransportManager.ps1 -serverExe "' + process.execPath + '" -serverArgument "' + __dirname + '\\TransportManager.js"');
        }
    });

    var sShortcutFile = __dirname + "/../../TransportManager.url";
    fs.exists(sShortcutFile, function(bExists)
    {
        if (bExists == false)
        {
            fs.writeFile(sShortcutFile, "[InternetShortcut]\r\n"
                                      + "URL=file://" + __dirname + "\\TransportManager.bat\r\n"
                                      + "WorkingDir=" + __dirname + "\r\n"
                                      + "IconFile=" + __dirname + "\\..\\htdocs\\icons\\Car.ico\r\n"
                                      + "IconIndex=0\r\n");
        }
    });
}

//
// Main exports
//

exports.ensureShortcutExists = ensureShortcutExists;
exports.ensureDatabaseIsReady = ensureDatabaseIsReady;
exports.selectSql = selectSql;

//
// Also export a bunch of JET stuff for the devutils scripts to use
//

exports.jet = function() { }

exports.jet.openAccessDatabase = openAccessDatabase;
exports.jet.createRecordset = createRecordset;

exports.jet.sDatabaseFilename = sDatabaseFilename;

// SchemaEnumConstants
exports.jet.adSchemaIndexes = adSchemaIndexes;
exports.jet.adSchemaTables = adSchemaTables;

// CursorTypeEnum constants
exports.jet.adOpenStatic = adOpenStatic;
exports.jet.adOpenKeyset = adOpenKeyset;

// LockTypeEnum constants
exports.jet.adLockReadOnly = adLockReadOnly;
exports.jet.adLockOptimistic = adLockOptimistic;

// CommandTypeEnum constants
exports.jet.adCmdTable = adCmdTable;
exports.jet.adCmdTableDirect = adCmdTableDirect;

// DataTypeEnum constants
exports.jet.adInteger = adInteger;
exports.jet.adDate = adDate;
exports.jet.adBoolean = adBoolean;
exports.jet.adVarWChar = adVarWChar;
exports.jet.adLongVarWChar = adLongVarWChar;
