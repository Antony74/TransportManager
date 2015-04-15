///<reference path='../interface/jqueryui.d.ts' />
///<reference path='../interface/jquery.ui.datetimepicker.d.ts' />

function createDialogHandler(doneFn)
{
    $('#dialogs').load('raw/dialogs.html .dialogTemplate', function()
    {
        var bPickerShown = false;

        $('.datetimepicker').datetimepicker(
            {
                onShow: function()  {bPickerShown = true;},
                onClose: function() {bPickerShown = false;}
            });

        $('.datetimepickerbutton').click(function()
        {
            var sID = '#' + this.id.substring(0, this.id.length - '_button'.length);

            if (bPickerShown)
            {
                $(sID).datetimepicker('show');
                bPickerShown = false;
            }
            else
            {
                $(sID).datetimepicker('hide');
                bPickerShown = true;
            }
        });
    
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
                                $('#dlg' + sCurrentTable).dialog('close');
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

