$packageName = 'nodejs-win32.commandline'
$url = 'http://nodejs.org/dist/v0.10.26/node.exe' # download url

try
{ 
  $toolsDir = "$(Split-Path -parent $MyInvocation.MyCommand.Definition)"
  $programFile = "$toolsDir\Node.exe"
  $ignoreFile = "$toolsDir\Node.exe.ignore"

  Get-ChocolateyWebFile $packageName $programFile $url

  # Create a '.ignore' file to stop Chocolatey from automatically creating a 'Node'
  # command, so as not to interfer with any 'Node' command that has already been installed.
  if(!(Test-Path $ignoreFile ))
  {
    New-Item $ignoreFile -ItemType file
  }

  # Instead put in place the command we actually want ('Node-win32')
  Generate-BinFile 'Node-win32' $programFile

  Write-ChocolateySuccess "$packageName"
}
catch
{
  Write-ChocolateyFailure "$packageName" "$($_.Exception.Message)"
  throw 
}

