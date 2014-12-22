///<reference path='../interface/node.d.ts' />

var win32ole = require('../server/node_modules/win32ole');
var platform = require('../server/usingMSJet4.js');
var jet = platform.jet;
var Faker = require('Faker');

function addTestClient(rs)
{
    rs.AddNew();
    rs.Fields("Title").Value = "";
    rs.Fields("Firstname").Value = Faker.name.firstName();
    rs.Fields("Initial").Value = Faker.name.firstName().substr(0,1);
    rs.Fields("Surname").Value = Faker.name.lastName();
    rs.Fields("AddressLine1").Value = Faker.address.streetAddress();
    rs.Fields("AddressLine2").Value = "";
    rs.Fields("Town").Value = "Neverville";
    rs.Fields("Postcode").Value = "";
    rs.Fields("HomeNumber").Value = Faker.phone.phoneNumber().substr(0,13);
    rs.Fields("MobileNumber").Value = "";
    rs.Fields("EmailAddress").Value = "";
    rs.Fields("Notes").Value = "";
    rs.Fields("IsActive").Value = true;
    rs.Update();
}

platform.ensureDatabaseIsReady(function()
{
    var db = jet.openAccessDatabase(jet.sDatabaseFilename);
    
    var rsClients = jet.createRecordset();
    rsClients.Open("Clients", db, jet.adOpenStatic, jet.adLockOptimistic, jet.adCmdTableDirect);
    
    if (rsClients.RecordCount == 0)
    {
        for (var n = 0; n < 8; ++n)
        {
            addTestClient(rsClients);
        }
    }

    rsClients.Close();

//    var randomName = Faker.Name.findName(); // Rowan Nikolaus
//    var randomEmail = Faker.Internet.email(); // Kassandra.Haley@erich.biz
//    var randomCard = Faker.Helpers.createCard();
     
//    console.log(randomName);
});

