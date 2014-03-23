##TransportManager

A database app for community driving schemes - initially developed for Didcot Volunteer Centre.
This is a classic three tier application, with web-front-end and middle-layer both
written in JavaScript.  Not currently intended for remote use (across a
Local-Area-Network would be fine).


####Licence

MIT (https://github.com/Antony74/TransportManager/blob/master/sys/Licence.txt)

Includes a number of third-party components each of which is subject to its own licence.


####Status

In development.


####Operating System

Currently Windows only.  Database and Operating System dependent code is kept in a seperate file to make less
difficult to write a sustitute if desired.


####Installation

Use of the [Chocolatey](https://chocolatey.org/) package management system is recommended for ease of installation.

Start by bringing up a command prompt.  If you do not already have Chocolatey installed, the command to get and install it is:

    @powershell -NoProfile -ExecutionPolicy unrestricted -Command "iex ((new-object net.webclient).DownloadString('https://chocolatey.org/install.ps1'))" && SET PATH=%PATH%;%systemdrive%\chocolatey\bin

This is long so you'll want to copy and paste it.  Once Chocolatey is installed, the command to install Transport Manager is

    cinst TransportManager -Pre 

Don't worry - it's just those two commands and installation is complete!

Transport Manager is installed to C:\TransportManager

(It's not too difficult to move this folder elsewhere, but there is a .url and a .bat file that would need updating or deleting, and you will not be able to use Chocolatey to keep it the Transport Manager program up to date... use git instead).


####Installation without Chocolatey

If you would prefer not to use the Chocolatey package manager for installation then you will need to ensure a 32-bit Windows build of [Node.js](http://nodejs.org/) has been downloaded and installed.  You will also need to clone this repository or download the files within it (e.g. git clone https://github.com/Antony74/TransportManager.git)

After that the following commands are required to finish off the installation and run the Transport Manager for the first time (note that npm is the package manager included with Node.js).

    cd TransportManager\sys\Server
    npm install
    node TransportManager.js


####Dependency list

For reference here is the full list of the third party components used:

* Windows
* Microsoft JET Database Engine 4.0 (included with Windows since Windows XP Service Pack 2, I believe)
* Chocolatey (optional.  https://chocolatey.org/)
* Node.js (installed by Chocolatey.  http://nodejs.org/)
* git (optional; installed by Chocolatey.  http://git-scm.com/)
* node-win32ole (included in this repository.  http://idobatter.github.io/node-win32ole/)
* node-static (installed by npm, triggered by Chocolatey.  https://github.com/cloudhead/node-static)
* JQuery (included in this repository.  http://jquery.com/)
* JQueryUI (included in this repository.  http://jqueryui.com/)
* FullCalendar (included in this repository.  http://arshaw.com/fullcalendar/)
* Faker (required for development only; install using npm.  https://www.npmjs.org/package/Faker)
* PhantomJS (required for development only; install using Chocolatey or npm or manually.   http://phantomjs.org/)
* Processing.js (required for development only; included in this repository.  http://processingjs.org/)

