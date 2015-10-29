///<reference path='../interface/jqueryui.d.ts' />
///<reference path='../interface/jquery.ui.datetimepicker.d.ts' />
///<reference path='./initialiseDateTimePickers.ts' />
///<reference path='./ProxyApi.ts' />

function getDialogHandler(doneFn)
{
    // Queue this request for a dialog handler
    var arrFunctionsWaitingForDialogHandler = [doneFn];

    // Queue any subsequent request we get for a dialog handler while we are waiting for it
    getDialogHandler = function(doneFn)
    {
        arrFunctionsWaitingForDialogHandler.push(doneFn);
    }

    // Load the dialogs
    $('#dialogs').load('raw/dialogs.html .dialogTemplate', function()
    {
        initialiseDateTimePickers({}, '.datetimepicker', '.datetimepickerbutton');
    
        var nDialogWidth = 800;
        var nButtonWidth = 85;

        var fnDialogClosed = null;
        var bDialogChanged = false;
        var bDialogButtonsEnabled = true;
        var sDialogName = '';
        var arrTablesToUpdate = [];
        var oData = {Error: 'No data'};

        function enableButtons(bEnable)
        {
            bDialogButtonsEnabled = bEnable;

            if (bEnable)
            {
                $('.ui-dialog-titlebar-close').css('display', 'inherit');
                $('#dialogApply').removeClass('buttonDisabled');
                $('#dialogOK').removeClass('buttonDisabled');
                $('#dialogCancel').removeClass('buttonDisabled');
            }
            else
            {
                $('.ui-dialog-titlebar-close').css('display', 'none');
                $('#dialogApply').addClass('buttonDisabled');
                $('#dialogOK').addClass('buttonDisabled');
                $('#dialogCancel').addClass('buttonDisabled');
            }
        }

        function setStatus(sStatus, cTrafficLight)
        {
            var statusBar = $('#dlg' + sDialogName + ' .dialogStatus').find('td');
            if (cTrafficLight == 'G')
            {
                statusBar.html('Status: ' + sStatus)
                         .removeClass('dialogStatusRed')
                         .removeClass('dialogStatusAmber')
                         .addClass('dialogStatusGreen');

                enableButtons(true);
            }
            else if (cTrafficLight == 'A')
            {
                statusBar.html('Status: ' + sStatus)
                         .removeClass('dialogStatusRed')
                         .addClass('dialogStatusAmber')
                         .removeClass('dialogStatusGreen');

                enableButtons(false);
            }
            else
            {
                if (sStatus.indexOf('SyntaxError:') != 0)
                {
                    sStatus = 'Error: ' + sStatus;
                }

                statusBar.html(sStatus)
                         .addClass('dialogStatusRed')
                         .removeClass('dialogStatusAmber')
                         .removeClass('dialogStatusGreen');

                enableButtons(true);
            }
        }

        function commitChanges(bCloseDialog)
        {
            setStatus('Updating', 'A');
            bDialogChanged = true;
            
            var arrCommits = [];

            for (var nTable in arrTablesToUpdate)
            {
                var sTablename = arrTablesToUpdate[nTable];
                var oOldRecord = {};
                var oNewRecord = {};
                var arrFields = oData['fields'];

                var bWasAllNull = true;

                for (var nField in arrFields)
                {
                    var oField = arrFields[nField];
                    var sFieldname = oField['name'];                    

                    if (oField['Tablename'] == sTablename)
                    {
                        var arrParts = sFieldname.split('.');
                        if (arrParts.length == 2)
                        {
                            var sKeyFieldname = arrParts[1];
                            var sValue = oData['records'][0][sKeyFieldname];

                            oOldRecord[sKeyFieldname] = sValue;
                            oNewRecord[sKeyFieldname] = sValue;
                        }
                        else
                        {
                            oOldRecord[sFieldname] = oData['records'][0][sFieldname];
                            oNewRecord[sFieldname] = $('#' + sDialogName + '_' + sFieldname).val();
                        }

                        if (oData['records'][0][sFieldname] != null)
                        {
                            bWasAllNull = false;
                        }
                    }
                }

                if (bWasAllNull)
                {
                    arrCommits.push(
                    {
                        table : sTablename,
                        operations:
                        [
                            {
                                operationName : 'add',
                                newRecord     : oNewRecord,
                            }
                        ]
                    });
                }
                else
                {
                    arrCommits.push(
                    {
                        table : sTablename,
                        operations:
                        [
                            {
                                operationName : 'edit',
                                oldRecord     : oOldRecord,
                                newRecord     : oNewRecord,
                            }
                        ]
                    });
                }

            }

			getCoreApiProxy().updateDatabase(
						arrCommits,
						function(oData)
						{
							if (typeof oData.Error != 'undefined')
							{
								setStatus(oData.Error, 'R');
							}
							else
							{
								setStatus('Ready', 'G');

								if (bCloseDialog)
								{
									$('#dlg' + sDialogName).dialog('close');
									fnDialogClosed(bDialogChanged);
								}
							}
						});
        }

        $('#dialogs div').each(function()
        {
            $(this).dialog(
            {
                modal         : true,
                autoOpen      : false,
                closeOnEscape : false,
                resizable     : false,
                width         : nDialogWidth,
                buttons       :
                [
                    {
                        text  : 'OK',
                        id    : 'dialogOK',
                        icons : {primary: 'ui-icon-check'},
                        width : nButtonWidth,
                        click : function()
                        {
                            if (bDialogButtonsEnabled)
                            {
                                commitChanges(true);
                            }
                        }
                    },
                    {
                        text  : 'Cancel',
                        id    : 'dialogCancel',
                        width : nButtonWidth,
                        icons : {primary: 'ui-icon-closethick'},
                        click : function()
                        {
                            if (bDialogButtonsEnabled)
                            {
                                $('#dlg' + sDialogName).dialog('close');
                                fnDialogClosed(bDialogChanged);
                            }
                        }
                    },
                    {
                        text  : 'Apply',
                        id    : 'dialogApply',
                        icons : {primary: 'ui-icon-check'},
                        width : nButtonWidth,
                        click : function()
                        {
                            if (bDialogButtonsEnabled)
                            {
                                commitChanges(false);
                            }
                        }
                    },

                ],
            }).on('keydown', function(event)
            {
                if (event.keyCode === $.ui.keyCode.ESCAPE)
                {
                    if (bDialogButtonsEnabled)
                    {
                        $(this).dialog('close');
                    }
                } 
            });
        });

        // And now we're ready to create the dialogHandler

        var theDialogHandler = 
        {
            doDialog: function(_sDialogName, sQuery, _arrTablesToUpdate, _fnDialogClosed)
            {
                bDialogButtonsEnabled = true;
                bDialogChanged = false;

                fnDialogClosed = _fnDialogClosed;
                sDialogName = _sDialogName;
                arrTablesToUpdate = _arrTablesToUpdate;

                $('#dlg' + sDialogName).dialog("open");

                getCoreApiProxy().selectSql(sQuery, 0, 2, function(_oData)
                {
                    oData = _oData;
                
 				    if (typeof oData.Error != 'undefined')
				    {
					    setStatus(oData.Error, 'R');
				    }
                    else
                    {
                        var oRecord = oData['records'][0];

                        for (var sFieldname in oRecord)
                        {
                            var input = $('#' + sDialogName + '_' + sFieldname);

                            input.val(oRecord[sFieldname]);
                        }

                        setStatus('Ready', 'G');
                    }
                });
            }
        };

        // Subsequent calls to getDialogHandler can simply be immediately called back with the dialogHandler

        getDialogHandler = function(fnDone)
        {
            fnDone(theDialogHandler);
        };

        // Callback anyone who is already waiting for a dialogHandler

        for (var n = 0; n < arrFunctionsWaitingForDialogHandler.length; ++n)
        {
            var fn = arrFunctionsWaitingForDialogHandler[n];
            fn(theDialogHandler);
        }
    });
}

