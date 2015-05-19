///<reference path='../interface/node.d.ts' />

var dface =  require('../server/node_modules/dface');
var sDatabaseFilename = __dirname + "/../../TransportManager.mdb";

console.log('\r\nDidcot Volunteer Centre\r\n\r\n');

// Cache the destination types
var oResult = selectSql('SELECT DestinationTypeID, DestinationLevel1 from DestinationType');

var oDestinationTypes = {};

for (var n = 0; n < oResult.records.length; ++n)
{
    var oRecord = oResult.records[n];
    oDestinationTypes[oRecord.DestinationTypeID] = oRecord.DestinationLevel1;
}
// Done caching the destination types

report('2014/04/01', '2014/06/30');
report('2014/07/01', '2014/09/30');
report('2014/10/01', '2014/12/31');

//
// selectSql - a simplification of what dface provides because in this context we don't need any of its flexibility
//
function selectSql(sSql)
{
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
function report(sPeriodStart, sPeriodEnd)
{
    console.log('Jobs in period ' + sPeriodStart + ' - ' + sPeriodEnd + ' (inclusive):');

    var sPeriodSubQuery = 'JobAppointmentDateTime > #' + sPeriodStart + ' 00:00# AND JobAppointmentDateTime < #' + sPeriodEnd + ' 23:59#';

    var sStatusQuery = 'SELECT status FROM jobs WHERE ' + sPeriodSubQuery;

    var oResult = selectSql(sStatusQuery);

    reportCount(oResult.records, 'status');

    console.log('(The rest of the report for this period only considers the "Closed" jobs)');

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

    console.log('');
    console.log("Client's title");
    reportCount(oResult.records, 'Title');
    console.log('Job is one way?');
    reportCount(oResult.records, 'IsJobOneWay');
    console.log('Job involves a wheelchair?');
    reportCount(oResult.records, 'Wheelchair');
    console.log('Type of destination');
    reportCount(oResult.records, 'DestinationTypeID');
    console.log('');
}

function reportCount(arrRecords, sFieldname)
{
    console.log('');

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

    var arrLines = [];

    for (var sFieldvalue in oResult)
    {
        var sLine = '';

        if (sFieldvalue == 'true' || sFieldvalue == '65535')
        {
            sLine = 'Yes';
        }
        else if (sFieldvalue == 'false' || sFieldvalue == '0')
        {
            sLine = 'No';
        }
        else
        {
            sLine = sFieldvalue;
        }

        sLine += ':';

        while (sLine.length < 24)
        {
            sLine += ' ';
        }

        arrLines.push('    ' + sLine + oResult[sFieldvalue]);
    }

    if (arrLines.length >= 2)
    {
        if (arrLines[0].indexOf('Cancelled:') != -1 || arrLines[0].indexOf('No:') != -1)
        {
            var swap = arrLines[0];
            arrLines[0] = arrLines[1];
            arrLines[1] = swap;
        }
    }

    if (arrLines.length >= 3 && sFemaleTitles.length)
    {
        if (arrLines[2].indexOf(sFemaleTitles) != -1)
        {
            var swap = arrLines[1];
            arrLines[1] = arrLines[2];
            arrLines[2] = swap;
        }
    }

    for (var n = 0; n < arrLines.length; ++n)
    {
        console.log(arrLines[n]);
    }

    console.log('');
}

