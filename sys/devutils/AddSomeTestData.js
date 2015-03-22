///<reference path='../interface/node.d.ts' />

var platform = require('../server/usingMSJet4.js');
var faker = require('Faker');

platform.ensureDatabaseIsReady(function()
{
    // Ensure there isn't already client data in this database
    
    var existing = platform.selectSql(
    {
        query: 'select * from clients'
    });

    if (existing.records.length != 0)
    {
        console.log('This database already contains clients');
        return;
    }

    // Add one test client at a time in a loop of eight.  Though there shouldn't be anything to
    // stop us from batching up eight new test clients in a single updateDatabase call.

    for (var n = 0; n < 8; ++n)
    {
        platform.updateDatabase( 
        [
            {
                table: 'Clients',
                operations:
                [
                    {
                        operationName: 'add',
                        newRecord: generateTestClientFields()
                    }
                ]
            }
        ]);
    }
});

function generateTestClientFields()
{
    var retval =
    {
        Title        : "",
        Firstname    : faker.name.firstName(),
        Initial      : faker.name.firstName().substr(0,1),
        Surname      : faker.name.lastName(),
        AddressLine1 : faker.address.streetAddress(),
        AddressLine2 : "",
        Town         : "Neverville",
        Postcode     : "",
        HomeNumber   : faker.phone.phoneNumber().substr(0,13),
        MobileNumber : "",
        EmailAddress : "",
        Notes        : "",
        IsActive     : true
    };

    return retval;
}

/*
//    var randomName = Faker.Name.findName(); // Rowan Nikolaus
//    var randomEmail = Faker.Internet.email(); // Kassandra.Haley@erich.biz
//    var randomCard = Faker.Helpers.createCard();
     
//    console.log(randomName);
});
*/

