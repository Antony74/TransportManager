var win32ole = require('../server/node_modules/win32ole');
var platform = require('../server/usingMSJet4.js');
var jet = platform.jet;
var Faker = require('Faker');

function addTestClient(rs)
{
    rs.AddNew();
    rs.Update();
}

platform.ensureDatabaseIsReady(function()
{
    var db = jet.openAccessDatabase(platform.sDatabaseFilename);
    
    var rsClients = jet.createRecordset();
    rsClients.Open("Clients", db, jet.adOpenStatic, jet.adLockOptimistic, jet.adCmdTableDirect);
    
    for (var n = 0; n < 1; ++n)
    {
        addTestClient(rsClients);
    }

    rsClients.Close();

//    var randomName = Faker.Name.findName(); // Rowan Nikolaus
//    var randomEmail = Faker.Internet.email(); // Kassandra.Haley@erich.biz
//    var randomCard = Faker.Helpers.createCard();
     
//    console.log(randomName);
});

