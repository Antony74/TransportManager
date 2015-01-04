///<reference path='../interface/node.d.ts' />

var dface = require('../server/node_modules/dface');
var oTables = require('./Schema.js').getTables();
var arrTables = [];

for (var sTablename in oTables)
{
    generateDialog(sTablename);
}

function generateDialog(sTablename)
{

    var options =
    {
        'query'                : 'select * from ' + sTablename,
        'startRecord'          : 0,
        'schemaLevel'          : 1,
        'databaseFilename'     : __dirname + '/../../TransportManager.mdb',
        'numberOfRecordsToGet' : 20
    };

    var json = dface.selectSql(options);

    var arrFields = json.fields;

    var sForm  = '<div id="dlg' + sTablename + '" title="' + sTablename + '">\r\n';
    sForm     += '    <form>\r\n';
    sForm     += '        <table width="100%">\r\n';


    for(var nFld in json.fields)
    {
        var sFieldname = arrFields[nFld].name;

        sForm += '            <tr>\r\n';
        sForm += '                <td>' + sFieldname + '</td>\r\n';
        sForm += '                <td><input type="Text" id="' + sTablename + '_' + sFieldname + '" style="width:95%"/></td>\r\n';
        sForm += '            </tr>\r\n';
    }
    sForm     += '        </table>\r\n';
    sForm     += '    </form>\r\n';
    sForm     += '</div>\r\n';

    console.log(sForm);
}

