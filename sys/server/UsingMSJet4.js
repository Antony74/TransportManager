
var fs = require('fs');
var win32ole = require('win32ole');

var sDatabaseFilename = __dirname + "/../../TransportManager.mdb";

// Define the ADO constants that we need

// SchemaEnumConstants
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

function ensureDatabaseExists(doneEnsuringDatabaseExists)
{
    var sFilenameEmpty = __dirname + "/Blank2002Database.mdb";
    var sFilenameSql = __dirname + "../../TransportManager.sql";

    fs.exists(sDatabaseFilename, function(bExists) {
        if (bExists) {
            console.log("Database ready");
            doneEnsuringDatabaseExists();
        }
        else {
            console.log("Database not found... creating empty database");

            // Copy empty database
            copyFile(sFilenameEmpty, sDatabaseFilename, function() {
                // Load the SQL
                fs.readFile(sFilenameSql, function(err, sSql) {
                    if (err) throw err;

                    // Run the SQL on the empty database
                    var db = openAccessDatabase(sDatabaseFilename);

                    arrSql = String(sSql).split(";");
                    for (var n = 0; n < arrSql.length - 1; ++n) {
                        var statement = arrSql[n];
                        db.Execute(statement);
                    }

                    db.Close();

                    console.log("Database ready");
                    doneEnsuringDatabaseExists();

                });
            });
        }
    });
}

function ensureShortcutExists()
{
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
}

//
// Main exports
//

exports.ensureShortcutExists = ensureShortcutExists;
exports.ensureDatabaseExists = ensureDatabaseExists;

//
// Also export a bunch of JET stuff for the GetSchema.js script to use
//

exports.jet = function() { }

exports.jet.openAccessDatabase = openAccessDatabase;
exports.jet.createRecordset = createRecordset;

// SchemaEnumConstants
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
