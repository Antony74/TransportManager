///<reference path='../interface/jqueryui.d.ts' />
///<reference path='../interface/jquery.ui.datetimepicker.d.ts' />

function createDialogHandler(doneFn)
{
    $('#dialogs').load('raw/dialogs.html .dialogTemplate', function()
    {
    	// Set up datetimepickers.  This would be one line of code - the rest is ensuring
    	// they don't open automatically when you click on the date-time fields, but instead
		// open when you click the little calendar buttons.
        var sCurrentPickerButton = '';
        var sOpenPickerButton = '';

        $('.datetimepicker').datetimepicker(
            {
                format     : 'd/m/Y H:i',
                formatTime : 'H:i',
                formatDate : 'd/m/Y',
                yearStart  : 1900,
                onShow     : function () { sOpenPickerButton = sCurrentPickerButton; },
                onClose    : function () { return (sOpenPickerButton != sCurrentPickerButton); }
            });

        $('.datetimepicker').off('open.xdsoft focusin.xdsoft mousedown.xdsoft');

        $('.datetimepickerbutton').mouseenter(function(event)
        {
        	sCurrentPickerButton = event.target['id'];
		}).mouseleave(function()
		{
			sCurrentPickerButton = '';
		}).click(function ()
        {
			sOpenPickerButton = '';

			var ctrl = $('#' + this.id.substring(0, this.id.length - '_button'.length));
			ctrl.datetimepicker({value: ctrl.val()});
			ctrl.datetimepicker('toggle');
		});
		// Done setting up datetimepickers
    
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

            $.ajax(
            {
                url  : 'updateDatabase',
                type : 'POST',
                data : JSON.stringify(oCommitData, null, 4),
                success: function(data)
                {
                    var oData = JSON.parse(data);

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
                },
                error: function(jqXHR, textStatus, errorThrown)
                {
                    if (textStatus == 'timeout')
                    {
                        textStatus = 'Request timed out';
                    }
                    else if (jqXHR.status == 0)
                    {
                        textStatus = 'No reponse from server';
                    }

                    setStatus(textStatus, 'R');
                },
                timeout: 6000,
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

        doneFn(
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
        });
    });
}

