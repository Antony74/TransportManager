///<reference path='../interface/node.d.ts' />

// test code
var api = require('./CoreApi');
createProxyApi(api, 'CoreApi', 'something');
// end of test code

function createProxyApi(api, sVarName, sFilename)
{
	for (var sFnName in api)
	{
		var fn = api[sFnName];

		if (typeof(fn) != 'function')
		{
			console.log('In API "' + sVarName + '", "' + sFnName + '" is not a function');
		}
		else
		{
			var src = fn.toString();
			var nOpenBracket = src.indexOf('(');
			var nCloseBracket = src.indexOf(')', nOpenBracket);

			if (nOpenBracket == -1 || nCloseBracket == -1 || nCloseBracket <= nOpenBracket)
			{
				console.log('In API "' + sVarName + '", failed to parse function "' + sFnName + '"');
			}
			else
			{
				var arrArgumentsNames = src.substring(nOpenBracket + 1, nCloseBracket).split(',');

				fn.argumentNames = [];

				for (var n = 0; n < arrArgumentsNames.length; ++n)
				{
					var sArgName = arrArgumentsNames[n].trim();
					if (sArgName.length)
					{
						fn.argumentNames.push(sArgName);
					}
				}
			}
		}
	}

	console.log(api);
}

