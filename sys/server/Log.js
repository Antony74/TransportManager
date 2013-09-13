// Placeholder for logging as something more finessed than console.log() will become desirable later

function write(sMsg)
{
    console.log(sMsg);
}

function error(sMsg) {
    console.log(sMsg);
}

exports.write = write;
exports.error = error;
