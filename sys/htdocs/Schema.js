//
// Most of what we want to know about the database schema we can get directly
// from the database itself.  This file just contains a few simple extra
// facts which the database doesn't know - which tables this application
// is interested in (since a database may have other stuff hanging around
// in it, and occasionally there might even be a good reason for this),
// and for which date-time fields we only care about the date and not the time.
//

function getTables() {

    var tables = {

        'Clients' : {
            query: 'SELECT ClientID, Title.Description as Title, Forename, Middlename, Surname, '
            +      'AddressLine1, AddressLine2, Town, Postcode, '
            +      'HomePhone, MobilePhone, EMail, isWheelchair, isActive, DateOfBirth '
            +      'FROM (Client LEFT OUTER JOIN Title ON Client.TitleID = Title.ID)',
            DateOnlyFields: {DateOfBirth: true},
            ChoiceOnlyFields: {Gender: ['M', 'F', 'X']}
        },
        'Destinations' : {
            query: 'SELECT * FROM Destination'
        },
        'DestinationType' : {},
        'Drivers' : {
            query: 'SELECT * FROM Driver',
            DateOnlyFields: {DateOfBirth: true}
        },
        'Jobs' : {}
    };
        
    for (var sTablename in tables) {

        if (tables[sTablename].query == undefined) {

            tables[sTablename].query = 'SELECT * from ' + sTablename;
        }
    }

    getTables = function() {
        return tables;
    };

    return tables;
}

if (typeof(exports) != 'undefined') {
    exports.getTables = getTables;
}

