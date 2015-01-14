///<reference path='../interface/node.d.ts' />

var fs = require('fs');
var dface = require('../server/node_modules/dface');
var oTables = require('./Schema.js').getTables();

var out = fs.createWriteStream(__dirname + '/../htdocs/raw/dialogs.html');

out.write(generateHeader());

for (var sTablename in oTables)
{
    out.write(generateButton(sTablename));
}

out.write('\r\n');

for (var sTablename in oTables)
{
    out.write(generateDialog(sTablename));
}

out.write(generateFooter());

out.end();

//
// generateHeader
//
function generateHeader()
{
    var s = '<!doctype html>\r\n';
    s    += '<html lang="en">\r\n';
    s    += '<head>\r\n';
    s    += '    <title>Transport Manager Dialogs</title>\r\n';
    s    += '    <link rel="stylesheet" href="../ui-lightness/jquery-ui-1.10.3.custom.css">\r\n';
    s    += '    <link rel="stylesheet" href="../index.css">\r\n';
    s    += '    <link rel="icon" type="image/png" href="../icons/Car.png">\r\n';
    s    += '    <script src="../jquery-1.11.1.min.js"></script>\r\n';
    s    += '    <script src="../jquery-ui-1.10.3.custom.min.js"></script>\r\n';
    s    += '</head>\r\n';
    s    += '<body>\r\n';
    s    += '\r\n';
    return s;
}

//
// generateFooter
//
function generateFooter()
{
    var s = '\r\n';
    s    += '</body>\r\n';
    s    += '</html>\r\n';
    return s;
}

//
// generateButton
//
function generateButton(sTablename)
{
    var s = '<button id="' + sTablename + '">' + sTablename + '</button>\r\n';
    s    += '<script>\r\n';
    s    += "    $('#" + sTablename + "').click(function()\r\n";
    s    += "    {\r\n";
    s    += "        $('#dlg" + sTablename + "').dialog({modal: true, autoOpen: true, width: 400});\r\n";
    s    += "    });\r\n";
    s    += '</script>\r\n';
    return s;
}

//
// generateDialog
//
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

    return sForm;
}

