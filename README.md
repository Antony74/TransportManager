##TransportManager

A database app for community driving schemes - initially and primarily developed for Didcot Volunteer Centre.
This is a classic three tier application, with web-front-end and middle-layer both
written in JavaScript.  Not currently intended for remote use (across a
Local-Area-Network would be fine).


####Licence

MIT (https://github.com/Antony74/TransportManager/blob/master/sys/Licence.txt)


####Status

Early development.


####Requirements

* Windows
* Microsoft JET Database Engine (http://www.microsoft.com/en-us/download/details.aspx?id=13255)
* Node.js (http://nodejs.org/)
* git (http://git-scm.com/)

Database and Operating System dependent code will be kept in a seperate file to make less
difficult to write a sustitute if desired.  Many Windows systems will already have
Microsoft JET Database Engine - indeed I haven't found one without it to test this part
of the installation process.  Git is suggested for convenience, but there
are obviously other means of deployment such and downloading and extracting from a zip file.


####Other libraries automatically included

This is just for reference, no action is required, these are included automatically when you follow the install instructions.

* node-win32ole (http://idobatter.github.io/node-win32ole/)
* node-static (https://github.com/cloudhead/node-static)
* JQuery (http://jquery.com/)
* JQueryUI (http://jqueryui.com/)
* FullCalandar (http://arshaw.com/fullcalendar/)


####Installation

As stated in the requirements, you need a Windows computer with Microsoft JET, Node.js and git installed on it.
Installing TransportManager and running it for the first time should simply be a matter of bringing up a
command prompt and entering each of these commands in turn:

    git clone https://github.com/Antony74/TransportManager.git
    cd TransportManager\sys\Server
    npm install node-static
    node TransportManager.js

    
