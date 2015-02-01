///<reference path='../interface/jqueryui.d.ts' />

function createDialogHandler(doneFn)
{
    $('#dialogs').load('raw/dialogs.html div', function()
    {
        var nDialogWidth = 800;
        var nButtonWidth = 85;

        var dialogClosedFn = null;
        var bDialogChanged = false;
        var oRecord = {};
        var dlg = null;

//                            $(this).find('input').each(function()
//                            {
//                                alert($(this).val());
//                            });

        function commitChanges(bCloseDialog)
        {
            bDialogChanged = true;

            $.post('updateDatabase', JSON.stringify(
            {
                'name': "John",
                'time': {wait: 'what?'}
            }));
            
            if (bCloseDialog)
            {
                dlg.dialog('close');
                dialogClosedFn(bDialogChanged);
            }
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
                            $(this).dialog('close');
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
                dlg = $("#dlg" + currentTable);
                dlg.dialog("open");
            }
        });
    });
}

