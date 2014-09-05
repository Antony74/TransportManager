#
# usage: powershell -ExecutionPolicy unrestricted ./TransportManager.ps1
#
# A thin GUI wrapper for tucking away our main server process neatly away on the Windows task bar.
#

Add-Type -AssemblyName System.Windows.Forms;

#
# Create a "Stop" menu item
#

$MenuItem = New-Object System.Windows.Forms.MenuItem("Stop");

$MenuItem.Add_Click({
	Write-Host "Stopping";

	$job = Start-Job({
		$request = [System.Net.WebRequest]::Create("http://localhost:8080/quitTransportManager");
		$reader = new-object System.IO.StreamReader $request.GetResponse().GetResponseStream();
		$result = $reader.ReadToEnd();
	});

	Receive-Job -wait $job;
	$job.Dispose();
});

#
# Create menu and add items
#

$ContextMenu = New-Object System.Windows.Forms.ContextMenu;
[Void]$ContextMenu.MenuItems.Add($MenuItem);

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

$sCmd = [system.io.file]::ReadAllText("..\server\TransportManager.bat");

$arrWords = $sCmd.Split('"');

$oInfo = New-Object System.Diagnostics.ProcessStartInfo;
$oInfo.FileName  = $arrWords[1];
$oInfo.Arguments = $arrWords[3];
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

