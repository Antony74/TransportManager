#
# usage: powershell -ExecutionPolicy unrestricted ./TransportManager.ps1
#

Add-Type -AssemblyName System.Windows.Forms;

$objNotifyIcon = New-Object System.Windows.Forms.NotifyIcon;

$objNotifyIcon.Icon = "..\htdocs\icons\Car.ico";
$objNotifyIcon.Visible = $True;

