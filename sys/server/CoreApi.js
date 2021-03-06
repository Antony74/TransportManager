
var platform = require('./UsingMSJet4.js');

function selectSql(query, startRecord, schemaLevel, fnDone) {

    var nStartRecord = parseInt(startRecord, 10);
    var nSchemaLevel = parseInt(schemaLevel, 10);

    if (isNaN(nStartRecord)) {
        nStartRecord = 0;
    }

    if (isNaN(nSchemaLevel)) {
        nSchemaLevel = 0;
    }

    platform.selectSql({
        'query'       : query,
        'startRecord' : nStartRecord,
        'schemaLevel' : nSchemaLevel
    }, fnDone);
           
}

function getIndices(fnDone) {
    platform.getIndices(fnDone);
}

function updateDatabase(arrPostedData, fnDone) {

    if (!Array.isArray(arrPostedData)) {
        var oTheError = {'Error': 'UpdateDatabase expected an array'};
        fnDone(oTheError);
    } else {
        platform.updateDatabase(arrPostedData, fnDone);
    }
}

function report_sla(arrSpans, fnDone) {

    var oSlaReport = require('./SlaReport.js');
    oSlaReport.generateReport(arrSpans, exports, fnDone);
}

function report_DriverActivity(dateFrom, dateTo, bSummaryOnly, fnDone) {

    var oDriverActivityReport = require('./DriverActivityReport.js');
    oDriverActivityReport.generateReport(dateFrom, dateTo, bSummaryOnly, exports, fnDone);
}

function report_DestinationSummary(dateFrom, dateTo, fnDone) {

    var oDestinationSummaryReport = require('./DestinationSummaryReport.js');
    oDestinationSummaryReport.generateReport(dateFrom, dateTo, exports, fnDone);
}

function report_CancellationList(dateFrom, dateTo, fnDone) {
    var oCancellationListReport = require('./CancellationListReport.js');
    oCancellationListReport.generateReport(dateFrom, dateTo, exports, fnDone);
}

exports.selectSql = selectSql;
exports.getIndices = getIndices;
exports.updateDatabase = updateDatabase;
exports.report_sla = report_sla;
exports.report_DriverActivity = report_DriverActivity;
exports.report_DestinationSummary = report_DestinationSummary;
exports.report_CancellationList = report_CancellationList;

