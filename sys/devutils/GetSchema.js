var fs = require('fs');
var win32ole = require('../server/node_modules/win32ole');

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
var adInteger  = 3;
var adDate     = 7;
var adBoolean  = 11;
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

function getSchema(sFilename)
{
    var sSql = "";
    
    var db = openAccessDatabase(sFilename);

    var TablesSchema = db.OpenSchema(adSchemaTables);
    while (TablesSchema.EOF == false)
    {
        var sTablename = String(TablesSchema.Fields("TABLE_NAME").Value);
        var sTableType = String(TablesSchema.Fields("TABLE_TYPE").Value);

        if (sTableType == "TABLE")
        {
            sSql += getTable(db, sTablename);
        }

        TablesSchema.MoveNext();
    }

    return sSql;
}

function getTransportManagerSchema(sFilename)
{
    var sSql = "";
    
    var db = openAccessDatabase(sFilename);
    sSql += getTable(db, "Clients");
    sSql += getTable(db, "Destinations");
    sSql += getTable(db, "DestinationType");
    sSql += getTable(db, "DriverExclusionList");
    sSql += getTable(db, "Drivers");
    sSql += getTable(db, "DriverVacation");
    sSql += getTable(db, "JobLog");
    sSql += getTable(db, "Jobs");

    return sSql;
}

function getTable(db, sTablename)
{
    var sSql = "";

    var rs = createRecordset();
    rs.Open(sTablename, db, adOpenStatic, adLockReadOnly, adCmdTableDirect);

    sSql += "\r\n";
    sSql += "CREATE TABLE " + sTablename + "(\r\n";

    var arrFields = [];

    for (var nField = 0; nField < rs.Fields.Count; ++nField)
    {
        var fld = rs.Fields(nField);
        var typeInfo = parseInt(fld.Type);

        switch (typeInfo)
        {
        case adInteger:
            typeInfo = "INTEGER";
            break;

        case adBoolean:
            typeInfo = "YESNO";
            break;

        case adVarWChar:
            typeInfo = "TEXT(" + fld.DefinedSize + ")";
            break;

        case adLongVarWChar:
            typeInfo = "MEMO";
            break;

        case adDate:
            typeInfo = "DATE";
            break;
        }

        arrFields.push("    " + fld.Name + " " + typeInfo);
    }

    sSql += arrFields.join(",\r\n");
    sSql += ");";
    sSql += "\r\n";

    rs.Close();

    return sSql;
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

function createEmptyClone(sFilenameExisting, sFilenameClone, sFilenameEmpty, sFilenameSql, doneCloning)
{
//    var sSql = getSchema(sFilenameExisting);
    var sSql = getTransportManagerSchema(sFilenameExisting);

    fs.writeFile(sFilenameSql, sSql);
    
    // Ensure database doesn't already exist
    if (fs.existsSync(sFilenameClone))
    {
        fs.unlinkSync(sFilenameClone);
    }

    // Copy empty database
    copyFile(sFilenameEmpty, sFilenameClone, function()
    {
        // Run the SQL on the empty database
        var x = 0;
        var db = openAccessDatabase(sFilenameClone);

        arrSql = sSql.split(";");
        for (var n = 0; n < arrSql.length - 1; ++n)
        {
            var statement = arrSql[n];
            db.Execute(statement);
        }
        
        db.Close();

        // Finally get the schema of the newly cloned database so we can check they're the same
        sSql = getTransportManagerSchema(sFilenameExisting);
        fs.writeFile(sFilenameSql + "2", sSql);

        doneCloning();
    });
}


createEmptyClone('./TransportManager.mdb',           // sFilenameExisting
                 '../../TransportManager.mdb',       // sFilenameClone
                 '../server/Blank2002Database.mdb',  // sFilenameEmpty
                 '../TransportManager.sql',          // sFilenameSql
                 function() { });                    // doneCloning()
