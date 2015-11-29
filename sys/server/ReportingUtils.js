///<reference path='../interface/node.d.ts' />

exports.simpleSelectSql = simpleSelectSql;
exports.getPeriodSubQuery = getPeriodSubQuery;
exports.formatdate = formatdate;

//
// simpleSelectSql
//
function simpleSelectSql(sSql, coreApi, fnFailed, fnDone)
{
    var oJson = null;
    getMoreData(0);

    function getMoreData(nStartRecord)
    {
        coreApi.selectSql(sSql, nStartRecord, 0, function(data)
        {
            if (data.Error != undefined)
            {
                fnFailed(data.Error);
            }
            else
            {
                if (oJson == null)
                {
                    oJson = data;
                }
                else
                {
                    oJson['records'] = oJson['records'].concat(data['records']);
                }

                if (data.more)
                {
                    getMoreData(data.startRecord + data.records.length);
                }
                else
                {
                    fnDone(oJson);
                }
            }
        });
    }
}

//
// getPeriodSubQuery
//
function getPeriodSubQuery(sPeriodStart, sPeriodEnd)
{
    return '(JobAppointmentDateTime > #' + sPeriodStart + ' 00:00# AND JobAppointmentDateTime < #' + sPeriodEnd + ' 23:59#)';
}

//
// formatdate
//
function formatdate(date)
{
    if (typeof(date) == 'string')
    {
        date = new Date(date);
    }

    return date.getFullYear().toString() + '/' + asTwoCharacterString(date.getMonth() + 1) + '/' + asTwoCharacterString(date.getDate());
}

//
// asTwoCharacterString
//
function asTwoCharacterString(n)
{
    var s = n.toString();
    return (s.length == 1) ? (0 + s) : s;
}

