#
# usage: powershell -ExecutionPolicy unrestricted ./TransportManager.ps1 -serverExe [path-to-node.exe] -serverArgument [path-to-TransportManager.js]
#
# A thin GUI wrapper for tucking away our main server process neatly away on the Windows task bar.
#

param(
	[string] $serverExe,
	[string] $serverArgument);

$sScriptDir = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition;

Add-Type -AssemblyName System.Windows.Forms;

#
# Control-C doesn't work very will in conjunction with Timers - you get a System.Management.Automation.PipelineStoppedException.
# Unless there's anything that can be done about it, I prefer ignoring control-c rather than letting it make that particular mess.
#

[console]::TreatControlCAsInput = $true;

#
# Pull in a bunch of native win32 stuff so that we can hide on minimise, and disable the close button
#

$MethodsCall = '
[DllImport("user32.dll")] public static extern long GetSystemMenu(IntPtr hWnd, bool bRevert);
[DllImport("user32.dll")] public static extern bool EnableMenuItem(long hMenuItem, long wIDEnableItem, long wEnable);
[DllImport("user32.dll")] public static extern bool ShowWindow(long hWnd, int nCmdShow);
[DllImport("user32.dll")] public static extern long GetWindowLong(long hWnd, long nIndex);
[DllImport("user32.dll")] public static extern bool SetWindowText(long hWnd, string sText);
';
 
Add-Type -MemberDefinition $MethodsCall -name NativeMethods -namespace Win32;
 
$MF_DISABLED = 0x00000002L;
$SC_CLOSE    = 0xF060;
$GWL_STYLE   = -16;
$WS_MINIMIZE = 0x20000000L;
$SW_HIDE     = 0;
$SW_SHOW     = 5;
$SW_RESTORE  = 9;

$hwnd = [System.Diagnostics.Process]::GetCurrentProcess().MainWindowHandle;

if ($hwnd)
{
	[Void][Win32.NativeMethods]::SetWindowText($hwnd, "Transport Manager");

	# Get system menu of our main window
	$hMenu = [Win32.NativeMethods]::GetSystemMenu($hwnd, 0);

	# Disable the close button
	[Void][Win32.NativeMethods]::EnableMenuItem($hMenu, $SC_CLOSE, $MF_DISABLED);
}

#
# If we don't have our server parameters, parse them out of the batch file
#

if ( ($serverExe -eq "") -or ($serverArgument -eq "") )
{
	$sCmd = [system.io.file]::ReadAllText("$sScriptDir\..\server\TransportManager.bat");
	$arrQuotedThings = $sCmd.Split('"');
	$serverExe = $arrQuotedThings[1];
	$serverArgument = $arrQuotedThings[3];
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
	if ($hwnd)
	{
		[Void][Win32.NativeMethods]::ShowWindow($hWnd, $SW_RESTORE);
		$global:bServerLogVisible = $true;
	}
});

#
# Create a "Stop" menu item
#

$global:bForceStop = $false;

$menuStop = New-Object System.Windows.Forms.MenuItem("Stop");

$menuStop.Add_Click({
	Write-Host "Stopping";

	#
	# Give the server 15 seconds to stop nicely, then set the variable to force it to stop
	#

	$timerForce = New-Object System.Windows.Forms.Timer;
	$timerForce.Interval = 15000;
	$timerForce.Add_Tick({
		$this.Stop();
		$global:bForceStop = $true;
	});

	$timerForce.Start();

	#
	# Send the server the http request to try to get it to stop nicely.
	# We need to close our request nicely or the server wont close nicely.
	# Putting our request a seperate job is one way of achieving this.
	#

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
$oTaskbarIcon.Icon = New-Object System.Drawing.Icon("$sScriptDir\..\htdocs\icons\Car.ico");
$oTaskbarIcon.ContextMenu = $ContextMenu;

$oTaskbarIcon.Add_MouseDoubleClick({
	param($sender, $mouseEventArgs);	
	
	if ($mouseEventArgs.Button -eq [System.Windows.Forms.MouseButtons]::Left)
	{
		Start-Process -FilePath "cmd" -ArgumentList @("/c", "start", "http://localhost:8080");
	}
});

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

$global:bServerLogVisible = $true;

#
# Create a sort of event loop so that we can display the server log
# at the same time as processing application events
#

$timerStartup = New-Object System.Windows.Forms.Timer;
$timerStartup.Interval = 100;
$timerStartup.Add_Tick({

	$timerStartup.Stop();

	#
	# Poll the window so we can hide it if it's minimised
	#

	$timerPoll = New-Object System.Windows.Forms.Timer;
	$timerPoll.Interval = 100;

	$timerPoll.Add_Tick({

		if ($global:bServerLogVisible -and $hwnd)
		{
			$nStyle = [Win32.NativeMethods]::GetWindowLong($hwnd, $GWL_STYLE);

			if ($nStyle -band $WS_MINIMIZE)
			{
				[Void][Win32.NativeMethods]::ShowWindow($hWnd, $SW_HIDE);
				$global:bServerLogVisible = $false;
			}
		}
	});

	$timerPoll.Start();

	#
	# Now we can get on with the event loop
	#

	$bDone = $False;

	while (!$bDone)
	{
		$char = $oProcess.StandardOutput.Peek();

		if ($char -ne -1)
		{
			$char = $oProcess.StandardOutput.Read();
		}
		else
		{
			$char = $oProcess.StandardError.Peek();

			if ($char -ne -1)
			{
				$char = $oProcess.StandardError.Read();
			}
		}

		if ($char -eq -1)
		{
			if ($oProcess.HasExited)
			{
				$bDone = $True;

				if ($oProcess.ExitCode -ne 0)
				{
					[Void][Win32.NativeMethods]::ShowWindow($hWnd, $SW_RESTORE);
					[System.Windows.Forms.MessageBox]::Show("Transport Manager exited with an error")
				}
			}
			else
			{
				wait-event -Timeout 1;
				[System.Windows.Forms.Application]::DoEvents();
			}

			if ($global:bForceStop -eq $true)
			{
				$oProcess.Kill();
				$bDone = $true;
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

$timerStartup.Start();

[System.Windows.Forms.Application]::Run();

#
# Time to exit
#

$oTaskbarIcon.Visible = $False;

