
exports.simpleSelectSql = simpleSelectSql;
exports.getPeriodSubQuery = getPeriodSubQuery;
exports.formatdate = formatdate;
exports.reverseDateFormat = reverseDateFormat;
exports.queryJobOutcomes = queryJobOutcomes;

//
// simpleSelectSql
//
function simpleSelectSql(sSql, coreApi, fnFailed, fnDone) {
    var oJson = null;
    getMoreData(0);

    function getMoreData(nStartRecord) {

        coreApi.selectSql(sSql, nStartRecord, 0, function(data) {

            if (data.Error != undefined) {
                fnFailed(data.Error);
            } else {

                if (oJson == null) {
                    oJson = data;
                } else {
                    oJson['records'] = oJson['records'].concat(data['records']);
                }

                if (data.more) {
                    getMoreData(data.startRecord + data.records.length);
                } else {
                    fnDone(oJson);
                }
            }
        });
    }
}

//
// getPeriodSubQuery
//
function getPeriodSubQuery(sPeriodStart, sPeriodEnd) {

    return '(jobs.JobDate > #' + sPeriodStart + ' 00:00# AND jobs.JobDate < #' + sPeriodEnd + ' 23:59#)';
}

//
// formatdate
//
function formatdate(date) {

    if (typeof(date) == 'string') {
        date = new Date(date);
    }

    return date.getFullYear().toString() + '/' + asTwoCharacterString(date.getMonth() + 1) + '/' + asTwoCharacterString(date.getDate());
}

//
// asTwoCharacterString
//
function asTwoCharacterString(n) {
    var s = n.toString();
    return (s.length == 1) ? (0 + s) : s;
}

//
// reverseDateFormat
//
function reverseDateFormat(sDate) {
    return sDate.split('/').reverse().join('/');
}

//
// queryJobOutcomes
//
function queryJobOutcomes(coreApi, sPeriodStart, sPeriodEnd, fnFailed, fnDone) {

    var sSql = 'SELECT JobID, CancellationId, AttributeText AS Outcome FROM '
             + 'JobAttribute INNER JOIN Attributes ON JobAttribute.AttributeID = Attributes.ID '
             + 'WHERE (CancellationID > 50 AND JobID IN ('
             + 'SELECT Jobs.JobID FROM Jobs WHERE ' + getPeriodSubQuery(sPeriodStart, sPeriodEnd)
             + '))';

    simpleSelectSql(sSql, coreApi, fnFailed, fnDone);
}

