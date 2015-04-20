//
// Most of what we want to know about the database schema we can get directly
// from the database itself.  This file just contains a few simple extra
// facts which the database doesn't know - which tables this application
// is interested in (since a database may have other stuff hanging around
// in it, and occasionally there might even be a good reason for this),
// and for which date-time fields we only care about the date and not the time.
//

///<reference path='../interface/node.d.ts' />

var tables =
    {
        "Clients" : {},
        "Destinations" : {},
        "DestinationType" : {},
        "DriverExclusionList" : {},
        "Drivers" :
            {
                DateOnlyFields: {DateofBirth: true}
            },
        "DriverVacation" : {},
        "JobLog" : {},
        "Jobs" : {},
    };
        
function getTables()
{
    return tables;
}

function isValidTable(sTable)
{
    return sTable in tables;
}

exports.getTables = getTables;
exports.isValidTable = isValidTable;

