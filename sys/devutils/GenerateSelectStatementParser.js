
var Parser = require('jison').Parser;
var fs = require('fs');

var sGrammar = fs.readFileSync('SelectStatementParser.jison', {encoding:'utf8'});

var parser = new Parser(sGrammar);
var generatedParser = parser.generate();

fs.writeFileSync('../server/SelectStatementParser.js', generatedParser);

// And let's test the parser we have just generated
parser.parse("select * from clients");
