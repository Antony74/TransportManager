//
// Most of what we want to know about the database schema we can get directly
// from the database itself.  This file just contains a few simple extra
// facts which the database doesn't know - which tables this application
// is interested in (since a database may have other stuff hanging around
// in it, and occasionally there might even be a good reason for this),
// and for which date-time fields we only care about the date and not the time.
//

///<reference path='../interface/node.d.ts' />

function getTables()
{
    var tables =
    {
        "Clients" :
            {
                query: 'SELECT Clients.ClientID as ClientID, ClientsEx.ClientID, Title, Firstname, Initial, Surname, AddressLine1, AddressLine2, Town, Postcode, '
                +      'HomeNumber, MobileNumber, EmailAddress, IsWheelchair, Notes, IsActive, DateofBirth, Gender '
                +      'FROM (Clients LEFT OUTER JOIN ClientsEx ON Clients.ClientID = ClientsEx.ClientID)',
                DateOnlyFields: {DateofBirth: true},
                ChoiceOnlyFields: {Gender: ['M', 'F', 'X']}
            },
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
        
    for (var sTablename in tables)
    {
        if (tables[sTablename].query == undefined)
        {
            tables[sTablename].query = 'SELECT * from ' + sTablename;
        }
    }

    getTables = function()
    {
        return tables;
    }

    return tables;
}

if (typeof(exports) != 'undefined')
{
    exports.getTables = getTables;
}

