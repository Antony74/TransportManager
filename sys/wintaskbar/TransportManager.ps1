#
# usage: powershell -ExecutionPolicy unrestricted ./TransportManager.ps1
#

Add-Type -AssemblyName System.Windows.Forms;

$oTaskbarIcon = New-Object System.Windows.Forms.NotifyIcon;

$oTaskbarIcon.Icon = "..\htdocs\icons\Car.ico";
$oTaskbarIcon.Visible = $True;

$sCmd = [system.io.file]::ReadAllText("..\server\TransportManager.bat");

$arrWords = $sCmd.Split(" ");

$oInfo = New-Object System.Diagnostics.ProcessStartInfo;
$oInfo.FileName  = $arrWords[0].Trim("@");
$oInfo.Arguments = $arrWords[1].Trim();
$oInfo.UseShellExecute = $False;
$oInfo.RedirectStandardOutput = $True;
$oInfo.RedirectStandardError = $True;

$oProcess = New-Object System.Diagnostics.Process;
$oProcess.StartInfo = $oInfo;

[Void]$oProcess.Start();

$bDone = $False;

while (!$bDone)
{
	$char = $oProcess.StandardOutput.Read();

	if ($char -eq -1)
	{
		$char = $oProcess.StandardError.Read();
	}

	if ($char -eq -1)
	{
		if ($oProcess.HasExited)
		{
			$bDone = $True;
		}
		else
		{
			Wait-Event 1;
		}
	}
	else
	{
		Write-Host -NoNewline "".PadLeft(1, $char);
	}
}

$oTaskbarIcon.Visible = $False;

