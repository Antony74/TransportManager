
// Use this findCallback function for APIs where the callback is always the last argument.
// If this not true of your API, please provide your own findCallback function.
function findCallback_LastArgument(sFunctionName, arrArguments)
{
	return arrArguments.length - 1;
}

function generateProxyApiSourceCode(api, sGetProxyFunctionName, sUrlPrefix, fnFindCallback)
{
    var ts = new Date();    

	function pad(nValue)
	{
		return ('00' + nValue).slice(-2);
	}

	var sOutput = '';

    sOutput += "// THIS IS AN AUTO-GENERATED FILE (created by " + __filename + ", " + ts.getFullYear() + "/" + pad(ts.getMonth()+1) + "/" + pad(ts.getDate()) + " " + pad(ts.getHours()) + ":" + pad(ts.getMinutes()) + ")\r\n\r\n";

	sOutput += sGetProxyFunctionName + " = function() {          \r\n\r\n";

    sOutput += "    function improveErrorMessage(numberStatus, textStatus) {  \r\n";
    sOutput += "        if (textStatus == 'timeout')                \r\n";
    sOutput += "            textStatus = 'Request timed out';       \r\n";
    sOutput += "        else if (numberStatus == 0)                 \r\n";
    sOutput += "            textStatus = 'No response from server'; \r\n";
    sOutput += "                                                    \r\n";
    sOutput += "        console.log(textStatus);                    \r\n";
    sOutput += "        return textStatus;                          \r\n";
    sOutput += "    }                                               \r\n\r\n";

	sOutput += "    var proxy = {                                   \r\n";

    var arrFnSrc = [];

	for (var sFnName in api)
	{
		var fn = api[sFnName];

		if (typeof(fn) != 'function')
		{
			console.log('Generating "' + sGetProxyFunctionName + '", "' + sFnName + '" is not a function');
		}
		else
		{
			var src = fn.toString();
			var nOpenBracket = src.indexOf('(');
			var nCloseBracket = src.indexOf(')', nOpenBracket);

			if (nOpenBracket == -1 || nCloseBracket == -1 || nCloseBracket <= nOpenBracket)
			{
				console.log('Generating "' + sGetProxyFunctionName + '", failed to parse function "' + sFnName + '"');
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

                var sFnSrc = '';
				sFnSrc += '        ' + fn.name + ': function(' + fn.argumentNames.join(', ') + ') {\r\n';
				sFnSrc += "            $.ajax(\r\n";
				sFnSrc += "            {\r\n";
				sFnSrc += "                type: 'POST',\r\n";
				sFnSrc += "                url: '" + sUrlPrefix + fn.name + "',\r\n";
				sFnSrc += '                data: JSON.stringify({\r\n';

				var sIndent = '                ';
                var arrLines = [];

				for (n = 0; n < fn.argumentNames.length; ++n)
				{
					if (n != nCallback)
					{
						arrLines.push(sIndent + '    ' + fn.argumentNames[n] + ': ' + fn.argumentNames[n]);
					}
				}

                sFnSrc += arrLines.join(',\r\n') + '\r\n';

				sFnSrc += sIndent + '}, null, 4),\r\n';
				sFnSrc += '                success: function(returnedData) {\r\n';
				sFnSrc += '                    ' +fn.argumentNames[nCallback] + '(JSON.parse(returnedData));\r\n';
				sFnSrc += '                },\r\n';
				sFnSrc += '                error: function(jqXHR, textStatus) {\r\n';
				sFnSrc += '                    ' + fn.argumentNames[nCallback] + "({Error:improveErrorMessage(jqXHR.status, textStatus)});\r\n";
				sFnSrc += '                }\r\n';
				sFnSrc += '            });\r\n';
				sFnSrc += '        }';

                arrFnSrc.push(sFnSrc);
			}
		}
	}

    sOutput += arrFnSrc.join(',\r\n') + '\r\n';

	sOutput += '    };                 \r\n\r\n';

	sOutput += "    " + sGetProxyFunctionName + " = function() {  \r\n";
    sOutput += "        return proxy;  \r\n";
	sOutput += '    };\r\n\r\n';

    sOutput += "    return proxy;      \r\n";
	sOutput += '};                     \r\n\r\n';

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
		}
	};
}

exports.findCallback_LastArgument = findCallback_LastArgument;
exports.generateProxyApiSourceCode = generateProxyApiSourceCode;

