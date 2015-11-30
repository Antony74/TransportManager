///<reference path='../interface/node.d.ts' />

function generateReport(dateFrom, dateTo, coreApi, fnDone)
{
    var utils = require('./ReportingUtils.js');

    var sPeriodStart = utils.formatdate(dateFrom);
    var sPeriodEnd   = utils.formatdate(dateTo);

    var sPeriodSubQuery = utils.getPeriodSubQuery(sPeriodStart, sPeriodEnd);

    var sSql = 'SELECT JobID, Notes FROM jobs'
             + ' WHERE status="Cancelled" AND ' + sPeriodSubQuery + ' ORDER BY JobEntryDateTime';

    utils.simpleSelectSql(sSql, coreApi, fnFailed, function(oResult)
    {

        var sHtml = '<!DOCTYPE html>                             \r\n'
                  + '<html>                                      \r\n'
                  + '<head>                                      \r\n'
                  + '    <title>DVC - Cancellation List Report</title> \r\n'
                  + '    <style>                                 \r\n'
                  + '        table, td, th                       \r\n'
                  + '        {                                   \r\n'
                  + '            border: 1px solid black;        \r\n'
                  + '            border-collapse: collapse;      \r\n'
                  + '            padding: 5px;                   \r\n'
                  + '        }                                   \r\n'
                  + '        th                                  \r\n'
                  + '        {                                   \r\n'
                  + '            background-color: lightgray;    \r\n'
                  + '            vertical-align: center;         \r\n'
                  + '        }                                   \r\n'
                  + '    </style>                                \r\n'
                  + '</head>                                     \r\n'
                  + '<body>                                      \r\n'
                  + '    <table>                                 \r\n'
                  + '        <TR>                                \r\n'
                  + '            <TH>JobID</TH>                  \r\n'
                  + '            <TH>Notes</TH>                  \r\n'
                  + '            <TH>By<BR>client</TH>           \r\n'
                  + '            <TH>By<BR>hospital</TH>         \r\n'
                  + '            <TH>Not<BR>enough<BR>notice</TH>\r\n'
                  + '            <TH>Unable<BR>to find<BR>driver</TH> \r\n'
                  + '            <TH>Operator<BR>error</TH>      \r\n'
                  + '        </TR>                               \r\n';


        for (var nRow = 0; nRow < oResult['records'].length; ++nRow)
        {
            var sJobID = oResult['records'][nRow]['JobID'];
            var sNotes = oResult['records'][nRow]['Notes'];

            sHtml += '<TR>\r\n'
            sHtml += '    <TD>' + sJobID + '</TD>\r\n';
            sHtml += '    <TD>' + sNotes + '</TD>\r\n';
            sHtml += '    <TD>&nbsp;</TD>        \r\n';
            sHtml += '    <TD>&nbsp;</TD>        \r\n';
            sHtml += '    <TD>&nbsp;</TD>        \r\n';
            sHtml += '    <TD>&nbsp;</TD>        \r\n';
            sHtml += '    <TD>&nbsp;</TD>        \r\n';
            sHtml += '</TR>\r\n';
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

