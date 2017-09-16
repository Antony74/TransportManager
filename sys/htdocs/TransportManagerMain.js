
var dialogHandler = null;
var currentFields = {};

$(document).ready(function() {

    getDialogHandler(function(_dialogHandler) {
        dialogHandler = _dialogHandler;
        allReady();
    });
});

function allReady() {

    var currentData = null;
    var currentFilter = null;
    var currentSort = -1;
    var currentSortAscending = true;
    var currentTable = 'Client';
    var currentQuery = 'select * from Client order by ClientID';
    var sTableHeader = '';

    $('#radio').buttonset();
    $('#radio span').css('width', '100px');

    function getCompareFunction(sFieldname, bAscending) {

        var nLessThan = bAscending ? -1 :  1;
        var nMoreThan = bAscending ?  1 : -1;
    
        return function(recA, recB) {

            if (recA[sFieldname] < recB[sFieldname]) {
                return nLessThan;
            } else if (recA[sFieldname] > recB[sFieldname]) {
                return nMoreThan;
            } else {
                return 0;
            }
        };
    }

    function onTableHeaderClick() {

        var nIndex = $(this).index();
        var sFieldname = currentData['fields'][$(this).index()].name;
        if (currentSort == nIndex) {
            currentSortAscending = !currentSortAscending;
        } else {
            currentSort = nIndex;
            currentSortAscending = true;
        }

        if (currentFilter == null) {
            currentFilter = currentData.records.concat();
        }

        currentFilter.sort(getCompareFunction(sFieldname, currentSortAscending));
        displayRecords(currentFilter, false);
        
        if (currentSortAscending) {
            $('#mainDataTable th:nth-child(' + (nIndex+1) + ')').html(sFieldname + '&nbsp;&#x25BC;');
        } else {
            $('#mainDataTable th:nth-child(' + (nIndex+1) + ')').html(sFieldname + '&nbsp;&#x25B2;');
        }
    }

    function onTableCellClick() {
        var dlg = $('#dlgClients');
        if (dlg.length) {
            var nRow = $(this).parent().index() - 1;

            var oRecord = currentFilter ? currentFilter[nRow] : currentData.records[nRow];

            dialogHandler.doClientDialog(oRecord['ClientID']);
        }
    }

    function displayRecords(arrRecords, bAppend) {
        var sHtml = '';

        for(var n in arrRecords) {

            var rs = arrRecords[n];

            sHtml += '<tr>\n';
            
            for(var fld in rs) {

                var htmlValue = currentFields[fld].toHtmlValue(rs[fld]);

                sHtml += '<td>' + htmlValue + '</td>\n';
            }

            sHtml += '</tr>\n';
        }
        
        if (bAppend) {
            $('#mainDataTable').append(sHtml);
        } else {
            $('#mainDataTable').empty().append(sTableHeader + sHtml);
        }

        $('#mainDataTable th').click(onTableHeaderClick);
        $('#mainDataTable td').dblclick(onTableCellClick);
    }

    function updateFilter() {

        if (currentData && currentData['more'] == false) {

            var sFilter = $('#filterText').val().trim().toLowerCase();

            if (sFilter == '') {

                currentFilter = null;
                displayRecords(currentData['records'], false);
            } else {

                currentFilter = [];
                var arrRecords = currentData['records'];

                for(var n in arrRecords) {

                    var rs = arrRecords[n];

                    for(var fld in rs) {

                        if (rs[fld] != null) {

                            var value = rs[fld].toString().toLowerCase();

                            if (value.contains(sFilter)) {
                                currentFilter.push(arrRecords[n]);
                                break;
                            }
                        }
                    }
                }

                displayRecords(currentFilter, false);
            }
        }
    }

    $('#filterText').on('input', function() {
        updateFilter();
    });

    $('#filterCancel').click(function() {
        $('#filterText').val('');
        updateFilter();
    });

    function gotJSON(root) {

        if (typeof(root['Error']) == 'string' && root['Error'].length) {

            setDataTableStatus(root['Error'], 'R');
            return;
        }

        if (currentQuery == root['query']) {

            var arrRecords = root['records'];

            if (currentData == null) {
                currentData = root;
            } else {
                currentData['records'] = currentData['records'].concat(arrRecords);
            }

            if (root['startRecord'] == 0) {

                var arrFields = root['fields'];
                
                sTableHeader = '<tr>\n';

                currentFields = {};

                for(var nFld in arrFields) {

                    var fld = arrFields[nFld];
                    sTableHeader += '<th style="width:' + fld.width + '">' + fld.name + '</th>\n';
                    
                    var converter = {};

                    if (fld['Type'] == 'DATE') {

                        var bDateOnly = getTables()['Clients'].DateOnlyFields[fld['name']] ? true : false;

                        if (bDateOnly) {
                            converter['toHtmlValue'] = function(value) {
                                var dateValue = new Date(value);
                                return getDDMMYYYY(dateValue);
                            };
                        } else {
                            converter['toHtmlValue'] = function(value) {
                                var dateValue = new Date(value);
                                return getDDMMYYYY(dateValue) + '&nbsp;' + getHHMM(dateValue);
                            };
                        }

                        converter['toDialogValue'] = function(value) {
                            var dateValue = new Date(value);
                            return getDDMMYYYY(dateValue) + ' ' + getHHMM(dateValue);
                        };

                        converter['fromDialogValue'] = function(dv) {
                            return dv;
                        };

                    } else {

                        converter['toDialogValue'] = function(value) {
                            return value;
                        };

                        converter['fromDialogValue'] = function(dv) {
                            return dv;
                        };

                        if (fld['Type'] == 'YESNO') {
                            converter['toHtmlValue'] = function(value) {

                                if (value) {
                                    return '&#x2714'; // Tick
                                } else {
                                    return '&#x2716'; // Cross
                                }
                            };
                        } else {
                            converter['toHtmlValue'] = function(value) {

                                if (value === null || value === '') {
                                    return '&nbsp;';
                                } else {
                                    return this.toDialogValue(value).toString().replace(' ', '&nbsp;');
                                }
                            };
                        }
                    }
                    
                    currentFields[fld.name] = converter;
                }

                sTableHeader += '</tr>\n';
            
                displayRecords(arrRecords, false);

            } else {
                displayRecords(arrRecords, true);                
            }

            if (root['more']) {

                getCoreApiProxy().selectSql(root['query'], arrRecords.length + root['startRecord'], 0, gotJSON);

            } else {
                currentData['more'] = false;
                updateFilter();
                setDataTableStatus('Ready', 'G');
            }
        }
    }

    function beginPopulateCalendar() {

        $('#mainDataTable').empty();

        currentTable = '';
        currentQuery = '';
        currentData = null;
        currentFilter = null;
    }

    function beginPopulateTable() {

        $('#reports').hide();
        $('#dataTable').show();
        $('#mainDataTable').empty();

        currentData = null;
        currentFilter = null;
        currentSort = -1;
        currentSortAscending = true;
        sTableHeader = '';

        setDataTableStatus('Loading', 'A');
        getCoreApiProxy().selectSql(currentQuery, 0, 2, gotJSON);
    }

    function beginPopulateJobs() {
        currentTable = 'Clients';
        currentQuery = 'select * from Jobs order by JobID';
        beginPopulateTable();
    }

    function beginPopulateClients() {
        currentTable = 'Client';
        currentQuery = 'select * from Client order by ClientID';
        beginPopulateTable();
    }

    function beginPopulateDrivers() {
        currentTable = 'Drivers';
        currentQuery = 'select * from Drivers order by DriverID';
        beginPopulateTable();
    }

    function beginPopulateDestinations() {
        currentTable = 'Destinations';
        currentQuery = 'select * from Destinations order by DestinationID';
        beginPopulateTable();
    }

    function showReports() {
        $('#dataTable').hide();
        $('#reports').show();
    }

    $('#radioCalendar').click(beginPopulateCalendar);
    $('#radioJobs').click(beginPopulateJobs);
    $('#radioReports').click(showReports);
    $('#radioClients').click(beginPopulateClients);
    $('#radioDrivers').click(beginPopulateDrivers);
    $('#radioDestinations').click(beginPopulateDestinations);

    $('#radioReports').trigger('click');

}

function setDataTableStatus(sStatus, cTrafficLight) {

    $('#dataTableStatus').show();

    var statusBar = $('#dataTableStatus').find('td');

    if (cTrafficLight == 'G') {

        statusBar.html('Status: ' + sStatus)
                    .removeClass('dialogStatusRed')
                    .removeClass('dialogStatusAmber')
                    .addClass('dialogStatusGreen');
 
   } else if (cTrafficLight == 'A') {

        statusBar.html('Status: ' + sStatus)
                    .removeClass('dialogStatusRed')
                    .addClass('dialogStatusAmber')
                    .removeClass('dialogStatusGreen');

    } else {

        if (sStatus.indexOf('SyntaxError:') != 0) {
            sStatus = 'Error: ' + sStatus;
        }

        statusBar.html(sStatus)
                    .addClass('dialogStatusRed')
                    .removeClass('dialogStatusAmber')
                    .removeClass('dialogStatusGreen');
    }
}
