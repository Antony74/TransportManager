///<reference path='../initialiseDateTimePickers.ts' />
///<reference path='../../interface/jquery.ui.datetimepicker.d.ts' />

$(document).ready(function()
{
    initialiseDateTimePickers(
    {
        timepicker : false,
        format     : 'd/m/Y'
    });

    // Try to provide sensible default dates.  Most likely we will want to generate a
    // report for the quarter which has just finished.
    // (a 'quarter' being one of four three-month periods which make up a year)

    var now = new Date();
    var startOfPreviousQuarter = null;

    switch(now.getMonth())
    {
    case 0:
    case 1:
    case 2:
        startOfPreviousQuarter = new Date(now.getFullYear() - 1, 8, 1);
        break;
    case 3:
    case 4:
    case 5:
        startOfPreviousQuarter = new Date(now.getFullYear(), 0, 1);
        break;
    case 6:
    case 7:
    case 8:
        startOfPreviousQuarter = new Date(now.getFullYear(), 2, 1);
        break;
    case 9:
    case 10:
    case 11:
        startOfPreviousQuarter = new Date(now.getFullYear(), 5, 1);
        break;
    }

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

        for (var n = 1; n <= 4; ++n)
        {
            var retval = validateDateSpan('SLA' + n + 'Start', 'SLA' + n + 'End');

            if (retval.bValid == true)
            {
                arrSpans.push({dateFrom: retval.dateFrom, dateTo: retval.dateTo});
            }
            else if (retval.bValid == false)
            {
                alert('In span ' + n + ': ' + retval.sMessage);
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
            alert( arrSpans.length + ' valid date spans.  Antony is still working on the SLA report');
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

//
// parseDate
//
// jquery.datetimepicker provides a Date.parseDate function, which we simplfy here by providing the date format we are using
//
function parseDate(sDate)
{
    return Date['parseDate'](sDate, 'd/m/Y');
}

