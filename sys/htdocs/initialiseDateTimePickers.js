//
// initialiseDateTimePickers
//
// This would be one line of code - the rest is ensuring the date time pickers don't open
// automatically when you click on the date-time fields, but instead open when you click
// the little calendar buttons.
//
initialiseDateTimePickers = function(oExtraOptions, sPickerQuery, sPickerButtonQuery) {

    var sCurrentPickerButton = '';
    var sOpenPickerButton = '';

    var oOptions =  {
        format     : 'd/m/Y H:i',
        formatTime : 'H:i',
        formatDate : 'd/m/Y',
        yearStart  : 1900,
        onShow     : function () {
            sOpenPickerButton = sCurrentPickerButton;
        },
        onClose    : function () {
            return (sOpenPickerButton != sCurrentPickerButton);
        }
    };

    // Add oExtraOptions to oOptions replacing any existing options, except where we have two function - it's nice that we can call both! :-)
    for (var key in oExtraOptions) {

        var fn1 = oOptions[key];
        var fn2 = oExtraOptions[key];

        if ( $.isFunction(fn1) && $.isFunction(fn2) ) {

            var fnCombined = function() {

                fn1.apply(this, fnCombined.arguments);
                fn2.apply(this, fnCombined.arguments);
            };

             oOptions[key] = fnCombined;

        } else {

            oOptions[key] = oExtraOptions[key];

        }
    }

    $(sPickerQuery).datetimepicker(oOptions);

    $(sPickerQuery).off('open.xdsoft focusin.xdsoft mousedown.xdsoft');

    $(sPickerButtonQuery).mouseenter(function(event) {

        sCurrentPickerButton = event.target['id'];

    }).mouseleave(function() {

        sCurrentPickerButton = '';

    }).click(function () {
        sOpenPickerButton = '';

        var ctrl = $('#' + this.id.substring(0, this.id.length - '_button'.length));
        ctrl.datetimepicker({value: ctrl.val()});
        ctrl.datetimepicker('toggle');
    });
};

// This file is also a good place to define some shared date/time handling functions

function pad(nValue) {
    return ('00' + nValue).slice(-2);
}
                    
function getDDMMYYYY(dateValue) {
    return pad(dateValue.getUTCDate()) + '/' + pad(dateValue.getUTCMonth() + 1) + '/' + dateValue.getUTCFullYear();
}

getHHMM = function(dateValue) {
    return pad(dateValue.getUTCHours()) + ':' + pad(dateValue.getUTCMinutes());
};

parseDate = function(sDate) {
    return parseDateTime(sDate, true);
};

function parseDateTime(sDateTime, bDateOnly) {

    var nYear   = 0;
    var nMonth  = 0;
    var nDay    = 0;
    var nHour   = 0;
    var nMinute = 0;
    var nSecond = 0;

    var arrDateTime = sDateTime.split(' ');

    if (arrDateTime.length == 2 && bDateOnly == false) {

        var arrTime = arrDateTime.pop().split(':');

        if (arrTime.length == 3) {

            nSecond = parseInt(arrTime.pop());

            if (nSecond > 59 || nSecond < 0) {
                return null; // Invalid time
            }
        }

        if (arrTime.length == 2) {

            nHour   = parseInt(arrTime[0]);
            nMinute = parseInt(arrTime[1]);

            if (nHour > 23 || nHour < 0 || nMinute > 59 || nMinute < 0) {
                return null; // Invalid time
            }

        } else {
            return null; // Invalid time
        }
    }

    if (arrDateTime.length == 1) {

        var arrDate = arrDateTime[0].split('/');

        if (arrDate.length == 1) {
            // There's no harm in accepting dash as an alternative date-seperator
            arrDate = arrDateTime[0].split('-');
        }

        if (arrDate.length == 3) {

            nYear  = parseInt(arrDate[2]);
            nMonth = parseInt(arrDate[1]);
            nDay  = parseInt(arrDate[0]);

            if (nMonth < 1 || nMonth > 12 || nDay < 1 || nDay > 31) {
                return null; // Invalid date
            }

            if (nYear < 1901) {

                return null; // Assume this is an error - at the time of writing there might be a handful of people born earlier still alive, but none of them are on our books.

            } else if (nYear > 2099) {

                return null; // Assume this is an error - frankly I expect our system to be replaced with self-driving cars long before then.

            }

            if (nMonth == 2) {

                if (nDay > 28) {

                    if (nDay != 29) {
                        return null; // Invalid date
                    }

                    if (nYear % 4 != 0) {
                        return null; // Invalid date - not a leap-year
                    }

                    if (nYear % 400 == 0) {
                        return null; // Invalid date - a very special non-leap-year
                    }
                }

            } else if (nDay == 31) {

                switch(nMonth) {
                case 9:  // Thirty days has September
                case 4:  // April
                case 6:  // June
                case 11: // and November
                    return null; // Invalid date
                }
            }

        } else {
            return null; // Invalid date-time
        }

    } else {
        return null; // Invalid date-time
    }

    return new Date(Date.UTC(nYear, nMonth - 1, nDay, nHour, nMinute, nSecond));
}

if (typeof(exports) != 'undefined') {
    exports.getDDMMYYYY = getDDMMYYYY;
}

