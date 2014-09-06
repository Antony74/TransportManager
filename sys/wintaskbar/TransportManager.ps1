#
# usage: powershell -ExecutionPolicy unrestricted ./TransportManager.ps1 -serverExe [path-to-node.exe] -serverArgument [path-to-TransportManager.js]
#
# A thin GUI wrapper for tucking away our main server process neatly away on the Windows task bar.
#

param(
	[string] $serverExe,
	[string] $serverArgument);

Add-Type -AssemblyName System.Windows.Forms;

#
# If we don't have our server parameters, parse them out of the batch file
#

if ( ($serverExe -eq "") -or ($serverArgument -eq "") )
{
	$sCmd = [system.io.file]::ReadAllText("..\server\TransportManager.bat");
	$arrWords = $sCmd.Split('"');
	$serverExe = $arrWords[1];
	$serverArgument = $arrWords[3];
}

#
# Create a "Transport Manager" menu item
#

$menuTransportManager = New-Object System.Windows.Forms.MenuItem("Transport Manager");

$menuTransportManager.Add_Click({
	Start-Process -FilePath "cmd" -ArgumentList @("/c", "start", "http://localhost:8080");
});

#
# Create a "Server Log" menu item
#

$menuServerLog = New-Object System.Windows.Forms.MenuItem("Server Log");

$menuServerLog.Add_Click({
});

#
# Create a "Stop" menu item
#

$menuStop = New-Object System.Windows.Forms.MenuItem("Stop");

$menuStop.Add_Click({
	Write-Host "Stopping";

	# If we want the server to close nicely we need to close the connection we make to it cleanly.
	# Putting our request a seperate job is one way of achieving this.
	$job = Start-Job({
		$request = [System.Net.WebRequest]::Create("http://localhost:8080/quitTransportManager");
		$reader = new-object System.IO.StreamReader $request.GetResponse().GetResponseStream();
		$result = $reader.ReadToEnd();
	});

	Receive-Job -wait $job;
	$job.Dispose();
});

#
# Create menu and add the items
#

$ContextMenu = New-Object System.Windows.Forms.ContextMenu;
[Void]$ContextMenu.MenuItems.Add($menuTransportManager);
[Void]$ContextMenu.MenuItems.Add($menuServerLog);
[Void]$ContextMenu.MenuItems.Add($menuStop);

#
# Create taskbar icon
#

$oTaskbarIcon = New-Object System.Windows.Forms.NotifyIcon;
$oTaskbarIcon.Icon = "..\htdocs\icons\Car.ico";
$oTaskbarIcon.ContextMenu = $ContextMenu;

$oTaskbarIcon.Visible = $True;

#
# Run the server (parse the batch file for a command line to use)
#

$oInfo = New-Object System.Diagnostics.ProcessStartInfo;
$oInfo.FileName  = $serverExe;
$oInfo.Arguments = $serverArgument;
$oInfo.UseShellExecute = $False;
$oInfo.RedirectStandardOutput = $True;
$oInfo.RedirectStandardError = $True;

$oProcess = New-Object System.Diagnostics.Process;
$oProcess.StartInfo = $oInfo;

[Void]$oProcess.Start();

#
# Create a sort of event loop so that we can display the server log
# at the same time as processing application events
#

$timer = New-Object System.Windows.Forms.Timer;
$timer.Interval = 100;
$timer.Add_Tick({

	$timer.Stop();

	$bDone = $False;

	while (!$bDone)
	{
		$char = $oProcess.StandardOutput.Peek();

		if ($char -ne -1)
		{
			$char = $oProcess.StandardOutput.Read();
		}

		if ($char -eq -1)
		{
			if ($oProcess.HasExited)
			{
				$bDone = $True;
			}
			else
			{
				[System.Windows.Forms.Application]::DoEvents();
			}
		}
		else
		{
			Write-Host -NoNewline "".PadLeft(1, $char);
		}
	}

	[System.Windows.Forms.Application]::Exit();
});

#
# Now we're all set up and good to run
#

$timer.Start();

[System.Windows.Forms.Application]::Run();

#
# Time to exit
#

$oTaskbarIcon.Visible = $False;

