///<reference path='./initialiseDateTimePickers.ts' />
///<reference path='../interface/jquery.ui.datetimepicker.d.ts' />
///<reference path='./ProxyApi.ts' />

$(document).ready(function()
{
    initialiseDateTimePickers(
    {
        timepicker : false,
        format     : 'd/m/Y',
        onShow: function(date, input, event)
        {
            onShowDate(input.context.id);
        }
    },
    '.reportdatetimepicker',
    '.reportdatetimepickerbutton');

    // Try to provide sensible default dates.  Most likely we will want to generate a
    // report for the quarter which has just finished.  

    var baseDate = new Date();
	baseDate = addMonths(1, baseDate); //Annoyingly DVC has to report upon non-standard quarters.
	var startOfPreviousQuarter = getStartOfPreviousQuarter(baseDate);
    startOfPreviousQuarter = addMonths(-1, startOfPreviousQuarter); //Annoyingly DVC has to report upon non-standard quarters.

    var endOfPreviousQuarter = addMonths(3, startOfPreviousQuarter);
    endOfPreviousQuarter = addDays(-1, endOfPreviousQuarter);

    $('#SLA4Start').datetimepicker({value:startOfPreviousQuarter});
    $('#DriverActivityStart').datetimepicker({value:startOfPreviousQuarter});
    $('#DestinationSummaryStart').datetimepicker({value:startOfPreviousQuarter});
    $('#CancellationListStart').datetimepicker({value:startOfPreviousQuarter});

    $('#SLA4End').datetimepicker({value:endOfPreviousQuarter});
    $('#DriverActivityEnd').datetimepicker({value:endOfPreviousQuarter});
    $('#DestinationSummaryEnd').datetimepicker({value:endOfPreviousQuarter});
    $('#CancellationListEnd').datetimepicker({value:endOfPreviousQuarter});

    // Done initialising.  Now we need 'click' functions for each 'GenerateReport' button
    $('#generateSlaReport').click(function()
    {
        var arrSpans = [];

        for (var nSpan = 1; nSpan <= 4; ++nSpan)
        {
            var retval = validateDateSpan('SLA' + nSpan + 'Start', 'SLA' + nSpan + 'End');

            if (retval.bValid == true)
            {
                arrSpans.push({dateFrom: retval.dateFrom, dateTo: retval.dateTo});
            }
            else if (retval.bValid == false)
            {
                alert('In span ' + nSpan + ': ' + retval.sMessage);
                return;
            }
            else
            {
                // No action needed, just a reminder that validateDateSpan could return null
            }
        }

        if (arrSpans.length == 0)
        {
            alert('No dates specified');
        }
        else
        {
            $('#generateSlaReport').html('Processing...').prop('disabled', true);

            getCoreApiProxy().report_sla(arrSpans, function(oReport)
            {
                if (oReport['Error'] != undefined)
                {
                    alert(oReport['Error']);
                }
                else
                {
                    $('#reportLog').html(oReport['log']);

                    var newWindow = window.open();
                    if (newWindow)
                    {
                        $(newWindow.document.body).append(oReport['output']);
                    }
                }

                $('#generateSlaReport').html('Generate Report').prop('disabled', false);
            });
        }
    });

    $('#generateDriverActivityReport').click(function()
    {
        var retval = validateDateSpan('DriverActivityStart', 'DriverActivityEnd');

        if (retval.bValid == true)
        {
            alert('Dates valid.  Antony is still working on the Driver Activity report');
        }
        else
        {
            alert(retval.sMessage);
        }
    });

    $('#generateDestinationSummaryReport').click(function()
    {
        var retval = validateDateSpan('DestinationSummaryStart', 'DestinationSummaryEnd');

        if (retval.bValid == true)
        {
            alert('Dates valid.  Antony is still working on the Destination Summary report');
        }
        else
        {
            alert(retval.sMessage);
        }
    });

    $('#generateCancellationListReport').click(function()
    {
        var retval = validateDateSpan('CancellationListStart', 'CancellationListEnd');

        if (retval.bValid == true)
        {
            alert('Dates valid.  Antony is still working on the Cancellation List report');
        }
        else
        {
            alert(retval.sMessage);
        }
    });
});
//
// Define some date handling functions.
// These are pretty crude, but hopefully that will make it obvious what is going on.
//
function addMonths(nMonths, date)
{
    var nYear = date.getFullYear();
    nMonths += date.getMonth();

    while (nMonths < 0)
    {
        nMonths += 12;
        nYear -= 1;
    }

    while (nMonths > 11)
    {
        nMonths -= 12;
        nYear += 1;
    }

    return new Date(nYear, nMonths, date.getDate());
}

function addDays(nDays, date)
{
    var milliseconds = nDays * 24 * 60 * 60 * 1000;

    return new Date(date.valueOf() + milliseconds);
}

function validateDateSpan(sFromID, sToID)
{
    var dateFrom = parseDate($('#' + sFromID).val());
    var dateTo   = parseDate($('#' + sToID  ).val());

    if (dateFrom == null && dateTo == null)
    {
        return {bValid: null, sMessage: "No dates specified", dateFrom: dateFrom, dateTo: dateTo};
    }
    else if (dateFrom == null)
    {
        return {bValid: false, sMessage: "No 'from' date specified", dateFrom: dateFrom, dateTo: dateTo};
    }
    else if (dateTo == null)
    {
        return {bValid: false, sMessage: "No 'to' date specified", dateFrom: dateFrom, dateTo: dateTo};
    }
    else if (dateFrom > dateTo)
    {
        return {bValid: false, sMessage: "'From' date occurs after 'to' date", dateFrom: dateFrom, dateTo: dateTo};
    }
    else
    {
        return {bValid: true, sMessage: "", dateFrom: dateFrom, dateTo: dateTo};
    }
}

function getMonthSpan(sFromID, sToID)
{
    var dateFrom = parseDate($('#' + sFromID).val());
    var dateTo   = parseDate($('#' + sToID  ).val());

    if (dateFrom == null || dateTo == null)
    {
        return null;
    }

    dateTo = addDays(1, dateTo);

    if (dateFrom.getDate() != dateTo.getDate())
    {
        return null; // Not a whole number of calander months
    }
    else
    {
        return dateTo.getMonth() - dateFrom.getMonth() + 12 * (dateTo.getFullYear() - dateFrom.getFullYear());
    }
}

//
// onShowDate
//

function onShowDate(sID)
{
    if (sID.substring(0,3) == 'SLA')
    {
        var nMonthSpan = null;

        for (var nSpan = 1; nSpan <= 4; ++nSpan)
        {
            var nCurrentMonthSpan = getMonthSpan('SLA' + nSpan + 'Start', 'SLA' + nSpan + 'End');

            if (nCurrentMonthSpan != null)
            {
                if (nMonthSpan != null && nMonthSpan != nCurrentMonthSpan)
                {
                    return; // Not much chance of doing something helpful with an inconsistent month-span
                }

                nMonthSpan = nCurrentMonthSpan;
            }
        }

        if (nMonthSpan != null)
        {
            var datePrev = null;

            for (var nSpan = 3; nSpan >= 1; --nSpan)
            {
                var date = parseDate($('#SLA' + (nSpan+1) + 'Start').val());
                if (date == null)
                {
                    date = datePrev;
                }

                if (date != null)
                {
                    var spanStart = addMonths(-nMonthSpan, date);
                    var spanEnd   = addDays(-1, date);

                    var sStartID = 'SLA' + nSpan + 'Start';
                    var sEndID   = 'SLA' + nSpan + 'End';

                    if (sID == sStartID)
                    {
                        $('#' + sStartID).datetimepicker({value: spanStart});
                    }
                    else if (sID == sEndID)
                    {
                        $('#' + sEndID  ).datetimepicker({value: spanEnd  });
                    }

                    datePrev = spanStart;
                }
            }
        }
    }
}

//
// getStartOfPreviousQuarter
//
// (a 'quarter' being one of four three-month periods which make up a year)
//
function getStartOfPreviousQuarter(baseDate)
{
    var startOfPreviousQuarter = null;

    switch(baseDate.getMonth())
    {
    case 0:
    case 1:
    case 2:
        startOfPreviousQuarter = new Date(baseDate.getFullYear() - 1, 9, 1);
        break;
    case 3:
    case 4:
    case 5:
        startOfPreviousQuarter = new Date(baseDate.getFullYear(), 0, 1);
        break;
    case 6:
    case 7:
    case 8:
        startOfPreviousQuarter = new Date(baseDate.getFullYear(), 3, 1);
        break;
    case 9:
    case 10:
    case 11:
        startOfPreviousQuarter = new Date(baseDate.getFullYear(), 6, 1);
        break;
    }

	return startOfPreviousQuarter;
}

