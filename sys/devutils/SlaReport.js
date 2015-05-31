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

report('2014/04/01', '2014/06/30', oJsonReport, simpleSelectSql);
report('2014/07/01', '2014/09/30', oJsonReport, simpleSelectSql);
report('2014/10/01', '2014/12/31', oJsonReport, simpleSelectSql);

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
// report
//
function report(sPeriodStart, sPeriodEnd, oJsonReport, selectSql)
{
    oJsonReport.periodStart.push(sPeriodStart);
    oJsonReport.periodEnd.push(sPeriodEnd);

    var sPeriodSubQuery = 'JobAppointmentDateTime > #' + sPeriodStart + ' 00:00# AND JobAppointmentDateTime < #' + sPeriodEnd + ' 23:59#';

    var sStatusQuery = 'SELECT status FROM jobs WHERE ' + sPeriodSubQuery;

    var oResult = selectSql(sStatusQuery);

    oJsonReport.jobStatus.push(reportCount(oResult.records, 'status'));

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

    oJsonReport.clientTitle.push(reportCount(oResult.records, 'Title'));
    oJsonReport.isOneWay.push(reportCount(oResult.records, 'IsJobOneWay'));
    oJsonReport.involvesWheelchair.push(reportCount(oResult.records, 'Wheelchair'));
    oJsonReport.typeOfDestination.push(reportCount(oResult.records, 'DestinationTypeID'));
}

function reportCount(arrRecords, sFieldname)
{
    var oResult = {};

    for (var n = 0; n < arrRecords.length; ++n)
    {
        var sFieldvalue = arrRecords[n][sFieldname];

        if (typeof oResult[sFieldvalue] == 'undefined')
        {
            oResult[sFieldvalue] = 1;
        }
        else
        {
            ++oResult[sFieldvalue];
        }
    }

    var nFemaleTitleCount = 0;
    var arrFemaleTitlesPresent = [];
    var arrFemaleTitles = ['Mrs.', 'Ms.', 'Miss'];

    for (var n = 0; n < arrFemaleTitles.length; ++n)
    {
        var sTitle = arrFemaleTitles[n];

        if (typeof oResult[sTitle] != 'undefined')
        {
            nFemaleTitleCount += oResult[sTitle];
            arrFemaleTitlesPresent.push(sTitle);
            delete oResult[sTitle];
        }
    }

    var sFemaleTitles = arrFemaleTitlesPresent.join('/');

    if (nFemaleTitleCount > 0)
    {
        oResult[sFemaleTitles] = nFemaleTitleCount;
    }

    oResult['Total'] = arrRecords.length;

    var arrRows = [];

    for (var sFieldvalue in oResult)
    {
        var sFirstCell = '';

        if (sFieldvalue == 'true' || sFieldvalue == '65535')
        {
            sFirstCell = 'Yes';
        }
        else if (sFieldvalue == 'false' || sFieldvalue == '0')
        {
            sFirstCell = 'No';
        }
        else
        {
            sFirstCell = sFieldvalue;
        }

        var sSecondCell = oResult[sFieldvalue];

        arrRows.push([sFirstCell, sSecondCell]);
    }

    return arrRows.sort(function(row1, row2)
    {
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

        var n1 = arrSpecialOrdering.indexOf(row1[0]);
        var n2 = arrSpecialOrdering.indexOf(row2[0]);
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
        else if (row1[0] < row2[0])
        {
            return -1;
        }
        else if (row1[0] > row2[0])
        {
            return 1;
        }
        else
        {
            return 0;
        }
    });
}

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

function reportSubHeading(sSubHeading, nColCount)
{
    return '        <tr>                       \r\n'
    +      '            <td class="subheading" colspan="' + nColCount + '"> \r\n'
    +      '                ' + sSubHeading + '\r\n'
    +      '            </td>                  \r\n'
    +      '        </tr>                      \r\n';
}

function reportHtmlRow(oSummaryItem)
{
    var arrRowHeadings = [];

    for (var nPeriod = 0; nPeriod < oSummaryItem.length; ++nPeriod)
    {
        var arr = [];
        var oRows = oSummaryItem[nPeriod];
        
        for (var nRow = 0; nRow < oRows.length; ++nRow)
        {
            arr.push(oRows[nRow][0]);
        }

        arrRowHeadings = merge(arr, arrRowHeadings);
    }

    var sHtml = '';

    for (var nRow = 0; nRow < arrRowHeadings.length; ++nRow)
    {
        var sHeading = arrRowHeadings[nRow];
        sHtml += '        <tr>\r\n'
        sHtml += '            <td class="firstColumn">' + sHeading + '</td>\r\n';

        for (var nPeriod = 0; nPeriod < oSummaryItem.length; ++nPeriod)
        {
            var oRows = oSummaryItem[nPeriod];
            var nValue = 0;

            for (var nRow2 = 0; nRow2 < oRows.length; ++nRow2)
            {

                if (oRows[nRow2][0] == sHeading)
                {
                    nValue = oRows[nRow2][1];
                }
            }

            sHtml += '            <td>' + nValue + '</td>\r\n';
        }

        sHtml += '        </tr>\r\n';
    }

    return sHtml;
}

function merge(arr1, arr2)
{
    var arrMerged = [];

    var n1 = 0;
    var n2 = 0;

    while (n1 < arr1.length || n2 < arr2.length)
    {
        if (n1 >= arr1.length)
        {
            arrMerged.push(arr2[n2]);
            ++n2;
        }
        else if (n2 >= arr2.length)
        {
            arrMerged.push(arr1[n1]);
            ++n1;
        }
        else if (arr1[n1] == arr2[n2])
        {
            arrMerged.push(arr1[n1]);
            ++n1;
            ++n2;
        }
        else
        {
            var n1in2 = arr2.indexOf(arr1[n1], n2);
            var n2in1 = arr1.indexOf(arr2[n2], n1);

            if (n1in2 - n2 > n2in1 - n1)
            {
                arrMerged.push(arr2[n2]);
                ++n2;
            }
            else
            {
                arrMerged.push(arr1[n1]);
                ++n1;
            }
        }
    }

    return arrMerged;
}

function reverseDateFormat(sDate)
{
    return sDate.split('/').reverse().join('/');
}

