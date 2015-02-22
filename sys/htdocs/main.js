///<reference path='../interface/jqueryui.d.ts' />
///<reference path='./dialogHandler.ts' />

var dialogHandler = null;

$(document).ready(function()
{
    createDialogHandler(function(_dialogHandler)
    {
        dialogHandler = _dialogHandler;
        allReady();
    });
});

function allReady()
{
    var currentData = null;
    var currentFilter = null;
    var currentSort = -1;
    var currentSortAscending = true;
    var currentTable = 'Clients';
    var currentQuery = 'select * from Clients order by ClientID';
    var sTableHeader = '';

    var mainButtonset = $('#radio').buttonset();
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
        var dlg = $("#dlg" +currentTable);
        if (dlg.length)
        {
            var nRow = $(this).parent().index() - 1;

            var oRecord = currentFilter ? currentFilter[nRow] : currentData.records[nRow];

            for (var sFieldname in oRecord)
            {
                var sValue = oRecord[sFieldname];

                $('#' + currentTable + '_' + sFieldname).val(sValue);
            }

            dialogHandler.doDialog(currentTable, currentQuery, oRecord, function(bChanged)
            {
                if (bChanged)
                {
                    var arrFieldNames = [];

                    for (var sFieldName in oRecord)
                    {
                        arrFieldNames.push(sFieldName);
                        oRecord[sFieldName] = $('#' + currentTable + '_' + sFieldName).val();
                    }

                    var oRow = $('#mainDataTable tr:nth-child(' + nRow + ')');

                    oRow.find('td').each(function()
                    {
                        var sFieldName = arrFieldNames.shift();
                        $(this).html(fieldValueAsHtml(oRecord[sFieldName]));
                    });
                }
            });
        }
    }

    function fieldValueAsHtml(value)
    {
        if (value === null || value === '')
        {
            return '&nbsp;';
        }
        else
        {
            return value;
        }
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

                sHtml += '<td>' + fieldValueAsHtml(value) + '</td>\n';
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
        $('#mainDataTable td').dblclick(onTableCellClick);
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
                            currentFilter.push(arrRecords[n]);
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
        if (currentQuery == root['query'])
        {
            var arrRecords = root['records'];

            if (currentData == null)
            {
                currentData = root;
            }
            else
            {
                currentData['records'] = currentData['records'].concat(arrRecords);
            }

            if (root['startRecord'] == 0)
            {
                var arrFields  = root['fields'];
                
                sTableHeader = '<tr>\n';

                for(var nFld in arrFields)
                {
                    sTableHeader += '<th style="width:' + arrFields[nFld].width + '">' + arrFields[nFld].name + '</th>\n';
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
                $.getJSON('selectSql?query=' + encodeURIComponent(root['query']) + '&startRecord=' + encodeURIComponent(arrRecords.length + root['startRecord']), gotJSON);
            }
            else
            {
                currentData['more'] = false;
                updateFilter();
            }
        }
    }

    function beginPopulateCalendar()
    {
        $('#mainDataTable').empty();

        currentTable = '';
        currentQuery = '';
        currentData = null;
        currentFilter = null;
    }

    function beginPopulateTable()
    {
        $('#mainDataTable').empty();

        currentData = null;
        currentFilter = null;
        currentSort = -1;
        currentSortAscending = true;
        sTableHeader = '';

        $.getJSON('selectSql?schemaLevel=1&query=' + encodeURIComponent(currentQuery), gotJSON);
    }

    function beginPopulateJobs()
    {
        currentTable = 'Clients';
        currentQuery = 'select * from Jobs order by JobID';
        beginPopulateTable();
    }

    function beginPopulateClients()
    {
        currentTable = 'Clients';
        currentQuery = 'select * from Clients order by ClientID';
        beginPopulateTable();
    }

    function beginPopulateDrivers()
    {
        currentTable = 'Drivers';
        currentQuery = 'select * from Drivers order by DriverID';
        beginPopulateTable();
    }

    function beginPopulateDestinations()
    {
        currentTable = 'Destinations';
        currentQuery = 'select * from Destinations order by DestinationID';
        beginPopulateTable();
    }

    $('#radioCalendar').click(beginPopulateCalendar);
    $('#radioJobs').click(beginPopulateJobs);
    $('#radioClients').click(beginPopulateClients);
    $('#radioDrivers').click(beginPopulateDrivers);
    $('#radioDestinations').click(beginPopulateDestinations);

    $('#radioClients').trigger('click');

}

