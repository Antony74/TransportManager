#
# usage: powershell -ExecutionPolicy unrestricted ./TransportManager.ps1
#

Add-Type -AssemblyName System.Windows.Forms;

$MenuItem = New-Object System.Windows.Forms.MenuItem("Stop");

$MenuItem.Add_Click({
	Write-Host "Stopping";

	$r = [System.Net.WebRequest]::Create("http://localhost:8080/quitTransportManager")
	$resp = $r.GetResponse()
	$reqstream = $resp.GetResponseStream()
	$sr = new-object System.IO.StreamReader $reqstream
	$result = $sr.ReadToEnd()
	write-host $result

	$oProcess.dispose();
});

$ContextMenu = New-Object System.Windows.Forms.ContextMenu;
$ContextMenu.MenuItems.AddRange($MenuItem);

$oTaskbarIcon = New-Object System.Windows.Forms.NotifyIcon;
$oTaskbarIcon.Icon = "..\htdocs\icons\Car.ico";
$oTaskbarIcon.ContextMenu = $ContextMenu;

$oTaskbarIcon.Visible = $True;

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

$timer = New-Object System.Windows.Forms.Timer;
$timer.Interval = 100;
$timer.Add_Tick({

	$timer.Stop();

	$bDone = $False;

	while ( (!$bDone) -and ($oProcess.StandardOutput -ne $null) )
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

$timer.Start();

[System.Windows.Forms.Application]::Run();

#
# Time to exit
#

$oTaskbarIcon.Visible = $False;

