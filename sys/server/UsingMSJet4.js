
var fs = require('fs');
var dface = require('dface');

var ADODB = require('node-adodb');

var sDatabaseFilename = __dirname + '/../../TransportManager.mdb';
var sConnectionString = 'Provider=Microsoft.Jet.OLEDB.4.0;Data Source=' + sDatabaseFilename + ';';

function copyFile(source, target, doneCopying) {

    var streamIn = fs.createReadStream(source);
    streamIn.on('error', function(err) {
        console.log(err);
    });

    var streamOut = fs.createWriteStream(target);
    streamOut.on('error', function(err) {
        console.log(err);
    });

    streamOut.on('close', function() {
        doneCopying();
    });

    streamIn.pipe(streamOut);
}

function runSQL(sFilenameSql) {

    console.log('Running ' + sFilenameSql);

    // Load the SQL
    var sSql = fs.readFileSync(sFilenameSql);

    // Strip line comments
    var arrLines = String(sSql).split("\n");
    sSql = "";

    for (var n = 0; n < arrLines.length; ++n) {

        var sLine = arrLines[n].trim();

        if (sLine.charAt(0) != '#') {
            sSql += sLine;
        }
    }

    // Split into statements
    var arrSql1 = String(sSql).split(';');
    var arrSql2 = [];

    // Remove empty statements
    for (n = 0; n < arrSql1.length; ++n) {

        var sStatement = arrSql1[n].trim();
        
        if (sStatement.length) {
            arrSql2.push(sStatement);
        }
    }

    // Run them

    var conn = ADODB.open(sConnectionString);

    function onFail(msg) {
        console.log(msg);
    }

    function onDone() {
        if (arrSql2.length) {
            var query = arrSql2.shift();

            conn.execute(query).on('done', onDone).on('fail', onFail);
        }
    }

    onDone();
}

function ensureDatabaseIsReady(doneEnsuring) {

    var sFilenameEmpty = __dirname + '/Blank2002Database.mdb';

    fs.exists(sDatabaseFilename, function(bExists) {

        if (bExists) {
            ensureDatabaseIsUpgraded(doneEnsuring);
        } else {

            console.log('Database not found... creating empty database');

            // Copy empty database
            copyFile(sFilenameEmpty, sDatabaseFilename, function() {
                ensureDatabaseIsUpgraded(doneEnsuring);
            });
        }
    });
}

function ensureDatabaseIsUpgraded(doneEnsuring) {

    getIndices(function(oIndices) {

//        fs.writeFile('c:/temp/compare/incides.json', JSON.stringify(oIndices, null, 4), function(){});

        if (typeof oIndices.records == 'undefined') {

            console.log('Error getting information from database: ' + oIndices.Error);
            doneEnsuring(false);
            return;
        }

        var nUpgradeLevel = 0;

        for (var nRecord in oIndices.records) {

            var oRecord = oIndices.records[nRecord];
        
            if (oRecord.TABLE_NAME == 'Clients') {

                nUpgradeLevel = Math.max(1, nUpgradeLevel);

            } else if (oRecord.TABLE_NAME == 'ClientsEx') {

                nUpgradeLevel = Math.max(2, nUpgradeLevel);

            }
        }

        if (nUpgradeLevel > 0 && nUpgradeLevel < 1) {
            console.log('Upgrading database');
        }

        switch(nUpgradeLevel) {
        case 0:
            runSQL(__dirname + '../../TransportManager.sql');
            // Drop through!!1!
        case 1:
            runSQL(__dirname + '../../TransportManagerUpgrade1.sql');
            // Drop through!!1!
        }

        console.log('Database ready');
        doneEnsuring(true);
    });
}

function selectSql(obj, fnDone) {

    var conn = ADODB.open(sConnectionString);

	var query = conn.query(obj.query, true);

	query.on('done', function(records, fieldInfo) {

        var fields = [];
        var nTotalWidth = 0;

        for (var sFieldname in fieldInfo) {

            var adoField = fieldInfo[sFieldname];
        
            var ourField = {
                'name': sFieldname,
                'width': adoField.DefinedSize,
                'Type': adoField.Type,
                'DefinedSize': adoField.DefinedSize,
                'ISAUTOINCREMENT': adoField.Properties.ISAUTOINCREMENT ? adoField.Properties.ISAUTOINCREMENT.Value : false,
                'Tablename': adoField.Properties.BASETABLENAME ? adoField.Properties.BASETABLENAME.Value : ''
            };

			if (ourField.width < 5) {
				ourField.width = 5;
			} else if (ourField.width > 25) {
				ourField.width = 25;
			}

            nTotalWidth += ourField.width;

            switch(adoField.Type) {
            case 3:   // adInteger
                ourField.Type = 'INTEGER';
                break;
            case 202: // adVarWChar
                ourField.Type = 'TEXT';
                break;
            case 11:  // adBoolean
                ourField.Type = 'YESNO';
                break;
            case 203: // adLongVarWChar
                ourField.Type = 'MEMO';
                break;
            case 7:   // adDate
                ourField.Type = 'DATE';
                break;
            }

            fields.push(ourField);
        }

        for (var n = 0; n < fields.length; ++n) {
            fields[n].width = '' + Math.ceil(100*fields[n].width/nTotalWidth) + '%';
        }

        var result = {
            'query': obj.query,
            'startRecord': 0,
            'more': false,
            'fields': fields,
            'records': records
        };

//        fs.writeFile('c:/temp/compare/thing.json', JSON.stringify(result, null, 4), function(){});

        fnDone(result);
	});

	query.on('fail', function(message) {

        console.log('Error getting data from database: ' + message);

        fnDone({
            Error: message
        });
	});
}

function getIndices(fnDone) {

    var conn = ADODB.open(sConnectionString);
    conn.openSchema(12) // ADODB::adSchemaIndexes
        .on('done', function(data) {
        fnDone({
            more: false,
            records: data
        });
    });

}

function updateDatabase(obj) {

    console.log(JSON.stringify(obj, null, 4));

    var result = dface.updateDatabase(sDatabaseFilename, obj);

    if (typeof result.Error == 'string') {
        console.log('Error updating database: ' + result.Error);
    }

    return result;
}

//
// And that should be all the JET database related stuff above, now for some 
// utility functions which are Windows specific.
//

function ensureShortcutExists() {

    // Ensure we have a shortcut to make it easier to run this program.  Obviously
    // it's annoying having to run once without a shortcut, but it has to contain
    // an absolute path which we can't know in advance.  Also it can't contain
    // a parameter so we go via a batch file.  Unfortunately this is the best I can
    // do right now.

    var sBatchFile =  __dirname + '/TransportManager.bat';
    var sScript = '';
    sScript += '@echo off\r\n';
    sScript += '"' + process.execPath + '" "' + __dirname + '\\TransportManagerInWindowsSysTray.js"\r\n';
    fs.writeFile(sBatchFile, sScript);

    var sShortcutFile = __dirname + '/../../Tr-Man- Reports.url';
    fs.writeFile(sShortcutFile, '[InternetShortcut]\r\n'
                              + 'URL=file://' + __dirname + '\\TransportManager.bat\r\n'
                              + 'WorkingDir=' + __dirname + '\r\n'
                              + 'IconFile=' + __dirname + '\\..\\htdocs\\icons\\Car.ico\r\n'
                              + 'IconIndex=0\r\n');
}

//
// Exports
//

exports.ensureShortcutExists = ensureShortcutExists;
exports.ensureDatabaseIsReady = ensureDatabaseIsReady;
exports.selectSql = selectSql;
exports.getIndices = getIndices;
exports.updateDatabase = updateDatabase;

