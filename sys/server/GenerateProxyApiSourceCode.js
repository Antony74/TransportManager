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

				sOutput += '        ' + fn.name + ': function(' + fn.argumentNames.join(', ') + ') {\n';
				sOutput += "            $.ajax(\n";
				sOutput += "            {\n";
				sOutput += "                type: 'POST',\n";
				sOutput += "                url: '" + sUrlPrefix + fn.name + "',\n";
				sOutput += '                timeout: 6000,\n';
				sOutput += '                data: JSON.stringify({\n';

				var sIndent = '                ';

				for (var n = 0; n < fn.argumentNames.length; ++n)
				{
					if (n != nCallback)
					{
						sOutput += sIndent + '    ' + fn.argumentNames[n] + ': ' + fn.argumentNames[n] + ',\n';
					}
				}

				sOutput += sIndent + '}, null, 4),\n'
				sOutput += '                success: function(returnedData) {\n'
				sOutput += '                    ' +fn.argumentNames[nCallback] + '(JSON.parse(returnedData));\n';
				sOutput += '                },\n';
				sOutput += '                error: function(jqXHR, textStatus, errorThrown) {\n';
				sOutput += '                    console.log(textStatus);\n';
				sOutput += '                    ' + fn.argumentNames[nCallback] + "({error:textStatus});\n";
				sOutput += '                }\n';
				sOutput += '            });\n';
				sOutput += '        },\n';
			}
		}
	}

	sOutput += '    };\n';
	sOutput += '}\n\n';

	return {

		sSourceCode: sOutput,

		fnAcceptUrl: function(parsedUrl)
		{
			if (parsedUrl.pathname.length
			&&  parsedUrl.pathname[0] == '/'
			&&  typeof(api[parsedUrl.pathname.substring(1)]) == 'function')
			{
				return true;
			}
			else
			{
				return false;
			}
		},

		fnHandleRequest: function(request, response)
		{
			var sPostedData = '';

			request.on('data', function(data)
			{
				sPostedData += data;
			});

			request.on('end', function()
			{
				var postedData;

				try
				{
					postedData = JSON.parse(sPostedData);
				}
				catch(e)
				{
					console.log(e.toString());
					var oError = {'Error': e.toString()};
					response.write(JSON.stringify(oError, null, 4));
					response.end();
					request.connection.end();     //close the socket
					request.connection.destroy(); //close it really
					return;
				}

				var sRequestedFunction = request.url.substring(1);

				var nCallback = fnFindCallback(sRequestedFunction, api[sRequestedFunction].argumentNames);

				var arrArguments = [];

				for (var n = 0; n < api[sRequestedFunction].argumentNames.length; ++n)
				{
					if (n == nCallback)
					{
						arrArguments.push(function()
						{
							if (arguments.length == 1)
							{
								response.write(JSON.stringify(arguments[0], null, 4));
							}
							else
							{
								response.write(JSON.stringify(arguments, null, 4));
							}

							response.end();
							request.connection.end();     //close the socket
							request.connection.destroy(); //close it really
						});
					}
					else
					{
						var sArgName = api[sRequestedFunction].argumentNames[n];

						if (typeof(postedData[sArgName]) == undefined)
						{
							var sMsg = 'Remote function "' + sRequestedFunction
									 + '" called with no "' + sArgName + '" argument ';

							console.log(sMsg);
							response.write(JSON.stringify({'Error': sMsg}, null, 4));
							response.end();
							request.connection.end();     //close the socket
							request.connection.destroy(); //close it really
							return;
						}
						else
						{
							arrArguments.push(postedData[sArgName]);
						}
					}
				}

				api[sRequestedFunction].apply(api, arrArguments);
			});
		},
	};
}

exports.findCallback_LastArgument = findCallback_LastArgument;
exports.generateProxyApiSourceCode = generateProxyApiSourceCode;

