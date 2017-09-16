
var fs = require('fs');
var ec = require('./ErrorCodes.js');
var ADODB = require('node-adodb');

var sDatabaseFilename = __dirname + '/../../TransManager.mdb';
var sConnectionString = 'Provider=Microsoft.Jet.OLEDB.4.0;Data Source=' + sDatabaseFilename + ';';

function copyFile(source, target, doneCopying) { // eslint-disable-line no-unused-vars

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

function runSQL(sFilenameSql) { // eslint-disable-line no-unused-vars

    console.log('Running ' + sFilenameSql);

    // Load the SQL
    var sSql = fs.readFileSync(sFilenameSql);

    // Strip line comments
    var arrLines = String(sSql).split('\n');
    sSql = '';

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

    fs.exists(sDatabaseFilename, function(bExists) {

        if (bExists) {
            console.log('Database ready');
        } else {

            console.log(ec.errorText[ec.DATABASE_NOT_FOUND]);
            process.exit(ec.DATABASE_NOT_FOUND);
        }

        doneEnsuring(bExists);
    });
}

function ensureDatabaseIsUpgraded(doneEnsuring) { // eslint-disable-line no-unused-vars

    getIndices(function(oIndices) {

        if (typeof oIndices.records == 'undefined') {

            console.log('Error getting information from database: ' + oIndices.Error);
            doneEnsuring(false);
            return;
        }

        for (var nRecord in oIndices.records) {

            var oRecord = oIndices.records[nRecord];

            console.log(oRecord.TABLE_NAME);
        }
    });
}

function selectSql(obj, fnDone) {

    console.log(obj.query);

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

        getIndices = function(fnDone) {
            fnDone({
                more: false,
                records: data
            });
        };

        getIndices(fnDone);
    }).on('fail', function(message) {
        console.log(message);
    });

}

function isDateField(sTablename, sFieldname) { // Consider writing this properly
    if (sFieldname === 'DateofBirth') {
        return true;
    } else {
        return false;
    }
}

function updateDatabase(obj, fnDone) {

    getIndices(function(indices) {

        var bQueryExecuting = false;
        var sError = 'Unknown failure';

        if (obj.length !== 1) {
            sError = 'updateDatabase currently only support batches of one';
        } else {

            for (var nOp = 0; nOp < obj[0].operations.length; ++nOp) {
                var op = obj[0].operations[nOp];
                var sTablename = obj[0].table;
                var sIdField = '';

                indices.records.forEach(function(item) {
                    if (item.TABLE_NAME === sTablename && item.PRIMARY_KEY === true) {
                        sIdField = item.COLUMN_NAME;
                    }
                });
               
                if (op.operationName === 'edit') {
                    var assignments = [];
                    var pkDetails = '';
                    Object.keys(op.newRecord).forEach(function(sFieldname) {
                        var value =  op.newRecord[sFieldname];
                        if (typeof(value) !== 'number') {
                            value = JSON.stringify(value);
                        }

                        if (isDateField(sTablename, sFieldname)) {
                            var date = new Date(value);
                            value  = '#';
                            value += date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate();
                            value += ' ';
                            value += date.getHours() + ':' + date.getMinutes();
                            value += '#';
                        }

                        var assignment = sFieldname + ' = ' + value;
                        if (sFieldname === sIdField) {
                            pkDetails = assignment;
                        } else {
                            assignments.push(assignment);
                        }
                    });

                    if (pkDetails.length) {
                        var sQuery = 'UPDATE ' + sTablename + ' SET ';
                        sQuery += assignments.join(', ');
                        sQuery += ' WHERE ' + pkDetails;

                        var conn = ADODB.open(sConnectionString);
                        conn.execute(sQuery).on('done', function() {
                            fnDone({});
                        }).on('fail', function(message) {
                            fnDone({Error: message});
                        });

                        bQueryExecuting = true;

                    } else {
                        sError = 'PK not found for table ' + sTablename;
                    }
                } else {
                    sError = 'updateDatabase: unsupported opertation ' + op.operationName;
                }
            }
        }

        if (bQueryExecuting === false) {
            fnDone({Error: sError});
        }

    });

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

    var sVBSFile =  __dirname + '/TransportManager.vbs';
    var sVBScript = 'Set shell = CreateObject("Wscript.Shell")\n';
    sVBScript    += 'shell.CurrentDirectory = "' + __dirname + '"\n';
    sVBScript    += 'shell.Run "npm start", 0' + '\n';
    fs.writeFile(sVBSFile, sVBScript);

    var sBatchFile =  __dirname + '/TransportManager.bat';
    var sBatchScript = 'start cscript ' + __dirname + '/TransportManager.vbs';
    fs.writeFile(sBatchFile, sBatchScript);

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

