var fs = require('fs');
var win32ole = require('../server/node_modules/win32ole');
var platform = require('../server/usingMSJet4.js');
var jet = platform.jet;

function getSchema(sFilename)
{
    var sSql = "";

    var db = jet.openAccessDatabase(sFilename);

    var TablesSchema = db.OpenSchema(jet.adSchemaTables);
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

    var db = jet.openAccessDatabase(sFilename);
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

    var rs = jet.createRecordset();
    rs.Open(sTablename, db, jet.adOpenStatic, jet.adLockReadOnly, jet.adCmdTableDirect);

    sSql += "\r\n";
    sSql += "CREATE TABLE " + sTablename + "(\r\n";

    var arrFields = [];

    for (var nField = 0; nField < rs.Fields.Count; ++nField)
    {
        var fld = rs.Fields(nField);
        var typeInfo = parseInt(fld.Type);

        switch (typeInfo)
        {
        case jet.adInteger:
            typeInfo = "INTEGER";
            break;

        case jet.adBoolean:
            typeInfo = "YESNO";
            break;

        case jet.adVarWChar:
            typeInfo = "TEXT(" + fld.DefinedSize + ")";
            break;

        case jet.adLongVarWChar:
            typeInfo = "MEMO";
            break;

        case jet.adDate:
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

var sFilenameExisting = "./TransportManager.mdb";
var sFilenameSql = "../TransportManager.sql";
var sFilenameClone = "../../TransportManager.mdb"

//var sSql = getSchema(sFilenameExisting);
var sSql = getTransportManagerSchema(sFilenameExisting);

fs.writeFile(sFilenameSql, sSql);

// If the main database is present, get it's schema too so we can check they're the same
fs.exists(sFilenameClone, function(bExists)
{
    if (bExists)
    {
        sSql = getTransportManagerSchema(sFilenameClone);
        fs.writeFile(sFilenameSql + "2", sSql);
    }
});

