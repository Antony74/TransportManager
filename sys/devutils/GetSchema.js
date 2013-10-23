var fs = require('fs');
var win32ole = require('../server/node_modules/win32ole');
var platform = require('../server/usingMSJet4.js');
var jet = platform.jet;

var arrPrimaryKeys = [];
var arrIndices = [];

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

    db.Close();

    return sSql;
}

function getIndices(sFilename)
{
    var db = jet.openAccessDatabase(sFilename);
    var TablesSchema = db.OpenSchema(jet.adSchemaIndexes);
    while (TablesSchema.EOF == false)
    {
        var sIndexName = String(TablesSchema.Fields("INDEX_NAME").Value);
        var sTableName = String(TablesSchema.Fields("TABLE_NAME").Value);
        var sColumnName = String(TablesSchema.Fields("COLUMN_NAME").Value);
        var nNulls = parseInt(TablesSchema.Fields("NULLS").Value);
        var nUnique = parseInt(TablesSchema.Fields("UNIQUE").Value);

        if (sIndexName == "PrimaryKey")
        {
            arrPrimaryKeys[sTableName] = sColumnName;
        }
        else
        {
            if (typeof arrIndices[sTableName] == "undefined")
            {
                arrIndices[sTableName] = [];
            }

            var sSql;

            if (nUnique)
            {
                sSql = "CREATE UNIQUE INDEX ";
            }
            else
            {
                sSql = "CREATE INDEX ";
            }

            sSql += sIndexName + " ON " + sTableName + "(" + sColumnName + ")";

            if (!nNulls)
            {
                sSql += " WITH DISALLOW NULL";
            }
            sSql += ";";

            arrIndices[sTableName].push(sSql);
        }            
        
        TablesSchema.MoveNext();
    }

    db.Close();
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

    db.Close();

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
        var sFieldname = String(fld.Name);
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

        if (arrPrimaryKeys[sTablename] == sFieldname)
        {
            typeInfo = "AUTOINCREMENT(1,1) NOT NULL PRIMARY KEY";
        }

        arrFields.push("    " + sFieldname + " " + typeInfo);
    }

    sSql += arrFields.join(",\r\n");
    sSql += ");";
    var sIndices = arrIndices[sTablename].join("\r\n");
    if (sIndices.length)
    {
        sSql += "\r\n\r\n";
        sSql += sIndices;
    }
    sSql += "\r\n\r\n";

    rs.Close();

    return sSql;
}

var sFilenameExisting = "./TransportManager.mdb";
var sFilenameSql = "../TransportManager.sql";
var sFilenameClone = "../../TransportManager.mdb"

getIndices(sFilenameExisting);

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

