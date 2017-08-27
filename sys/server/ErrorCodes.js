
exports.PLATFORM_ISSUE     = 101;
exports.PORT_IN_USE        = 102;
exports.DATABASE_NOT_FOUND = 103;

exports.errorText = {};
exports.errorText[exports.PLATFORM_ISSUE]     = 'Problem with the platform this program was run on.  Please re-run from the command line for details.';
exports.errorText[exports.PORT_IN_USE]        = 'Port already in use.  This usually happens because another instance of the server is already running on this computer.';
exports.errorText[exports.DATABASE_NOT_FOUND] = 'Database not found';

exports.setExitCode = function(nExitCode) {
    process.on('exit', function() {
        process.exit(nExitCode);
    });
};


