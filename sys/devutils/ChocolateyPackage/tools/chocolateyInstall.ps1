if (Test-Path c:\TransportManager)
{
	if (Test-Path c:\TransportManager\.git)
	{
		cd c:\TransportManager
		git pull
	}
	elseif (Test-Path c:\NewTransportManager)
	{
		cd c:\NewTransportManager
		git pull
	}
	else
	{
		git clone https://github.com/Antony74/TransportManager.git c:\NewTransportManager
		cd c:\NewTransportManager
	}
}
else
{
	git clone https://github.com/Antony74/TransportManager.git c:\TransportManager
	cd c:\TransportManager
}

cd sys\server
npm install
node TransportManager.js -Q
