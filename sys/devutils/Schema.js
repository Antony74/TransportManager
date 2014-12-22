///<reference path='../interface/node.d.ts' />

function getTables()
{
    var tables =
        {
            "Clients" : null,
            "Destinations" : null,
            "DestinationType" : null,
            "DriverExclusionList" : null,
            "Drivers" : null,
            "DriverVacation" : null,
            "JobLog" : null,
            "Jobs" : null,
        };

    return tables;
}

var tables = getTables();

function isValidTable(sTable)
{
    return sTable in tables;
}

exports.getTables = getTables;
exports.isValidTable = isValidTable;

