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

**1. Install git (http://git-scm.com/)**<BR>
This is optional as there are other ways of getting the contents of this repository onto your computer.
I like git because it makes performing subsequent updates easy.

**2. Install NodeJs**<BR>
You need to install a specific version of NodeJs.  Currently [node-v0.10.27-x86.msi](https://nodejs.org/dist/v0.10.27/).  This is because two transport manager node modules are pre-built (dface and winsystraywrapper) - you can of course get around this limitation by rebuilding them yourself against a different (still x86) version of node.

**3. Get the contents of this repository onto you computer**<BR>
Bring up a command prompt, go which and enter or paste the following command:

```
git clone https://github.com/Antony74/TransportManager.git
```

**4. Enter three more commands to finish off the install**

```
cd TransportManager\sys\Server
npm install
node TransportManager.js
```

npm is the Node Package Manager (part of the NodeJs install).
Running npm install in the Server directory, installs any packages that the Transport Manager server requires
(as defined in [package.json](sys/server/package.json)), currently this is just the webserver node-static.

**5. On a test system, optionally create some test-data**<BR>


####Dependency list

For reference here is the full list of the third party components used:

* Windows
* Microsoft JET Database Engine 4.0 (included with Windows since Windows XP Service Pack 2, I believe)
* Node.js (http://nodejs.org/)
* git (optional.  http://git-scm.com/)
* node-static (installed via npm.  https://github.com/cloudhead/node-static)
* JQuery (included in this repository.  http://jquery.com/)
* JQueryUI (included in this repository. http://jqueryui.com/)
* JQuery DateTimePicker (included in this repository.  http://xdsoft.net/jqplugins/datetimepicker/)
* FullCalendar (included in this repository.  http://arshaw.com/fullcalendar/)
* Faker (required for development only; installed via npm.  https://www.npmjs.org/package/Faker)
* PhantomJS (required for development only; install using  npm or manually.   http://phantomjs.org/)
* Processing.js (required for development only; included in this repository.  http://processingjs.org/)

