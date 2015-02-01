///<reference path='../interface/jqueryui.d.ts' />

function createDialogHandler(doneFn)
{
    $('#dialogs').load('raw/dialogs.html .dialogTemplate', function()
    {
        var nDialogWidth = 800;
        var nButtonWidth = 85;

        var dialogClosedFn = null;
        var bDialogChanged = false;
        var oRecord = {};
        var sDlgId = '';

//                            $(this).find('input').each(function()
//                            {
//                                alert($(this).val());
//                            });

        function setStatus(sStatus, bOK)
        {
            var statusBar = $(sDlgId + ' .dialogStatus').find('td');
            if (bOK)
            {
                // TO DO: DISABLE BUTTONS FOR ANYTHING THAT IS NOT A READY STATUS
                statusBar.html('Status: ' + sStatus).addClass('dialogStatusOK').removeClass('dialogStatusError');
            }
            else
            {
                if (sStatus.indexOf('SyntaxError:') != 0)
                {
                    sStatus = 'Error: ' + sStatus;
                }

                statusBar.html(sStatus).addClass('dialogStatusError').removeClass('dialogStatusOK');
            }
        }

        function commitChanges(bCloseDialog)
        {
            setStatus('Updating', true);
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
                        setStatus(oData.Error, false);
                    }
                    else
                    {
                        setStatus('Ready', true);

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

                    setStatus(textStatus, false);
                },
                timeout: 6000,
            });
        }

        $('#dialogs div').each(function()
        {
            $(this).dialog(
            {
                modal: true,
                autoOpen: false,
                width: nDialogWidth,
                buttons:
                [
                    {
                        text: "Apply",
                        class: 'leftButton',
                        icons: {primary: 'ui-icon-check'},
                        width: nButtonWidth,
                        click: function()
                        {
                            commitChanges(false);
                        }
                    },
                    {
                        text: "OK",
                        icons: {primary: 'ui-icon-check'},
                        width: nButtonWidth,
                        click: function()
                        {
                            commitChanges(true);
                        }
                    },
                    {
                        text: "Cancel",
                        width: nButtonWidth,
                        icons: {primary: 'ui-icon-closethick'},
                        click: function()
                        {
                            $(sDlgId).dialog('close');
                            dialogClosedFn(bDialogChanged);
                        }
                    },

                ],
            });
        });

        $('.leftButton').css('margin-right', nDialogWidth - (nButtonWidth * 4.1));

        doneFn(
        {
            doDialog: function(currentTable, _oRecord, _dialogClosedFn)
            {
                bDialogChanged = false;
                dialogClosedFn = _dialogClosedFn;
                oRecord = _oRecord;
                sDlgId = "#dlg" + currentTable;
                $(sDlgId).dialog("open");
                setStatus('Ready', true);
            }
        });
    });
}

