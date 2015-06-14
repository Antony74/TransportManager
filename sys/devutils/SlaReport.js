///<reference path='../interface/node.d.ts' />

//
// Cache the destination types
//
var oDestinationTypes = (function(selectSql)
{
    var oResult = selectSql('SELECT DestinationTypeID, DestinationLevel1 FROM DestinationType');

    var oDestinationTypes = {};

    for (var n = 0; n < oResult.records.length; ++n)
    {
        var oRecord = oResult.records[n];
        oDestinationTypes[oRecord.DestinationTypeID] = oRecord.DestinationLevel1;
    }

    return oDestinationTypes;
})(simpleSelectSql);

//
// Generate report
//

var oJsonReport = 
{
    periodStart        : [],
    periodEnd          : [],
    jobStatus          : [],
    clientTitle        : [],
    isOneWay           : [],
    involvesWheelchair : [],
    typeOfDestination  : []
};

reportGeneratePeriod('2014/04/01', '2014/06/30', oJsonReport, simpleSelectSql);
reportGeneratePeriod('2014/07/01', '2014/09/30', oJsonReport, simpleSelectSql);
reportGeneratePeriod('2014/10/01', '2014/12/31', oJsonReport, simpleSelectSql);

console.log(reportHtml(oJsonReport));

//
// simpleSelectSql - a simplification of what dface provides because in this context we don't need any of its flexibility
//
function simpleSelectSql(sSql)
{
    var dface =  require('../server/node_modules/dface');
    var sDatabaseFilename = __dirname + "/../../TransportManager.mdb";

    var oResult = dface.selectSql(
    {
        'databaseFilename'      : sDatabaseFilename,
        'numberOfRecordsToGet'  : 10000,
        'query'                 : sSql,
        'startRecord'           : 0,
        'schemaLevel'           : 0
    });

    if (typeof oResult.Error != 'undefined')
    {
        console.log(oResult.Error);
    }

    return oResult;
}

//
// reportGeneratePeriod
//
function reportGeneratePeriod(sPeriodStart, sPeriodEnd, oJsonReport, selectSql)
{
    oJsonReport.periodStart.push(sPeriodStart);
    oJsonReport.periodEnd.push(sPeriodEnd);

    var sPeriodSubQuery = 'JobAppointmentDateTime > #' + sPeriodStart + ' 00:00# AND JobAppointmentDateTime < #' + sPeriodEnd + ' 23:59#';

    var sStatusQuery = 'SELECT status FROM jobs WHERE ' + sPeriodSubQuery;

    var oResult = selectSql(sStatusQuery);

    oJsonReport.jobStatus.push(reportCountValues(oResult.records, 'status'));

    var sSql = 'SELECT JobIsDVOWheelchair OR Clients.IsWheelchair AS Wheelchair, IsJobOneWay, Clients.Title, Destinations.TypeID AS DestinationTypeID'
             + ' FROM (jobs'
             + ' INNER JOIN Clients ON jobs.ClientID = Clients.ClientID)'
             + ' INNER JOIN Destinations ON jobs.DestinationID = Destinations.DestinationID'
             + ' WHERE status="Closed" AND ' + sPeriodSubQuery;

    var oResult = selectSql(sSql);

    for (var n = 0; n < oResult.records.length; ++n)
    {
        var oRecord = oResult.records[n];
        oRecord.DestinationTypeID = oDestinationTypes[oRecord.DestinationTypeID];
    }

    var oSummaryOfClientTitles = reportCountValues(oResult.records, 'Title');
    combineSummaryRecords(oSummaryOfClientTitles, ['Mrs.', 'Miss.', 'Ms.'], '');
    oJsonReport.clientTitle.push(oSummaryOfClientTitles);

    oJsonReport.isOneWay.push(reportCountValues(oResult.records, 'IsJobOneWay'));
    oJsonReport.involvesWheelchair.push(reportCountValues(oResult.records, 'Wheelchair'));
    oJsonReport.typeOfDestination.push(reportCountValues(oResult.records, 'DestinationTypeID'));
}

//
// reportCountValues
//
function reportCountValues(arrRecords, sFieldname)
{
    var oSummaryRecord = {};

    for (var n = 0; n < arrRecords.length; ++n)
    {
        var sThingToCount = arrRecords[n][sFieldname];

        if (sThingToCount == true || sThingToCount == '65535')
        {
            sThingToCount = 'Yes';
        }
        else if (sThingToCount == false || sThingToCount == '0')
        {
            sThingToCount = 'No';
        }

        if (typeof oSummaryRecord[sThingToCount] == 'undefined')
        {
            oSummaryRecord[sThingToCount] = 1;
        }
        else
        {
            ++oSummaryRecord[sThingToCount];
        }
    }

    oSummaryRecord['Total'] = arrRecords.length;

    return oSummaryRecord;
}

//
// combineSummaryRecords
//
function combineSummaryRecords(oSummaryRecord, arrHeadingsToCombine, sCombinedHeading)
{
    var nCombinedValue = 0;
    var arrHeadingsPresent = [];

    for (var n = 0; n < arrHeadingsToCombine.length; ++n)
    {
        var sHeading = arrHeadingsToCombine[n];

        if (typeof oSummaryRecord[sHeading] != 'undefined')
        {
            nCombinedValue += oSummaryRecord[sHeading];
            arrHeadingsPresent.push(sHeading);
            delete oSummaryRecord[sHeading];
        }
    }

    if (sCombinedHeading == '')
    {
        sCombinedHeading = arrHeadingsPresent.join('/');
    }

    if (nCombinedValue > 0)
    {
        oSummaryRecord[sCombinedHeading] = nCombinedValue;
    }
}

//
// sortRowHeaders
//
function sortRowHeaders(rows)
{
    // Perhaps we've been passed an object which needs to be converted to an array?
    if (!Array.isArray(rows))
    {
        rows = Object.keys(rows);
    }

    var arrSpecialOrdering =
    [
        'Closed',
        'Primary Medical Care',
        'Secondary Medical Care',
        '*',
        'Yes',
        'No',
        'Dr.',
        'Miscellaneous',
        'Total'
    ];

    return rows.sort(function(row1, row2)
    {
        var n1 = arrSpecialOrdering.indexOf(row1);
        var n2 = arrSpecialOrdering.indexOf(row2);
        var nOther = arrSpecialOrdering.indexOf('*');

        if (n1 == -1)
        {
            n1 = nOther;
        }

        if (n2 == -1)
        {
            n2 = nOther;
        }

        if (n1 < n2)
        {
            return -1;
        }
        else if (n1 > n2)
        {
            return 1;
        }
        else if (row1 < row2)
        {
            return -1;
        }
        else if (row1 > row2)
        {
            return 1;
        }
        else
        {
            return 0;
        }
    });
}

//
// reportHtml
//
function reportHtml(oJsonReport)
{
    var nColCount = oJsonReport.periodStart.length + 1;

    var sHtml = '<!DOCTYPE html>                        \r\n'
              + '<html>                                 \r\n'
              + '<head>                                 \r\n'
              + '    <title>DVC - SLA Report</title>    \r\n'
              + '    <style>                            \r\n'
              + '        table, td, th                  \r\n'
              + '        {                              \r\n'
              + '            border: 1px solid black;   \r\n'
              + '            border-collapse: collapse; \r\n'
              + '            padding: 5px;              \r\n'
              + '        }                              \r\n'
              + '        th, .firstColumn               \r\n'
              + '        {                              \r\n'
              + '            background-color: lightgray\r\n'
              + '        }                              \r\n'
              + '        .subheading                    \r\n'
              + '        {                              \r\n'
              + '            font-weight: bold;         \r\n'
              + '            background-color: yellow   \r\n'
              + '        }                              \r\n'
              + '    </style>                           \r\n'
              + '</head>                                \r\n'
              + '<body>                                 \r\n'
              + '    <table>                            \r\n';

    //
    // Display the time periods that this report relates to
    //

    sHtml    += '        <tr>                                    \r\n'
              + '            <td class="firstColumn">&nbsp;</td> \r\n';

    for (var n = 0; n < oJsonReport.periodStart.length; ++n)
    {
        var sPeriod = reverseDateFormat(oJsonReport.periodStart[n]) + ' - ' + reverseDateFormat(oJsonReport.periodEnd[n]);
        sHtml += '            <th>' + sPeriod + '</th>\r\n'
    }

    sHtml += '        </tr>                  \r\n'

    //
    // Done displaying time periods
    //

    sHtml +=reportSubHeading('Jobs in period', nColCount);
    sHtml += reportHtmlRow(oJsonReport.jobStatus);

    sHtml +=reportSubHeading('Now considering only "Closed" jobs', nColCount);

    sHtml +=reportSubHeading("Client's title", nColCount);
    sHtml += reportHtmlRow(oJsonReport.clientTitle);

    sHtml +=reportSubHeading("Job is one way?", nColCount);
    sHtml += reportHtmlRow(oJsonReport.isOneWay);

    sHtml +=reportSubHeading("Job involves a wheelchair?", nColCount);
    sHtml += reportHtmlRow(oJsonReport.involvesWheelchair);

    sHtml +=reportSubHeading("Type of destination", nColCount);
    sHtml += reportHtmlRow(oJsonReport.typeOfDestination);

    //
    // And now just finish off
    //

    sHtml    += '    </table>                  \r\n'
              + '</body>                       \r\n'
              + '</html>                       \r\n';

    return sHtml;
}

//
// reportSubHeading
//
function reportSubHeading(sSubHeading, nColCount)
{
    return '        <tr>                       \r\n'
    +      '            <td class="subheading" colspan="' + nColCount + '"> \r\n'
    +      '                ' + sSubHeading + '\r\n'
    +      '            </td>                  \r\n'
    +      '        </tr>                      \r\n';
}

//
// reportHtmlRow
//
function reportHtmlRow(arrSummaryRecords)
{
    var oRowHeadings = {};

    // Collect row headings from all periods
    for (var nPeriod = 0; nPeriod < arrSummaryRecords.length; ++nPeriod)
    {
        var arrHeadings = Object.keys(arrSummaryRecords[nPeriod]);
        
        for (var nHeading = 0; nHeading < arrHeadings.length; ++nHeading)
        {
            var sHeading = arrHeadings[nHeading];
            oRowHeadings[sHeading] = sHeading;
        }
    }

    var arrRowHeadings = sortRowHeaders(oRowHeadings);

    var sHtml = '';

    for (var nRow = 0; nRow < arrRowHeadings.length; ++nRow)
    {
        var sRowHeading = arrRowHeadings[nRow];
        sHtml += '        <tr>\r\n'
        sHtml += '            <td class="firstColumn">' + sRowHeading + '</td>\r\n';

        for (var nPeriod = 0; nPeriod < arrSummaryRecords.length; ++nPeriod)
        {
            var oRows = arrSummaryRecords[nPeriod];
            var nValue = 0;

            if (typeof oRows[sRowHeading] != 'undefined')
            {
                nValue = oRows[sRowHeading];
            }

            sHtml += '            <td>' + nValue + '</td>\r\n';
        }

        sHtml += '        </tr>\r\n';
    }

    return sHtml;
}

//
// reverseDateFormat
//
function reverseDateFormat(sDate)
{
    return sDate.split('/').reverse().join('/');
}

