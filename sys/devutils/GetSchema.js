///<reference path='../interface/node.d.ts' />

var fs = require('fs');
var win32ole = require('../server/node_modules/win32ole');
var platform = require('../server/usingMSJet4.js');
var jet = platform.jet;
var schema = require('./Schema.js');
var dface = require('../server/node_modules/dface');

var arrPrimaryKeys = [];
var arrIndices = [];

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

    for (var sTable in schema.getTables())
    {
        sSql += getTable(db, sFilename, sTable);
    }

    db.Close();

    return sSql;
}

function getTable(db, sDatabaseFilename, sTablename)
{
    var sSql = "";

    var oResult = dface.selectSql(
    {
        'databaseFilename'      : sDatabaseFilename,
        'numberOfRecordsToGet'  : 1,
        'query'                 : 'select * from ' + sTablename,
        'startRecord'           : 0,
        'schemaLevel'           : 2
    });

    var rs = jet.createRecordset();
    rs.Open(sTablename, db, jet.adOpenStatic, jet.adLockReadOnly, jet.adCmdTableDirect);

    sSql += "\r\n";
    sSql += "CREATE TABLE " + sTablename + "(\r\n";

    var arrFields = [];

    for (var nField = 0; nField < oResult.fields.length; ++nField)
    {
        var fld = oResult.fields[nField];
        var sFieldname = fld.name;
        var typeInfo = fld.Type;

        if (typeInfo == "TEXT")
        {
            typeInfo = "TEXT(" + fld.DefinedSize + ")";
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

var bExists = fs.existsSync(sFilenameExisting);

if (bExists)
{
    getIndices(sFilenameExisting);

    var sSql = getTransportManagerSchema(sFilenameExisting);

    fs.writeFile(sFilenameSql, sSql);

    // If the main database is present, get its schema too so we can check they're the same
    bExists = fs.existsSync(sFilenameClone)

    if (bExists)
    {
        sSql = getTransportManagerSchema(sFilenameClone);
        fs.writeFile(sFilenameSql + "2", sSql);
    }
}
else
{
    console.log("File " + sFilenameExisting + " was not found");
}


