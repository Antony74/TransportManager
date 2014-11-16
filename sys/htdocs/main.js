$(document).ready(function()
{
    var currentData = null;
    var currentFilter = null;
    var currentSort = -1;
    var currentSortAscending = true;
    var sTableHeader = '';

    $('#radio').buttonset();
    $('#radio span').css('width', '100px');

    function getCompareFunction(sFieldname, bAscending)
    {
        var nLessThan = bAscending ? -1 :  1;
        var nMoreThan = bAscending ?  1 : -1;
    
        return function(recA, recB)
        {
            if (recA[sFieldname] < recB[sFieldname])
            {
                return nLessThan;
            }
            else if (recA[sFieldname] > recB[sFieldname])
            {
                return nMoreThan;
            }
            else
            {
                return 0;
            }
        }
    }

    function onTableHeaderClick()
    {
        var nIndex = $(this).index();
        var sFieldname = currentData['fields'][$(this).index()].name;
        if (currentSort == nIndex)
        {
            currentSortAscending = !currentSortAscending;
        }
        else
        {
            currentSort = nIndex;
            currentSortAscending = true;
        }

        if (currentFilter == null)
        {
            currentFilter = currentData.records.concat();
        }

        currentFilter.sort(getCompareFunction(sFieldname, currentSortAscending));
        displayRecords(currentFilter, false);
        
        if (currentSortAscending)
        {
            $('#mainDataTable th:nth-child(' + (nIndex+1) + ')').html(sFieldname + "&nbsp;&#x25BC;");
        }
        else
        {
            $('#mainDataTable th:nth-child(' + (nIndex+1) + ')').html(sFieldname + "&nbsp;&#x25B2;");
        }
    }

    function onTableCellClick()
    {
    }

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

        $('#mainDataTable th').click(onTableHeaderClick);
        $('#mainDataTable td').click(onTableCellClick);
    }

    function updateFilter()
    {
        if (currentData && currentData['more'] == false)
        {
            var sFilter = $('#filterText').val().trim().toLowerCase();

            if (sFilter == '')
            {
                currentFilter = null;
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
                sTableHeader += '<th style="width:' + arrFields[fld].width + '">' + arrFields[fld].name + '</th>\n';
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

