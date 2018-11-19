
function generateReport(arrSpans, coreApi, fnDone) {

    var utils = require('./ReportingUtils.js');

    var sLog = '';

    var arrAgeThresholds = [60, 80]; // This configures what age-ranges we report upon

    //
    // Calculate date thresholds (use start of first span for consistency)
    //

    var arrDateThresholds = [];

    for (var n = 0; n < arrAgeThresholds.length; ++n) {

        var dateThreshold = new Date(arrSpans[0].dateFrom);
        dateThreshold.setFullYear(dateThreshold.getFullYear() - arrAgeThresholds[n]);
        arrDateThresholds.push(dateThreshold);
    }

    //
    // Cache the destination types
    //

    var sSql = 'SELECT DestinationType.ID as DestinationTypeID, '
             + 'DestinationType.Description AS DestinationType, '
             + 'DestinationCategory.Description AS Purpose '
             + 'FROM DestinationType INNER JOIN DestinationCategory ON DestinationType.CategoryID = DestinationCategory.ID';

    utils.simpleSelectSql(sSql, coreApi, fnFailed, function(oResult) {

        var oDestinationTypes = {};

        for (var n = 0; n < oResult.records.length; ++n) {
            var oRecord = oResult.records[n];
            oDestinationTypes[oRecord.DestinationTypeID] = oRecord;
        }

        //
        // Generate report
        //

        var oJsonReport = {
            periodStart        : [],
            periodEnd          : [],
            uniqueClients      : [],
            clientGender       : [],
            clientAge          : [],
            jobStatus          : [],
            isOneWay           : [],
            involvesWheelchair : [],
            typeOfDestination  : [],
            purposeOfJourney   : []
        };

        function nextSpan() {

            if (arrSpans.length) {

                var oSpan = arrSpans.shift();

                reportGeneratePeriod(utils.formatdate(oSpan.dateFrom), utils.formatdate(oSpan.dateTo), oJsonReport, fnFailed, nextSpan, oDestinationTypes);

            } else {

                reportUniqueClients(oJsonReport, fnFailed, function() {

                    if (sLog == '') {
                        sLog = '&nbsp;';
                    }

                    fnDone({output: reportHtml(oJsonReport), log: sLog});
                });
            }
        }

        nextSpan();
    });

    //
    // reportGeneratePeriod
    //
    function reportGeneratePeriod(sPeriodStart, sPeriodEnd, oJsonReport, fnFailed, fnDone, oDestinationTypes) {

        oJsonReport.periodStart.push(sPeriodStart);
        oJsonReport.periodEnd.push(sPeriodEnd);

        var sPeriodSubQuery = utils.getPeriodSubQuery(sPeriodStart, sPeriodEnd);

        utils.queryJobOutcomes(coreApi, sPeriodStart, sPeriodEnd, fnFailed, function(oResult) {

            oJsonReport.jobStatus.push(reportCountValues(oResult.records, 'Outcome'));

            var sSql = 'SELECT DVCWheelChairNeeded OR Client.isWheelchair AS Wheelchair,'
                     + ' Destination.DestinationTypeID AS DestinationTypeID,'
                     + ' jobs.JobID'
                     + ' FROM (((jobs'
                     + ' INNER JOIN Client ON jobs.ClientID = Client.ClientID)'
                     + ' INNER JOIN JobLegs ON jobs.JobID = JobLegs.JobID)'
                     + ' INNER JOIN JobAttribute ON jobs.JobID = JobAttribute.JobID)'
                     + ' LEFT JOIN Destination ON JobLegs.DestinationEndID = Destination.DestinationID'
                     + ' WHERE JobAttribute.AttributeID=57 AND (' + sPeriodSubQuery + ')';

            utils.simpleSelectSql(sSql, coreApi, fnFailed, utils.createDedupeFn(function(oResult) {

                for (var n = 0; n < oResult.records.length; ++n) {
                    var oRecord = oResult.records[n];
                    var oType = oDestinationTypes[oRecord.DestinationTypeID];
                    if (oType) {
                        oRecord.DestinationType = oType.DestinationType;
                        oRecord.Purpose = oType.Purpose;
                    } else {
                        oRecord.DestinationType = oRecord.DestinationTypeID;
                        oRecord.Purpose = oRecord.DestinationTypeID;
                    }
                }

                var oSummaryIsJobOneWay = reportCountValues(oResult.records, 'IsJobOneWay');

                var nOneWayYes = ('Yes' in oSummaryIsJobOneWay) ? oSummaryIsJobOneWay['Yes'] : 0;
                var nOneWayNo  = ('No'  in oSummaryIsJobOneWay) ? oSummaryIsJobOneWay['No'] : 0;

                oSummaryIsJobOneWay['Total client journey-legs'] = nOneWayYes + (2 * nOneWayNo);

                oJsonReport.isOneWay.push(oSummaryIsJobOneWay);
                oJsonReport.involvesWheelchair.push(reportCountValues(oResult.records, 'Wheelchair'));

                oJsonReport.typeOfDestination.push(reportCountValues(oResult.records, 'DestinationType'));
                oJsonReport.purposeOfJourney.push(reportCountValues(oResult.records, 'Purpose'));
                
                fnDone();
            }));
        });
    }

    //
    // reportUniqueClients
    //
    function reportUniqueClients(oJsonReport, fnFailed, fnDone) {

        var sSql = 'SELECT ClientID, Title.Description as Title, DateofBirth, Forename, Middlename, Surname FROM (Client'
                 + ' INNER JOIN Title ON Client.TitleID = Title.ID)'
                 + ' WHERE Client.ClientID IN (SELECT ClientID FROM jobs WHERE ';

        var arrPeriodSubQueries = [];
        for (var nPeriod = 0; nPeriod < oJsonReport.periodStart.length; ++nPeriod) {

            var sPeriodSubQuery = utils.getPeriodSubQuery(oJsonReport.periodStart[nPeriod], oJsonReport.periodEnd[nPeriod]);
            arrPeriodSubQueries.push(sPeriodSubQuery);
        }

        subquery();

        function subquery() {

            if (arrPeriodSubQueries.length) {

                var sSubquery = arrPeriodSubQueries.shift();

                utils.simpleSelectSql(sSql + sSubquery + ')', coreApi, fnFailed, function(oResult) {

                    function getFullName(oRecord) {
                        var arr = [];
                        
                        function push(sFieldname) {
                            if (oRecord[sFieldname]) {
                                arr.push(oRecord[sFieldname]);
                            }
                        }

                        push('Title');
                        push('Firstname');
                        push('Initial');
                        push('Surname');

                        return arr.join(' ');
                    }

                    for (var nRecord = 0; nRecord < oResult.records.length; ++nRecord) {
                        var sTitle = oResult.records[nRecord]['Title'];

                        if (sTitle === 'Mr.' || sTitle === 'Dr.' || sTitle === 'Revd.') {
                            oResult.records[nRecord]['Gender'] = 'M';
                        } else if (sTitle == 'Mrs.' || sTitle == 'Miss' || sTitle == 'Ms.' || sTitle == 'Revd Ms' || sTitle == 'Dr Ms') {
                            oResult.records[nRecord]['Gender'] = 'F';
                        } else {
                            oResult.records[nRecord]['Gender'] = 'Unknown';

                            sLog += '<A href="#' + oResult.records[nRecord]['ClientID'] + '">';
                            sLog += 'Could not infer gender of ' + getFullName(oResult.records[nRecord]);
                            sLog += '</A><BR>\n';
                        }

                        // Find age-band
                        var dob = new Date(oResult.records[nRecord]['DateofBirth']);

                        if (oResult.records[nRecord]['DateofBirth'] == null) {

                            oResult.records[nRecord]['AgeBand'] = 'Unknown';

                            sLog += '<A href="#' + oResult.records[nRecord]['ClientID'] + '">';
                            sLog += 'No date of birth for ' + getFullName(oResult.records[nRecord]);
                            sLog += '</A><BR>\n';

                        } else if (dob <= arrDateThresholds[arrDateThresholds.length - 1]) {

                            oResult.records[nRecord]['AgeBand'] = arrAgeThresholds[arrAgeThresholds.length - 1] + '+';

                        } else {

                            for (var nThreshold = 0; nThreshold < arrDateThresholds.length; ++nThreshold) {

                                if (dob > arrDateThresholds[nThreshold]) {

                                    if (nThreshold == 0) {

                                        oResult.records[nRecord]['AgeBand'] = 'Under ' + arrAgeThresholds[0];

                                    } else {

                                        oResult.records[nRecord]['AgeBand'] = arrAgeThresholds[nThreshold-1] + '-' + arrAgeThresholds[nThreshold];
                                    }
                                    break;
                                }
                            }
                        }
                    }
 
                    var oGenders = reportCountValues(oResult.records, 'Gender');
                    oJsonReport.clientGender.push(oGenders);

                    var oAgeBands = reportCountValues(oResult.records, 'AgeBand');
                    oJsonReport.clientAge.push(oAgeBands);

                    // We can use this total to fill in 'Number of clients travelling at least once'
                    oJsonReport.uniqueClients.push(oGenders['Total']);

                    subquery();
                });

            } else {
                fnDone();
            }
        }
    }

    //
    // reportCountValues
    //
    function reportCountValues(arrRecords, sFieldname) {

        var oSummaryRecord = {};

        for (var n = 0; n < arrRecords.length; ++n) {

            var sThingToCount = arrRecords[n][sFieldname];

            if (sThingToCount == true || sThingToCount == '65535' || sThingToCount == -1) {
                sThingToCount = 'Yes';
            } else if (sThingToCount == false || sThingToCount == '0') {
                sThingToCount = 'No';
            }

            if (typeof oSummaryRecord[sThingToCount] == 'undefined') {
                oSummaryRecord[sThingToCount] = 1;
            } else {
                ++oSummaryRecord[sThingToCount];
            }
        }

        oSummaryRecord['Total'] = arrRecords.length;

        return oSummaryRecord;
    }

    //
    // combineSummaryRecords
    //
    function combineSummaryRecords(oSummaryRecord, arrHeadingsToCombine, sCombinedHeading) {

        var nCombinedValue = 0;
        var arrHeadingsPresent = [];

        for (var n = 0; n < arrHeadingsToCombine.length; ++n) {

            var sHeading = arrHeadingsToCombine[n];

            if (typeof oSummaryRecord[sHeading] != 'undefined') {

                nCombinedValue += oSummaryRecord[sHeading];
                arrHeadingsPresent.push(sHeading);
                delete oSummaryRecord[sHeading];
            }
        }

        if (sCombinedHeading == '') {
            sCombinedHeading = arrHeadingsPresent.join('/');
        }

        if (nCombinedValue > 0) {
            oSummaryRecord[sCombinedHeading] = nCombinedValue;
        }
    }

    //
    // sortRowHeaders
    //
    function sortRowHeaders(rows) {

        // Perhaps we've been passed an object which needs to be converted to an array?
        if (!Array.isArray(rows)) {
            rows = Object.keys(rows);
        }

        var arrSpecialOrdering = [
            'Closed',
            'Primary Medical Care',
            'Secondary Medical Care',
            '*',
            'Yes',
            'No',
            'Dr.',
            'Miscellaneous',
            'Other'
        ];

        arrSpecialOrdering.push('Under ' + arrAgeThresholds[0]);

        for (var nThreshold = 1; nThreshold < arrAgeThresholds.length; ++nThreshold) {
            arrSpecialOrdering.push(arrAgeThresholds[nThreshold-1] + '-' + arrAgeThresholds[nThreshold]);
        }

        arrSpecialOrdering.push(arrAgeThresholds[arrAgeThresholds.length - 1] + '+');
        arrSpecialOrdering.push('Unknown');
        arrSpecialOrdering.push('Total');
        arrSpecialOrdering.push('Total client journey-legs');

        return rows.sort(function(row1, row2) {

            var n1 = arrSpecialOrdering.indexOf(row1);
            var n2 = arrSpecialOrdering.indexOf(row2);
            var nOther = arrSpecialOrdering.indexOf('*');

            if (n1 == -1) {
                n1 = nOther;
            }

            if (n2 == -1) {
                n2 = nOther;
            }

            if (n1 < n2) {
                return -1;
            } else if (n1 > n2) {
                return 1;
            } else if (row1 < row2) {
                return -1;
            } else if (row1 > row2) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    //
    // reportHtml
    //
    function reportHtml(oJsonReport) {

        var bShowTotals;
        var nColCount = oJsonReport.periodStart.length + 1;

        if (oJsonReport.periodStart.length <= 1) {
            bShowTotals = false;
        } else {
            bShowTotals = true;
            ++nColCount;
        }

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

        for (var n = 0; n < oJsonReport.periodStart.length; ++n) {
            var sPeriod = utils.reverseDateFormat(oJsonReport.periodStart[n]) + ' - ' + utils.reverseDateFormat(oJsonReport.periodEnd[n]);
            sHtml += '            <th>' + sPeriod + '</th>           \r\n';
        }

        if (bShowTotals) {

            sHtml += '            <th>Total</th>                     \r\n';
        }

        sHtml += '        </tr>                                      \r\n';

        //
        // Done displaying time periods
        //

        sHtml += reportSubHeading('Number of clients travelling at least once', nColCount);

        sHtml += '        <tr>\r\n';
        sHtml += '            <td class="firstColumn">Number of clients travelling at least once</td>\r\n';

        for (var nPeriod = 0; nPeriod < oJsonReport.uniqueClients.length; ++nPeriod) {

            sHtml += '            <td>' + oJsonReport.uniqueClients[nPeriod] + '</td>\r\n';
        }

        sHtml += '        </tr>\r\n';

        sHtml += reportSubHeading('Client gender', nColCount);
        sHtml += reportHtmlRow(oJsonReport.clientGender, bShowTotals);

        sHtml += reportSubHeading('Client age', nColCount);
        sHtml += reportHtmlRow(oJsonReport.clientAge, bShowTotals);

        sHtml += reportSubHeading('Jobs in period', nColCount);
        sHtml += reportHtmlRow(oJsonReport.jobStatus, bShowTotals);

        sHtml += reportSubHeading('Now considering only completed jobs', nColCount);

//        sHtml += reportSubHeading('Job is one way?', nColCount);
//        sHtml += reportHtmlRow(oJsonReport.isOneWay, bShowTotals);

        sHtml += reportSubHeading('Job involves a wheelchair?', nColCount);
        sHtml += reportHtmlRow(oJsonReport.involvesWheelchair, bShowTotals);

        sHtml += reportSubHeading('Type of destination', nColCount);
        sHtml += reportHtmlRow(oJsonReport.typeOfDestination, bShowTotals);

        sHtml += reportSubHeading('Purpose of journey', nColCount);
        sHtml += reportHtmlRow(oJsonReport.purposeOfJourney, bShowTotals);

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
    function reportSubHeading(sSubHeading, nColCount) {
        return '        <tr>                       \r\n'
        +      '            <td class="subheading" colspan="' + nColCount + '"> \r\n'
        +      '                ' + sSubHeading + '\r\n'
        +      '            </td>                  \r\n'
        +      '        </tr>                      \r\n';
    }

    //
    // reportHtmlRow
    //
    function reportHtmlRow(arrSummaryRecords, bShowTotals) {

        var oRowHeadings = {};

        // Collect row headings from all periods
        for (var nPeriod = 0; nPeriod < arrSummaryRecords.length; ++nPeriod) {

            var arrHeadings = Object.keys(arrSummaryRecords[nPeriod]);
        
            for (var nHeading = 0; nHeading < arrHeadings.length; ++nHeading) {
                var sHeading = arrHeadings[nHeading];
                oRowHeadings[sHeading] = sHeading;
            }
        }

        var arrRowHeadings = sortRowHeaders(oRowHeadings);

        var sHtml = '';

        for (var nRow = 0; nRow < arrRowHeadings.length; ++nRow) {

            var sRowHeading = arrRowHeadings[nRow];
            sHtml += '        <tr>\r\n';
            sHtml += '            <td class="firstColumn">' + sRowHeading + '</td>\r\n';

            var nTotal = 0;

            for (nPeriod = 0; nPeriod < arrSummaryRecords.length; ++nPeriod) {

                var oRows = arrSummaryRecords[nPeriod];
                var nValue = 0;

                if (typeof oRows[sRowHeading] != 'undefined') {

                    nValue = oRows[sRowHeading];
                }

                sHtml += '            <td>' + nValue + '</td>\r\n';

                var sSplit = nValue.toString().split('<BR');

                if (sSplit.length > 1) {
                    nValue = parseInt(sSplit[0]);
                }

                nTotal += nValue;
            }

            if (bShowTotals) {
                sHtml += '            <td>' + nTotal + '</td>\r\n';
            }

            sHtml += '        </tr>\r\n';
        }

        return sHtml;
    }

    //
    // fnFailed
    //
    function fnFailed(sMsg) {
        fnDone({Error:sMsg});
    }
}

exports.generateReport = generateReport;

