///<reference path='../interface/node.d.ts' />

var fs = require('fs');
var dface = require('../server/node_modules/dface');
var oTables = require('./Schema.js').getTables();

var out = fs.createWriteStream(__dirname + '/../htdocs/raw/dialogs.html');

out.write(generateHeader());
out.write('<BR>\r\n');
out.write('<p style="text-align:center">\r\n');

for (var sTablename in oTables)
{
    out.write(generateButton(sTablename));
}

out.write('</p>\r\n');
out.write('\r\n');
out.write('<script>\r\n');
out.write('$(document).ready(function()\r\n');
out.write('{\r\n');

for (var sTablename in oTables)
{
    out.write(generateButtonScript(sTablename));
}

out.write('});\r\n');
out.write('</script>\r\n');
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
    var s = '    <button id="' + sTablename + '">' + sTablename + '</button>\r\n';
    return s;
}

//
// generateButtonScript
//
function generateButtonScript(sTablename)
{
    var s = "    $('#dlg" + sTablename + "').dialog({modal: true, autoOpen: false, width: 800});\r\n";
    s    += "    $('#" + sTablename + "').click(function()\r\n";
    s    += "    {\r\n";
    s    += "        $('#dlg" + sTablename + "').dialog('open');\r\n";
    s    += "    });\r\n";
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

    var oDays = {'Mon': null, 'Tue': null, 'Wed': null, 'Thu': null, 'Fri': null, 'Sat': null, 'Sun':null};

    var oTitles =
    {
        'Clients'             : 'Client',
        'Destinations'        : 'Destination',
        'DestinationType'     : 'Destination Type',
        'DriverExclusionList' : 'Driver Exclusion List',
        'Drivers'             : 'Driver',
        'DriverVacation'      : 'Driver Vacation',
        'JobLog'              : 'Job Log',
        'Jobs'                : 'Job',
    }

    var sTitle = sTablename;

    if (typeof oTitles[sTablename] !== 'undefined')
    {
        sTitle = oTitles[sTablename];
    }

    var json = dface.selectSql(options);

    var arrFields = json.fields;

    var nColumns = (arrFields.length >= 12) ? 2 : 1;

    var sForm  = '<div id="dlg' + sTablename + '" title="' + sTitle + '">\r\n';
    sForm     += '    <form>\r\n';
    sForm     += '        <table style="width:100%">\r\n';

    for(var nFld = 0; nFld < arrFields.length; ++nFld)
    {
        var sFieldname = arrFields[nFld].name;

        if (typeof oDays[sFieldname] === 'undefined')
        {
            if (nFld % nColumns == 0)
            {
                if (nFld != 0)
                {
                    sForm += '            </tr>\r\n';
                }
                sForm += '            <tr>\r\n';
            }

            sForm += '                <td>' + sFieldname + '</td>\r\n';
            sForm += '                <td><input type="Text" id="' + sTablename + '_' + sFieldname + '" style="width:95%"/></td>\r\n';
        }
    }
    sForm     += '            </tr>\r\n';
    sForm     += '        </table>\r\n';

    if (sTablename == "Drivers")
    {
        sForm += '        <table style="width:100%">\r\n';
        sForm += '            <tr>\r\n';
        sForm += '              <td>Mon</td><td><input type="Text" id="Drivers_Mon" style="width:95%"/></td>\r\n';
        sForm += '              <td>Tue</td><td><input type="Text" id="Drivers_Tue" style="width:95%"/></td>\r\n';
        sForm += '              <td>Wed</td><td><input type="Text" id="Drivers_Wed" style="width:95%"/></td>\r\n';
        sForm += '              <td>Thu</td><td><input type="Text" id="Drivers_Thu" style="width:95%"/></td>\r\n';
        sForm += '              <td>Fri</td><td><input type="Text" id="Drivers_Fri" style="width:95%"/></td>\r\n';
        sForm += '              <td>Sat</td><td><input type="Text" id="Drivers_Sat" style="width:95%"/></td>\r\n';
        sForm += '              <td>Sun</td><td><input type="Text" id="Drivers_Sun" style="width:95%"/></td>\r\n';
        sForm += '            </tr>\r\n';
        sForm += '        </table>\r\n';
    }

    sForm     += '    </form>\r\n';
    sForm     += '</div>\r\n';

    return sForm;
}

