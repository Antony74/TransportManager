$(document).ready(function()
{
    $('#radio').buttonset();

    $.getJSON('selectSql?query=' + encodeURIComponent('select * from clients'), function(data, textStatus, jqXHR)
    {
        var sHtml = '';
    
        sHtml += '<tr>\n';

        // Those fieldnames are still going to have to come from somewhere if there are zero records
        for(var fld in data[0])
        {
            sHtml += '<th>' + fld + '</th>\n';
        }

        sHtml += '</tr>\n';

        for(var n in data)
        {
            var rs = data[n];

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
        
        $('#tableClients').html(sHtml);
        
        $('tr:even').addClass('trAlt');
    });
});

