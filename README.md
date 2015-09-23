##Transport Manager

A database app for community driving schemes.  Community driving schemes help people (often older people)
get to medical appointments and other activities which they might not otherwise be able to reach.
The logistics of organising drives (and funding) can quickly become complicated even for relatively small schemes,
which is why some sort of electronic system may be felt preferable to a paper-based system (such as a diary and
a set of address/index-cards).

Initially developed for Didcot Volunteer Centre.

This is a classic three tier application, with web-front-end and middle-layer both
written in JavaScript.  Not currently intended for remote use (across a
Local-Area-Network would be fine).


####Licence

MIT (https://github.com/Antony74/TransportManager/blob/master/sys/Licence.txt)

Includes a number of third-party components each of which is subject to its own licence.


####Status

In development.


####Operating System

Currently Windows only.  Database and Operating System dependent code is kept in a seperate file to make it
less difficult to write a sustitute if desired.


####Installation

**1. Install git (http://git-scm.com/)**<BR>
This is optional as there are other ways of getting the contents of this repository onto your computer.
I like git because it makes performing subsequent updates easy.  This installation only requires the plain
command line version of git.  (If you are a software developer you may already have git installed / may
prefer one of the downloads which comes bundled with a GUI).

Here is how we can check that the git command line is installed (with example output):

```
C:\>git --version
git version 1.9.5.msysgit.0
```

**2. Install [NodeJs](https://nodejs.org/en/)**<BR>
You need to install a specific version of NodeJs.  Currently [node-v0.10.27-x86.msi](https://nodejs.org/dist/v0.10.27/).  This is because two Transport Manager node modules are pre-built ([dface](sys/server/node_modules/dface) and [winsystraywrapper](sys/server/node_modules/winsystraywrapper) - if you know how to rebuild them yourself then you have more flexibilty about which (x86) version of node you use).

Here is how we can check that the correct version of NodeJs is installed (with example output):

```
C:\>node --version
v0.12.7
```

**3. Get the contents of this repository onto you computer**<BR>
Bring up a command prompt at a suitable location you've choosen to contain the main 'TransportManager' directory, and enter or paste the following command:

```
git clone https://github.com/Antony74/TransportManager.git
```

**4. Enter three more commands to finish off the install**

```
cd TransportManager\sys\Server
npm install
node TransportManager.js
```

The third command runs the TransportManager server for the first time.  This also creates a shortcut in the main
'TransportManager' directory, which is a more convenient way of (subsequently) running the TransportManager.

Here's that command again with example output:

```
C:\TransportManager\sys\server>node TransportManager.js

    T R A N S P O R T   M A N A G E R

Server has been started (http://localhost:8080/)
Database not found... creating empty database
Running C:\TransportManager\sys\server../../TransportManager.sql
Running C:\TransportManager\sys\server../../TransportManagerUpgrade1.sql
Database ready
```

When (as here) we run the TransportManager from the command line, we exit it by pressing CTRL + C.

**5. On a test/play system, optionally create some test-data**<BR>
```
cd ../devutils
node AddSomeTestData.js
```

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

