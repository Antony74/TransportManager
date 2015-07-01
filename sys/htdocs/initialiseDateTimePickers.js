///<reference path='../interface/jquery.ui.datetimepicker.d.ts' />

//
// initialiseDateTimePickers
//
// This would be one line of code - the rest is ensuring the date time pickers don't open
// automatically when you click on the date-time fields, but instead open when you click
// the little calendar buttons.
//
function initialiseDateTimePickers(oExtraOptions)
{
    var sCurrentPickerButton = '';
    var sOpenPickerButton = '';

    var oOptions = 
    {
        format     : 'd/m/Y H:i',
        formatTime : 'H:i',
        formatDate : 'd/m/Y',
        yearStart  : 1900,
        onShow     : function () { sOpenPickerButton = sCurrentPickerButton; },
        onClose    : function () { return (sOpenPickerButton != sCurrentPickerButton); }
    };

    // Add oExtraOptions to oOptions replacing any existing options, except where we have two function - it's nice that we can call both! :-)
    for (var key in oExtraOptions)
    {
        var fn1 = oOptions[key];
        var fn2 = oExtraOptions[key];

        if ( $.isFunction(fn1) && $.isFunction(fn2) )
        {
            var fnCombined = function()
            {
                fn1.apply(this, fnCombined.arguments);
                fn2.apply(this, fnCombined.arguments);
            };

             oOptions[key] = fnCombined;
        }
        else
        {
            oOptions[key] = oExtraOptions[key];
        }
    }

    $('.datetimepicker').datetimepicker(oOptions);

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
}

