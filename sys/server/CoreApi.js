///<reference path='../interface/node.d.ts' />

var platform = require('./UsingMSJet4.js');

function selectSql(query, startRecord, schemaLevel, fnDone)
{
    var nStartRecord = parseInt(startRecord, 10);
    var nSchemaLevel = parseInt(schemaLevel, 10);

    if (isNaN(nStartRecord))
    {
        nStartRecord = 0;
    }

    if (isNaN(nSchemaLevel))
    {
        nSchemaLevel = 0;
    }

    var oOutput = platform.selectSql(
    {
        'query'       : query,
        'startRecord' : nStartRecord,
        'schemaLevel' : nSchemaLevel
    });
            
	fnDone(oOutput);
}

function getIndices(fnDone)
{
    var oOutput = platform.getIndices();
	fnDone(oOutput);
}

function updateDatabase(arrPostedData, fnDone)
{
	if (!Array.isArray(arrPostedData))
	{
		var oTheError = {'Error': 'UpdateDatabase expected an array'};
		fnDone(oTheError);
	}
	else
	{
		var oOutput = platform.updateDatabase(arrPostedData);
		fnDone(oOutput);
	}
}

function report_sla(arrSpans, fnDone)
{
    var oSlaReport = require('./SlaReport.js');
    oSlaReport.generateReport(arrSpans, exports, fnDone);
}

function report_DriverActivity(dateFrom, dateTo, bSummaryOnly, fnDone)
{
    var oDriverActivityReport = require('./DriverActivityReport.js');
    oDriverActivityReport.generateReport(dateFrom, dateTo, bSummaryOnly, exports, fnDone);
}

function report_DestinationSummary(dateFrom, dateTo, fnDone)
{
    var oDestinationReport = require('./DestinationSummaryReport.js');
    oDestinationReport.generateReport(dateFrom, dateTo, exports, fnDone);
}

exports.selectSql      = selectSql;
exports.getIndices     = getIndices;
exports.updateDatabase = updateDatabase;
exports.report_sla = report_sla;
exports.report_DriverActivity = report_DriverActivity;
exports.report_DestinationSummary = report_DestinationSummary;

