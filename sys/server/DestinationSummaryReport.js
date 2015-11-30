///<reference path='../interface/node.d.ts' />

function generateReport(dateFrom, dateTo, coreApi, fnDone)
{
    var utils = require('./ReportingUtils.js');

    var sPeriodStart = utils.formatdate(dateFrom);
    var sPeriodEnd   = utils.formatdate(dateTo);

    var sPeriodSubQuery = utils.getPeriodSubQuery(sPeriodStart, sPeriodEnd);

    var sSql = 'SELECT DestinationLevel2'
                + ' FROM ((jobs'
                + ' INNER JOIN Destinations ON jobs.DestinationID = Destinations.DestinationID)'
                + ' INNER JOIN DestinationType ON Destinations.TypeID = DestinationType.DestinationTypeID)'
                + ' WHERE status="Closed" AND ' + sPeriodSubQuery;

    utils.simpleSelectSql(sSql, coreApi, fnFailed, function(oResult)
    {
        var arrRecords = oResult['records'];

        var oSummaryRecord = {};

        for (var n = 0; n < arrRecords.length; ++n)
        {
            var sThingToCount = arrRecords[n]['DestinationLevel2'];

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

        var arrSummary = [];

        for (var sHeading in oSummaryRecord)
        {
            arrSummary.push({sDestination: sHeading, nCount: oSummaryRecord[sHeading]});
        }

        arrSummary.sort(function(a,b)
        {
            return b.nCount - a.nCount;
        });

        var sHtml = '<!DOCTYPE html>                             \r\n'
                  + '<html>                                      \r\n'
                  + '<head>                                      \r\n'
                  + '    <title>DVC - Destination Summary Report</title> \r\n'
                  + '    <style>                                 \r\n'
                  + '        table, td, th                       \r\n'
                  + '        {                                   \r\n'
                  + '            border: 1px solid black;        \r\n'
                  + '            border-collapse: collapse;      \r\n'
                  + '            padding: 5px;                   \r\n'
                  + '            vertical-align: top;            \r\n'
                  + '        }                                   \r\n'
                  + '        th, .firstColumn                    \r\n'
                  + '        {                                   \r\n'
                  + '            background-color: lightgray     \r\n'
                  + '        }                                   \r\n'
                  + '    </style>                                \r\n'
                  + '</head>                                     \r\n'
                  + '<body>                                      \r\n'
                  + '    <table>                                 \r\n';

        //
        // Display the time period that this report relates to
        //

        sHtml += '<tr><td class="firstColumn">&nbsp;</td> \r\n';

        var sPeriod = utils.reverseDateFormat(sPeriodStart) + ' - ' + utils.reverseDateFormat(sPeriodEnd);
        sHtml += '<th>' + sPeriod + '</th></tr>\r\n';

        for (var nRow = 0; nRow < arrSummary.length; ++nRow)
        {
            var sDestination = arrSummary[nRow].sDestination;
            var nCount       = arrSummary[nRow].nCount;

            sHtml += '<tr>\r\n'
            sHtml += '    <td class="firstColumn">' + sDestination + '</td>\r\n';
            sHtml += '    <td>' + nCount + '</td>\r\n';
            sHtml += '</tr>\r\n';
        }

        sHtml += '</table></body><html>\r\n';

        fnDone({output: sHtml});
    });

    //
    // fnFailed
    //
    function fnFailed(sMsg)
    {
        fnDone({Error:sMsg});
    }
}

exports.generateReport = generateReport;

