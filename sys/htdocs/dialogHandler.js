///<reference path='../interface/jqueryui.d.ts' />

function createDialogHandler(doneFn)
{
    $('#dialogs').load('raw/dialogs.html div', function()
    {
        var nDialogWidth = 800;
        var nButtonWidth = 85;

        var dialogClosedFn = null;
        var bDialogChanged = false;

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
                            bDialogChanged = true;
                        }
                    },
                    {
                        text: "OK",
                        icons: {primary: 'ui-icon-check'},
                        width: nButtonWidth,
                        click: function()
                        {
//                            $(this).find('input').each(function()
//                            {
//                                alert($(this).val());
//                            });

                            $(this).dialog('close');
                            dialogClosedFn(true);
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
            doDialog: function(currentTable, doneFn)
            {
                bDialogChanged = false;
                dialogClosedFn = doneFn;
                var dlg = $("#dlg" + currentTable);
                dlg.dialog("open");
            }
        });
    });
}

