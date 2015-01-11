///<reference path='../interface/node.d.ts' />

var fs = require('fs');
var schema = require('./Schema.js');
var dface = require('../server/node_modules/dface');

var arrPrimaryKeys = [];
var arrIndices = [];

var sFilenameExisting = __dirname + "/TransportManager.mdb";
var sFilenameSql = __dirname + "/../TransportManager.sql";
var sFilenameClone = __dirname + "/../../TransportManager.mdb"

var bExists = fs.existsSync(sFilenameExisting);

if (bExists)
{
    var oIndices = dface.getIndices(sFilenameExisting);

    var sSql = getTransportManagerSchema(sFilenameExisting, oIndices);

    fs.writeFile(sFilenameSql, sSql);

    // If the main database is present, get its schema too so we can check they're the same
    bExists = fs.existsSync(sFilenameClone)

    if (bExists)
    {
        sSql = getTransportManagerSchema(sFilenameClone, oIndices);
        fs.writeFile(sFilenameSql + "2", sSql);
    }
}
else
{
    console.log("File " + sFilenameExisting + " was not found");
}

function getTransportManagerSchema(sFilename, oIndices)
{
    var sSql = "";

    for (var sTable in schema.getTables())
    {
        sSql += getTable(sFilename, sTable, oIndices);
    }

    return sSql;
}

function getTable(sDatabaseFilename, sTablename, oIndices)
{
    var sSql = "";

    var sPrimaryKey = "";

    for (var nRecord in oIndices.records)
    {
        var oRecord = oIndices.records[nRecord];
        if (oRecord.TABLE_NAME == sTablename && oRecord.INDEX_NAME == "PrimaryKey")
        {
            sPrimaryKey = oRecord.COLUMN_NAME;
        }
    }

    var oResult = dface.selectSql(
    {
        'databaseFilename'      : sDatabaseFilename,
        'numberOfRecordsToGet'  : 1,
        'query'                 : 'select * from ' + sTablename,
        'startRecord'           : 0,
        'schemaLevel'           : 2
    });

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

        if (sPrimaryKey == sFieldname)
        {
            typeInfo = "AUTOINCREMENT(1,1) NOT NULL PRIMARY KEY";
        }

        arrFields.push("    " + sFieldname + " " + typeInfo);
    }

    sSql += arrFields.join(",\r\n");
    sSql += ");";

    var arrIndices = [];

    for (var nRecord in oIndices.records)
    {
        var oRecord = oIndices.records[nRecord];
        if (oRecord.TABLE_NAME == sTablename && oRecord.INDEX_NAME != "PrimaryKey")
        {
            var sIndexName = oRecord.INDEX_NAME;
            var sColumnName = oRecord.COLUMN_NAME;
            var nNulls = oRecord.NULLS;
            var nUnique = oRecord.UNIQUE;
            
            var sIndex = "";

            if (nUnique)
            {
                sIndex += "CREATE UNIQUE INDEX ";
            }
            else
            {
                sIndex += "CREATE INDEX ";
            }

            sIndex += sIndexName + " ON " + sTablename + "(" + sColumnName + ")";

            if (!nNulls)
            {
                sIndex += " WITH DISALLOW NULL";
            }
            sIndex += ";";
            
            arrIndices.push(sIndex);
        }
    }
    
    var sIndices = arrIndices.join("\r\n");

    if (sIndices.length)
    {
        sSql += "\r\n\r\n";
        sSql += sIndices;
    }

    sSql += "\r\n\r\n";

    return sSql;
}

