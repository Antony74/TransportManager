// I'm using the TypeScript compiler for code verification.  In theory this could cause false negative lexical and syntatic
// errors, because TypeScript is a superset of JavaScript.  In practice one would be fairly unlucky to write invalid JavaScript
// which just happened to be valid TypeScript by accident, and in any case code tends to be run after it is written and errors caught
// then, it's only if you break it later on by changing a completely different part of the code that you have an error which
// is all too easy to miss, so it is this third kind of error - semantic errors - which I am most concerned about making,
// and this script should be an adequete means of catching them.

var fs = require('fs');
var spawn = require('child_process').spawn;

var sPathSrc  = '..\\..\\sys';
var sPathDest = '..\\..\\sys_verified';

// Recursive delete
if (fs.existsSync(sPathDest))
{
    forEachFileDoThing(sPathDest, false, function(sFilename, bIsDir, done)
    {
        if (bIsDir)
        {
            console.log('deleting folder ' + sFilename);
            fs.rmdirSync(sFilename);
        }
        else
        {
            console.log('deleting file ' + sFilename);
            fs.unlinkSync(sFilename);
        }

        done();

    }, function() {});
}

// Recursive copy, renaming .js files .ts
forEachFileDoThing(sPathSrc, true, function(sFilenameSrc, bIsDir, done)
{
    var sFilenameDest = sFilenameSrc.replace(sPathSrc, sPathDest);

    if (sFilenameDest.substr(sFilenameDest.length - 3) == '.js')
    {
        sFilenameDest = sFilenameDest.substr(0, sFilenameDest.length - 3) + '.ts';
    }

    if (bIsDir)
    {
        console.log('mkdir ' + sFilenameDest);
        fs.mkdirSync(sFilenameDest);
        done();
    }
    else
    {
        console.log('copying file to ' + sFilenameDest);
        copyFile(sFilenameSrc, sFilenameDest, done);
    }

}, function()
{

    // Now compile all .ts files
    forEachFileDoThing(sPathDest, true, function(sFilename, bIsDir, done)
    {
        if ( bIsDir == false && (sFilename.substr(sFilename.length - 3) == '.ts') && fileExcluded(sFilename) == false)
        {
            console.log('tsc --module commonjs ' + sFilename);

            compiler = spawn('tsc', ['--module', 'commonjs', sFilename]);

            compiler.stdout.on('data', function(text)
            {
                process.stdout.write(text);
            });
    
            compiler.stderr.on('data', function(text)
            {
                process.stdout.write(text);
            });

            compiler.on('exit', function(nExitCode)
            {
                if (nExitCode == 0)
                {
                    done();
                }
                else
                {
                    process.exit(nExitCode);
                }
            });
        }
        else
        {
            done();
        }
    }, function()
    {
        console.log('done');
    });
    
});

//
// fileExcluded
//
function fileExcluded(sFilename)
{
    if ( (sFilename.indexOf(sPathDest + '/server/node_modules/node-static') != -1) 
    ||   (sFilename.indexOf(sPathDest + '/server/node_modules/win32ole')    != -1)
    ||   (sFilename.indexOf(sPathDest + '/devutils/node_modules/jison')     != -1)
    ||   (sFilename.indexOf(sPathDest + '/devutils/node_modules/faker')     != -1) )
    {
        return true;
    }
    else
    {
        return false;
    }
}

//
// forEachFileDoThing
//
function forEachFileDoThing(sDir, bTopDown, thing, done)
{
    var files = fs.readdirSync(sDir);
    var nOutstanding = 2;

    function doneThing()
    {
        --nOutstanding;
        if (nOutstanding <= 0)
        {
            done();
        }
    }

    if (bTopDown == true)
    {
        thing(sDir, true, doneThing);
    }

    files.forEach(function(file, index)
    {
        ++nOutstanding;

        var sNewPath = sDir + '/' + file;

        if (fs.statSync(sNewPath).isDirectory())
        {
            forEachFileDoThing(sNewPath, bTopDown, thing, doneThing);
        }
        else
        {
            thing(sNewPath, false, doneThing);
        }
    });

    if (bTopDown == false)
    {
        thing(sDir, true, doneThing);
    }

    doneThing();
}

//
// copyFile
//
function copyFile(source, target, doneCopying)
{
    var streamIn = fs.createReadStream(source);
    streamIn.on('error', function(err)
    {
        console.log(err);
    });

    var streamOut = fs.createWriteStream(target);
    streamOut.on('error', function(err)
    {
        console.log(err);
    });

    streamOut.on('close', function(ex)
    {
        doneCopying();
    });

    streamIn.pipe(streamOut);
}

