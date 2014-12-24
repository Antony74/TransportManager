///<reference path='../interface/node.d.ts' />

var http = require('http');
var oTables = require('./Schema.js').getTables();
var arrTables = [];

for (var sTablename in oTables)
{
    arrTables.push(sTablename);
}

generateNextDialog();

function generateNextDialog()
{
    if (arrTables.length)
    {
        var sTablename = arrTables.shift();
        generateDialog(sTablename);
    }
}

function generateDialog(sTablename)
{
    var options =
    {
        host: 'localhost',
        port: 8080,
        path: '/selectSql?query=' + encodeURI('select * from ' + sTablename)
    };

    var request = http.request(options, function(res)
    {
        var data = '';

        res.on('data', function(chunk)
        {
            data += chunk.toString();
        });

        res.on('end', function()
        {
            var json = JSON.parse(data);

            var arrFields = json.fields;

            var sForm  = '<div id="dlg' + sTablename + '" title="' + sTablename + '">\r\n';
            sForm     += '    <form>\r\n';
            sForm     += '        <table width="100%">\r\n';


            for(nFld in json.fields)
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

            generateNextDialog();
        });

    });

    request.on('error', function(e)
    {
        console.log(e.message);
    });

    request.end();
}

