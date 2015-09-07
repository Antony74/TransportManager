///<reference path='../interface/node.d.ts' />

// Use this findCallback function for APIs where the callback is always the last argument.
// If this not true of your API, please provide your own findCallback function.
function findCallback_LastArgument(sFunctionName, arrArguments)
{
	return arrArguments.length - 1;
}

function generateProxyApiSourceCode(api, sCreateProxyFunctionName, sUrlPrefix, fnFindCallback)
{
	var sOutput = '';

	sOutput += 'function ' + sCreateProxyFunctionName + '() {\n';
	sOutput += '    return {\n';

	for (var sFnName in api)
	{
		var fn = api[sFnName];

		if (typeof(fn) != 'function')
		{
			console.log('Generating "' + sCreateProxyFunctionName + '", "' + sFnName + '" is not a function');
		}
		else
		{
			var src = fn.toString();
			var nOpenBracket = src.indexOf('(');
			var nCloseBracket = src.indexOf(')', nOpenBracket);

			if (nOpenBracket == -1 || nCloseBracket == -1 || nCloseBracket <= nOpenBracket)
			{
				console.log('Generating "' + sCreateProxyFunctionName + '", failed to parse function "' + sFnName + '"');
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

				var nCallback = fnFindCallback(fn.name, fn.argumentNames);
				var arrParams = [];

				for (var n = 0; n < fn.argumentNames.length; ++n)
				{
					if (n != nCallback)
					{
						var sParam = fn.argumentNames[n] + '=';
						sParam += "' + encodeURIComponent(" + fn.argumentNames[n] + ")";
						arrParams.push(sParam);
					}
				}

				sOutput += '        ' + fn.name + ': function(' + fn.argumentNames.join(', ') + ') {\n';
				sOutput += "            $.getJSON('" + sUrlPrefix + fn.name;
				
				if (arrParams.length)
				{
					sOutput += '?' + arrParams.join("\n                    + '&");
				}
				else
				{
					sOutput += "'";
				}

				sOutput += ',\n                      ' + fn.argumentNames[nCallback] + ');';

				sOutput += '\n';
				sOutput += '        },\n';
			}
		}
	}

	sOutput += '    };\n';
	sOutput += '}\n\n';

	return sOutput;
}

exports.findCallback_LastArgument = findCallback_LastArgument;
exports.generateProxyApiSourceCode = generateProxyApiSourceCode;

