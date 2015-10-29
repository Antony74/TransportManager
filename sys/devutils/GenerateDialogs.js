///<reference path='../interface/node.d.ts' />

var fs = require('fs');
var dface = require('../server/node_modules/dface');
var oTables = require('../htdocs/Schema.js').getTables();

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
    var sQuery = oTables[sTablename]['query'];

    out.write(generateDialog(sTablename, sQuery));
}

out.write(generateFooter());

out.end();

//
// generateHeader
//
function generateHeader()
{
    var ts = new Date();    

	function pad(nValue)
	{
		return ('00' + nValue).slice(-2);
	}

    var s = '<!doctype html>\r\n';
    s    += '<html lang="en">\r\n';
    s    += '<head>\r\n\r\n';

    s    += "    <!-- THIS IS AN AUTO-GENERATED FILE (created by " + __filename.split('\\').pop() + ", "
                                                                   + ts.getFullYear() + "/" + pad(ts.getMonth()+1) + "/" + pad(ts.getDate())
                                                                   + " " + pad(ts.getHours()) + ":" + pad(ts.getMinutes()) + ") -->\n\n";

    s    += '    <title>Transport Manager Dialogs</title>\r\n';
    s    += '    <link rel="stylesheet" href="../ui-lightness/jquery-ui-1.10.3.custom.css">\r\n';
    s    += '    <link rel="stylesheet" href="../index.css">\r\n';
    s    += '    <link rel="icon" type="image/png" href="../icons/Car.png">\r\n';
    s    += '    <script src="../jquery-1.11.1.min.js"></script>\r\n';
    s    += '    <script src="../jquery-ui-1.10.3.custom.min.js"></script>\r\n\r\n';

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
function generateDialog(sTablename, sQuery)
{

    var options =
    {
        'query'                : sQuery,
        'startRecord'          : 0,
        'schemaLevel'          : 2,
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
    };

    var sTitle = sTablename;

    if (typeof oTitles[sTablename] !== undefined)
    {
        sTitle = oTitles[sTablename];
    }

    var json = dface.selectSql(options);

    if (typeof json.Error != 'undefined')
    {
        console.log(sQuery);
        console.log(json.Error);
        return '<!--' + json.Error + '-->';
    }

    var arrFields = json.fields;

    var nColumns = (arrFields.length >= 12) ? 2 : 1;

    var sForm  = '<div id="dlg' + sTablename + '" title="' + sTitle + '" class="dialogTemplate">\r\n';
    sForm     += '    <form>\r\n';
    sForm     += '        <table style="width:100%">\r\n';

    var nPairedCellCount = 0;

    // Quick first pass of fields to eliminate unwanted fields (e.g. ClientEx.ClientID)
    for(var nFld = 0; nFld < arrFields.length; ++nFld)
    {
        var sFieldname = arrFields[nFld].name;

        if (sFieldname.indexOf('.') != -1)
        {
            arrFields.splice(nFld, 1);
            --nFld;
        }
    }

    // Now we can go through the fields properly and add them to the dialog
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

            var sInputAttributes = 'type="text"';
            var sCalendarButton  = '';
            
            var sDbType = arrFields[nFld].Type;
            
            if (sDbType == 'DATE')
            {
                var oDateOnlyFields = oTables[sTablename].DateOnlyFields;

                if (oDateOnlyFields != undefined && oDateOnlyFields[sFieldname] == true)
                {
                    sInputAttributes = 'type="text" class="datepicker" style="width:85%"';
                    sCalendarButton  = '&nbsp;<img src="./lib/ui-lightness/images/calendar.gif" id="' + sTablename + '_' + sFieldname + '_button" class="datepickerbutton" />';
                }
                else
                {
                    sInputAttributes = 'type="text" class="datetimepicker" style="width:85%"';
                    sCalendarButton  = '&nbsp;<img src="./lib/ui-lightness/images/calendar.gif" id="' + sTablename + '_' + sFieldname + '_button" class="datetimepickerbutton" />';
                }
            }
            else if (sDbType == 'YESNO')
            {
                sInputAttributes = 'type="checkbox" style="text-align:left"';
            }

            sForm += '                <td>' + sFieldname + '</td>\r\n';
            sForm += '                <td><input ' + sInputAttributes + ' id="' + sTablename + '_' + sFieldname + '" class="dialogInput" style="width:95%"/>' + sCalendarButton + '</td>\r\n';
            
            ++nPairedCellCount;
        }
    }
    
    while (nPairedCellCount % nColumns)
    {
        sForm += '                <td colspan="2">&nbsp;</td>\r\n';
        ++nPairedCellCount;
    }
    
    sForm     += '            </tr>\r\n';
    sForm     += '        </table>\r\n';

    if (sTablename == "Drivers")
    {
        sForm += '        <table style="width:100%">\r\n';
        sForm += '            <tr>\r\n';
        sForm += '              <td>Mon</td><td><input type="checkbox" id="Drivers_Mon" style="width:95%"/></td>\r\n';
        sForm += '              <td>Tue</td><td><input type="checkbox" id="Drivers_Tue" style="width:95%"/></td>\r\n';
        sForm += '              <td>Wed</td><td><input type="checkbox" id="Drivers_Wed" style="width:95%"/></td>\r\n';
        sForm += '              <td>Thu</td><td><input type="checkbox" id="Drivers_Thu" style="width:95%"/></td>\r\n';
        sForm += '              <td>Fri</td><td><input type="checkbox" id="Drivers_Fri" style="width:95%"/></td>\r\n';
        sForm += '              <td>Sat</td><td><input type="checkbox" id="Drivers_Sat" style="width:95%"/></td>\r\n';
        sForm += '              <td>Sun</td><td><input type="checkbox" id="Drivers_Sun" style="width:95%"/></td>\r\n';
        sForm += '            </tr>\r\n';
        sForm += '        </table>\r\n';
    }

    sForm     += '    </form>\r\n';
    sForm     += '    <table class="dialogStatus">\r\n';
    sForm     += '        <tr>\r\n';
    sForm     += '            <td class="dialogStatusAmber">Status: Initialising</td>\r\n';
    sForm     += '        </tr>\r\n';
    sForm     += '    </table>\r\n';
    sForm     += '</div>\r\n';

    return sForm;
}

