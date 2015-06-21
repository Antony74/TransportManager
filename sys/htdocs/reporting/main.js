///<reference path='../initialiseDateTimePickers.ts' />

$(document).ready(function()
{
    initialiseDateTimePickers(
    {
        timepicker : false,
        format     : 'd/m/Y'
    });

    $('#generateSlaReport').click(function()
    {
        alert('Antony is still working on the SLA report');
    });

    $('#generateDriverActivityReport').click(function()
    {
        alert('Antony is still working on the Driver Activity report');
    });

    $('#generateDestinationSummaryReport').click(function()
    {
        alert('Antony is still working on the Destination Summary report');
    });

    $('#generateCancellationListReport').click(function()
    {
        alert('Antony is still working on the Cancellation List report');
    });

});

