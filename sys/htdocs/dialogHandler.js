///<reference path='../interface/jqueryui.d.ts' />

function createDialogHandler(doneFn)
{
    $('#dialogs').load('raw/dialogs.html .dialogTemplate', function()
    {
        var nDialogWidth = 800;
        var nButtonWidth = 85;

        var dialogClosedFn = null;
        var bDialogChanged = false;
        var bDialogButtonsEnabled = true;
        var oRecord = {};
        var sDlgId = '';

//                            $(this).find('input').each(function()
//                            {
//                                alert($(this).val());
//                            });

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
            var statusBar = $(sDlgId + ' .dialogStatus').find('td');
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

            $.ajax(
            {
                url  : 'updateDatabase',
                type : 'POST',
                data : '{', // Passing the correct data is my next task, this is delibrately invalid to test my error handling
                success: function(data)
                {
                    var oData = JSON.parse(data);

                    if (typeof oData.Error != undefined)
                    {
                        setStatus(oData.Error, 'R');
                    }
                    else
                    {
                        setStatus('Ready', 'G');

                        if (bCloseDialog)
                        {
                            $(sDlgId).dialog('close');
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
                        text  : 'Apply',
                        id    : 'dialogApply',
                        class : 'leftButton',
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
                                $(sDlgId).dialog('close');
                                dialogClosedFn(bDialogChanged);
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

        $('.leftButton').css('margin-right', nDialogWidth - (nButtonWidth * 4.1));

        doneFn(
        {
            doDialog: function(currentTable, _oRecord, _dialogClosedFn)
            {
                bDialogButtonsEnabled = true;
                bDialogChanged = false;
                dialogClosedFn = _dialogClosedFn;
                oRecord = _oRecord;
                sDlgId = "#dlg" + currentTable;
                $(sDlgId).dialog("open");
                setStatus('Ready', 'G');
            }
        });
    });
}

