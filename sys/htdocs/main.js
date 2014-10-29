$(document).ready(function()
{
    $('#radio').buttonset();
    $('#radio span').css('width', '100px');

    function gotJSON(root, textStatus, jqXHR)
    {
        var arrFields  = root['fields'];
        var arrRecords = root['records'];

        var sHtml = '';
 
        if (root["start"] == 0)
        {
            sHtml += '<tr>\n';

            for(var fld in arrFields)
            {
                sHtml += '<th style="width:' + arrFields[fld] + '">' + fld + '</th>\n';
            }

            sHtml += '</tr>\n';
        }

        for(var n in arrRecords)
        {
            var rs = arrRecords[n];

            sHtml += '<tr>\n';
            
            for(var fld in rs)
            {
                var value = rs[fld];

                if (value === null || value === '')
                {
                    sHtml += '<td>&nbsp;</td>\n';
                }
                else
                {
                    sHtml += '<td>' + value + '</td>\n';
                }
            }

            sHtml += '</tr>\n';
        }
        
        $('#tableClients').append(sHtml);

        if (root['more'])
        {
            $.getJSON('selectSql?query=' + encodeURIComponent(root['query']) + '&start=' + encodeURIComponent(root['start'] + arrRecords.length), gotJSON);
        }
    }

    $.getJSON('selectSql?query=' + encodeURIComponent('select * from clients'), gotJSON);
});

