
function generateReport(dateFrom, dateTo, bSummaryOnly, coreApi, fnDone)
{
    function fnFailed(sMsg)
    {
        fnDone({Error:sMsg});
    }

    var utils = require('./ReportingUtils.js');
    var dateUtil = require('../htdocs/initialiseDateTimePickers.js');

    var sPeriodSubQuery = utils.getPeriodSubQuery(utils.formatdate(dateFrom), utils.formatdate(dateTo));

    var sSql = 'SELECT Drivers.DriverID, Drivers.Title, Drivers.Firstname, Drivers.Surname, JobPickUpDateTime, Clients.Title, Clients.Firstname, Clients.Initial, Clients.Surname, Clients.Postcode, Destinations.Name AS DestinationName'
             + ' FROM (((jobs'
             + ' INNER JOIN Drivers ON jobs.DriverID = Drivers.DriverID)'
             + ' INNER JOIN Clients ON jobs.ClientID = Clients.ClientID)'
             + ' INNER JOIN Destinations ON jobs.DestinationID = Destinations.DestinationID)'
             + ' WHERE status="Closed" AND ' + sPeriodSubQuery
             + ' ORDER BY Drivers.Surname, Drivers.FirstName, JobPickUpDateTime';

    utils.simpleSelectSql(sSql, coreApi, fnFailed, function(oResult)
    {
        // First pass, count number of drives for each driver
        var oDriverToDriveCount = {};

        for (var nRecord = 0; nRecord < oResult['records'].length; ++nRecord)
        {
            var nDriverID = oResult['records'][nRecord]['DriverID'];

            if (typeof oDriverToDriveCount[nDriverID] == 'undefined')
            {
                oDriverToDriveCount[nDriverID] = 1;
            }
            else
            {
                ++oDriverToDriveCount[nDriverID];
            }
        }

        // Second pass generate report

        var sHtml = '<!DOCTYPE html>                           \r\n'
                  + '<html>                                    \r\n'
                  + '<head>                                    \r\n'
                  + '    <title>Driver Activity Report</title> \r\n'
                  + '    <style>                               \r\n'
                  + '        table, td, th                     \r\n'
                  + '        {                                 \r\n'
                  + '            border: 1px solid black;      \r\n'
                  + '            border-collapse: collapse;    \r\n'
                  + '            padding: 5px;                 \r\n'
                  + '            vertical-align: top;          \r\n'
                  + '        }                                 \r\n'
                  + '        th, .firstColumn                  \r\n'
                  + '        {                                 \r\n'
                  + '            background-color: lightgray   \r\n'
                  + '        }                                 \r\n'
                  + '        .subheading                       \r\n'
                  + '        {                                 \r\n'
                  + '            font-weight: bold;            \r\n'
                  + '            background-color: yellow      \r\n'
                  + '        }                                 \r\n'
                  + '    </style>                              \r\n'
                  + '</head>                                   \r\n'
                  + '<body>                                    \r\n';

        sHtml += '<table>\r\n';

        var nPreviousDriverID = -1;

        for (nRecord = 0; nRecord < oResult['records'].length; ++nRecord)
        {
            var oRecord = oResult['records'][nRecord];

            if (oRecord['DriverID'] != nPreviousDriverID)
            {
                if (nPreviousDriverID != -1 && !bSummaryOnly)
                {
                    sHtml += '</TD></TR></table>\r\n';
                }

                sHtml += '<TR>\r\n';

                sHtml += '<TD><B>Driver name:</B></TD>';
                sHtml += '<TD>' + oRecord['Drivers.Title'] + ' ' + oRecord['Drivers.Firstname'] + ' ' + oRecord['Drivers.Surname'] + '</TD>';
                sHtml += '<TD><B>Journeys:</B></TD>';
                sHtml += '<TD>' + oDriverToDriveCount[oRecord['DriverID']] + '</TD>';

                sHtml += '</TR>';

                if (!bSummaryOnly)
                {
                    sHtml += '<TR><TD colspan="4" style="padding:0px">\r\n';

                    sHtml += '<table style="width:100%">\r\n';
                    sHtml += '<TH>Date</TH><TH>Client Name</TH><TH>Postcode</TH><TH>Destination</TH></TR>\r\n';
                }

                nPreviousDriverID = oRecord['DriverID'];
            }

            var sClientName = oRecord['Clients.Title'] + ' ' + oRecord['Clients.Firstname'] + ' ' + oRecord['Initial'] + ' ' + oRecord['Clients.Surname'];
            var jobDate = new Date(oRecord['JobPickUpDateTime']);

            if (!bSummaryOnly)
            {
                sHtml += '<TR>';
                sHtml += '    <TD>' + dateUtil.getDDMMYYYY(jobDate) + '</TD>';
                sHtml += '    <TD>' + sClientName + '</TD>';
                sHtml += '    <TD>' + oRecord['Postcode'] + '</TD>';
                sHtml += '    <TD>' + oRecord['DestinationName'] + '</TD>';
                sHtml += '</TR>';
            }
        }

        sHtml += '</TD></TR></table>\r\n';
        sHtml += '</body>\r\n';
        sHtml += '</html>\r\n';

        fnDone({output: sHtml});
    });

}

exports.generateReport = generateReport;

