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

        var dialogClosedFn = null;
        var bDialogChanged = false;
        var bDialogButtonsEnabled = true;
        var oRecord = {};
        var sCurrentTable = '';

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
            var statusBar = $('#dlg' + sCurrentTable + ' .dialogStatus').find('td');
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

            var oNewRecord = {};

            for (var sFieldName in oRecord)
            {
                oNewRecord[sFieldName] = $('#' + sCurrentTable + '_' + sFieldName).val();
            }

            var oCommitData =
            [
                {
                    table : sCurrentTable,
                    operations:
                    [
                        {
                            operationName : 'edit',
                            oldRecord     : oRecord,
                            newRecord     : oNewRecord
                        }
                    ]
                }
            ];

			getCoreApiProxy().updateDatabase(
						oCommitData,
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
									$('#dlg' + sCurrentTable).dialog('close');
									dialogClosedFn(bDialogChanged);
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
                                $('#dlg' + sCurrentTable).dialog('close');
                                dialogClosedFn(bDialogChanged);
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
            doDialog: function(_sCurrentTable, _oRecord, _dialogClosedFn)
            {
                bDialogButtonsEnabled = true;
                bDialogChanged = false;

                dialogClosedFn = _dialogClosedFn;
                oRecord = _oRecord;
                sCurrentTable = _sCurrentTable;

                $('#dlg' + sCurrentTable).dialog("open");
                setStatus('Ready', 'G');
            }
        };

        // Subsequent calls to getDialogHandler can simply be immediately called back with the dialogHandler

        getDialogHandler = function(fnDone)
        {
            fnDone(theDialogHandler);
        };

        // Callback anyone who was waiting for a dialogHandler

        for (var n = 0; n < arrFunctionsWaitingForDialogHandler.length; ++n)
        {
            var fn = arrFunctionsWaitingForDialogHandler[n];
            fn(theDialogHandler);
        }
    });
}

