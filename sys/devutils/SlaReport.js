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
    uniqueClients      : [],
    jobStatus          : [],
    clientTitle        : [],
    isOneWay           : [],
    involvesWheelchair : [],
    typeOfDestination  : [],
    purposeOfJourney   : []
};

reportGeneratePeriod('2014/04/01', '2014/06/30', oJsonReport, simpleSelectSql);
reportGeneratePeriod('2014/07/01', '2014/09/30', oJsonReport, simpleSelectSql);
reportGeneratePeriod('2014/10/01', '2014/12/31', oJsonReport, simpleSelectSql);

reportUniqueClients(oJsonReport, simpleSelectSql);

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
// getPeriodSubQuery
//
function getPeriodSubQuery(sPeriodStart, sPeriodEnd)
{
    return '(JobAppointmentDateTime > #' + sPeriodStart + ' 00:00# AND JobAppointmentDateTime < #' + sPeriodEnd + ' 23:59#)';
}

//
// reportGeneratePeriod
//
function reportGeneratePeriod(sPeriodStart, sPeriodEnd, oJsonReport, selectSql)
{
    oJsonReport.periodStart.push(sPeriodStart);
    oJsonReport.periodEnd.push(sPeriodEnd);

    var sPeriodSubQuery = getPeriodSubQuery(sPeriodStart, sPeriodEnd);

    var sStatusQuery = 'SELECT status FROM jobs WHERE ' + sPeriodSubQuery;

    var oResult = selectSql(sStatusQuery);

    oJsonReport.jobStatus.push(reportCountValues(oResult.records, 'status'));

    var sSql = 'SELECT JobIsDVOWheelchair OR Clients.IsWheelchair AS Wheelchair, IsJobOneWay, Clients.Title, Clients.Firstname, Clients.Surname, Destinations.TypeID AS DestinationTypeID'
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

    for (var nJob = 0; nJob < oResult.records.length; ++nJob)
    {
        var sTitle = oResult.records[nJob]['Title'];

        // If title does not imply gender...
        if (sTitle != 'Mr.' && sTitle != 'Mrs.' && sTitle != 'Miss.' && sTitle != 'Ms.')
        {
            // ...we need to display the clients name in the report...
            var sFirstname = oResult.records[nJob]['Firstname'];
            var sSurname = oResult.records[nJob]['Surname'];
            
            // ...but it does need to be asterisked out while we're still discussing the report via e-mail
            var sFullName = [sTitle, asterisk(sFirstname), asterisk(sSurname)].join(' ');

            oSummaryOfClientTitles[sTitle] += '<BR/> ' + sFullName;
        }
    }

    combineSummaryRecords(oSummaryOfClientTitles, ['Mrs.', 'Miss.', 'Ms.'], '');
    oJsonReport.clientTitle.push(oSummaryOfClientTitles);

    var oSummaryIsJobOneWay = reportCountValues(oResult.records, 'IsJobOneWay');
    oSummaryIsJobOneWay['Total client journey-legs'] = oSummaryIsJobOneWay['Yes'] + (2 * oSummaryIsJobOneWay['No']);
    oJsonReport.isOneWay.push(oSummaryIsJobOneWay);
    oJsonReport.involvesWheelchair.push(reportCountValues(oResult.records, 'Wheelchair'));

    var oSummaryDestinations = reportCountValues(oResult.records, 'DestinationTypeID');
    var oPurposeOfJourney = JSON.parse(JSON.stringify(oSummaryDestinations)); // Clone oSummaryDestinations
    oJsonReport.typeOfDestination.push(oSummaryDestinations);

    combineSummaryRecords(oPurposeOfJourney, ['Shops', 'Social/Leisure', 'Visiting'], 'Shopping/Social');
    combineSummaryRecords(oPurposeOfJourney, ['Primary Medical Care', 'Secondary Medical Care'], 'Medical/Hospital');
    combineSummaryRecords(oPurposeOfJourney, ['Miscellaneous', '- New Destination -'], 'Other');
    oJsonReport.purposeOfJourney.push(oPurposeOfJourney);
}

//
// reportUniqueClients
//
function reportUniqueClients(oJsonReport, selectSql)
{
    var sSql = 'SELECT COUNT(ClientID) FROM Clients WHERE ClientID IN (SELECT ClientID FROM jobs WHERE ';

    var arrPeriodSubQueries = [];
    for (var nPeriod = 0; nPeriod < oJsonReport.periodStart.length; ++nPeriod)
    {
        var sPeriodSubQuery = getPeriodSubQuery(oJsonReport.periodStart[nPeriod], oJsonReport.periodEnd[nPeriod]);
        arrPeriodSubQueries.push(sPeriodSubQuery);

        var oResult = selectSql(sSql + sPeriodSubQuery + ')');
        var oRecord = oResult['records'][0];
        var nUniqueClients = oRecord[Object.keys(oRecord)[0]];
        oJsonReport.uniqueClients.push(nUniqueClients);
    }

    var oResult = selectSql(sSql + arrPeriodSubQueries.join(' OR ') + ')');
    var oRecord = oResult['records'][0];
    var nUniqueClients = oRecord[Object.keys(oRecord)[0]];
    oJsonReport.uniqueClients.push(nUniqueClients);
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
        'Other',
        'Total',
        'Total client journey-legs'
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
    var nColCount = oJsonReport.periodStart.length + 2;

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
              + '            vertical-align: top;       \r\n'
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
        sHtml += '            <th>' + sPeriod + '</th>           \r\n';
    }

    sHtml += '            <th>Total</th>                         \r\n';
    sHtml += '        </tr>                                      \r\n';

    //
    // Done displaying time periods
    //

    sHtml += reportSubHeading('Number of clients travelling at least once', nColCount);

    sHtml += '        <tr>\r\n'
    sHtml += '            <td class="firstColumn">Number of clients travelling at least once</td>\r\n';
    for (var nPeriod = 0; nPeriod < oJsonReport.uniqueClients.length; ++nPeriod)
    {
        sHtml += '            <td>' + oJsonReport.uniqueClients[nPeriod] + '</td>\r\n';
    }
    sHtml += '        </tr>\r\n'

    sHtml += reportSubHeading('Jobs in period', nColCount);
    sHtml += reportHtmlRow(oJsonReport.jobStatus);

    sHtml += reportSubHeading('Now considering only "Closed" jobs', nColCount);

    sHtml += reportSubHeading("Client's title", nColCount);
    sHtml += reportHtmlRow(oJsonReport.clientTitle);

    sHtml += reportSubHeading("Job is one way?", nColCount);
    sHtml += reportHtmlRow(oJsonReport.isOneWay);

    sHtml += reportSubHeading("Job involves a wheelchair?", nColCount);
    sHtml += reportHtmlRow(oJsonReport.involvesWheelchair);

    sHtml += reportSubHeading("Type of destination", nColCount);
    sHtml += reportHtmlRow(oJsonReport.typeOfDestination);

    sHtml += reportSubHeading("Purpose of journey", nColCount);
    sHtml += reportHtmlRow(oJsonReport.purposeOfJourney);

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

        var nTotal = 0;

        for (var nPeriod = 0; nPeriod < arrSummaryRecords.length; ++nPeriod)
        {
            var oRows = arrSummaryRecords[nPeriod];
            var nValue = 0;

            if (typeof oRows[sRowHeading] != 'undefined')
            {
                nValue = oRows[sRowHeading];
            }

            sHtml += '            <td>' + nValue + '</td>\r\n';

            var sSplit = nValue.toString().split('<BR');
            if (sSplit.length > 1)
            {
                nValue = parseInt(sSplit[0]);
            }

            nTotal += nValue;
        }

        sHtml += '            <td>' + nTotal + '</td>\r\n';
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

//
// asterisk
//

function asterisk(s)
{
    return Array(s.length + 1).join('*');
}

