$(document).ready(function()
{
    var currentData = null;
    var currentFilter = null;
    var sTableHeader = '';

    $('#radio').buttonset();
    $('#radio span').css('width', '100px');

    function displayRecords(arrRecords, bAppend)
    {
        var sHtml = '';

        for(var n = 0 in arrRecords)
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
        
        if (bAppend)
        {
            $('#mainDataTable').append(sHtml);
        }
        else
        {
            $('#mainDataTable').empty().append(sTableHeader + sHtml);
        }
    }

    function updateFilter()
    {
        if (currentData && currentData['more'] == false)
        {
            var sFilter = $('#filterText').val().trim().toLowerCase();

            if (sFilter == '')
            {
                displayRecords(currentData['records'], false);
            }
            else
            {
                currentFilter = [];
                var arrRecords = currentData['records'];

                for(var n in arrRecords)
                {
                    var rs = arrRecords[n];

                    for(var fld in rs)
                    {
                        var value = rs[fld].toString().toLowerCase();

                        if (value.contains(sFilter))
                        {
                            currentFilter[n] = arrRecords[n];
                            break;
                        }
                    }
                }

                displayRecords(currentFilter, false);
            }
        }
    }

    $('#filterText').on('input', function()
    {
        updateFilter();
    });

    $('#filterCancel').click(function()
    {
        $('#filterText').val('');
        updateFilter();
    });

    function gotJSON(root, textStatus, jqXHR)
    {
        var arrFields  = root['fields'];
        var arrRecords = root['records'];

        if (currentData == null)
        {
            currentData = root;
        }
        else
        {
            currentData['records'] = currentData['records'].concat(arrRecords);
        }

        if (root['start'] == 0)
        {
            sTableHeader = '<tr>\n';

            for(var fld in arrFields)
            {
                sTableHeader += '<th style="width:' + arrFields[fld] + '">' + fld + '</th>\n';
            }

            sTableHeader += '</tr>\n';

            displayRecords(arrRecords, false);                
        }
        else
        {
            displayRecords(arrRecords, true);                
        }

        if (root['more'])
        {
            $.getJSON('selectSql?query=' + encodeURIComponent(root['query']) + '&start=' + encodeURIComponent(root['start'] + arrRecords.length), gotJSON);
        }
        else
        {
            currentData['more'] = false;
            updateFilter();
        }
    }

    $.getJSON('selectSql?query=' + encodeURIComponent('select * from clients order by ClientID'), gotJSON);

});

