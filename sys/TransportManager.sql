
CREATE TABLE Clients(
    ClientID AUTOINCREMENT(1,1) NOT NULL PRIMARY KEY,
    Title TEXT(5),
    Firstname TEXT(15),
    Initial TEXT(1),
    Surname TEXT(15),
    AddressLine1 TEXT(25),
    AddressLine2 TEXT(25),
    Town TEXT(20),
    Postcode TEXT(10),
    HomeNumber TEXT(15),
    MobileNumber TEXT(15),
    EmailAddress TEXT(50),
    IsWheelchair YESNO,
    Notes MEMO,
    IsActive YESNO);

CREATE UNIQUE INDEX ClientID ON Clients(ClientID) WITH DISALLOW NULL;
CREATE INDEX ClientAddressLine1 ON Clients(AddressLine1) WITH DISALLOW NULL;
CREATE INDEX ClientForename ON Clients(Firstname) WITH DISALLOW NULL;
CREATE INDEX ClientSurname ON Clients(Surname) WITH DISALLOW NULL;
CREATE INDEX ClientWeelchair ON Clients(IsWheelchair) WITH DISALLOW NULL;
CREATE INDEX IsActive ON Clients(IsActive) WITH DISALLOW NULL;


CREATE TABLE Destinations(
    DestinationID AUTOINCREMENT(1,1) NOT NULL PRIMARY KEY,
    TypeID INTEGER,
    Name TEXT(30),
    AddressLine1 TEXT(25),
    AddressLine2 TEXT(25),
    Town TEXT(25),
    Postcode TEXT(10));

CREATE INDEX DestinationID ON Destinations(DestinationID) WITH DISALLOW NULL;
CREATE INDEX DestinationName ON Destinations(Name) WITH DISALLOW NULL;
CREATE INDEX DestinationType ON Destinations(TypeID) WITH DISALLOW NULL;


CREATE TABLE DestinationType(
    DestinationTypeID AUTOINCREMENT(1,1) NOT NULL PRIMARY KEY,
    DestinationLevel1 TEXT(30),
    DestinationLevel2 TEXT(30));

CREATE INDEX DestinationID ON DestinationType(DestinationTypeID) WITH DISALLOW NULL;


CREATE TABLE DriverExclusionList(
    DriverID INTEGER,
    ClientID INTEGER);

CREATE INDEX ClientID ON DriverExclusionList(ClientID) WITH DISALLOW NULL;
CREATE INDEX DriverID ON DriverExclusionList(DriverID) WITH DISALLOW NULL;


CREATE TABLE Drivers(
    DriverID INTEGER,
    Title TEXT(6),
    Firstname TEXT(25),
    Surname TEXT(25),
    DateofBirth DATE,
    AddressLine1 TEXT(25),
    AddressLine2 TEXT(25),
    Town TEXT(20),
    Postcode TEXT(10),
    HomeNumber TEXT(15),
    MobileNumber TEXT(15),
    EmailAddress TEXT(50),
    RegistrationNumber TEXT(10),
    LicenceNumber TEXT(20),
    ExpiryDate DATE,
    CarBrand TEXT(15),
    CarModel TEXT(25),
    IsWheelchair YESNO,
    IsActive YESNO,
    Notes MEMO,
    LDO YESNO,
    Mon YESNO,
    Tue YESNO,
    Wed YESNO,
    Thu YESNO,
    Fri YESNO,
    Sat YESNO,
    Sun YESNO);

CREATE INDEX DriverDateofBirth ON Drivers(DateofBirth) WITH DISALLOW NULL;
CREATE INDEX DriverForename ON Drivers(Firstname) WITH DISALLOW NULL;
CREATE INDEX DriverIsActive ON Drivers(IsActive) WITH DISALLOW NULL;
CREATE INDEX DriverSurname ON Drivers(Surname) WITH DISALLOW NULL;
CREATE INDEX DriverWeelchair ON Drivers(IsWheelchair) WITH DISALLOW NULL;
CREATE INDEX ExpiryDate ON Drivers(ExpiryDate) WITH DISALLOW NULL;


CREATE TABLE DriverVacation(
    VacationID AUTOINCREMENT(1,1) NOT NULL PRIMARY KEY,
    VacationEntryDateTime DATE,
    DriverID INTEGER,
    VacationFrom DATE,
    VacationTo DATE);

CREATE INDEX DriverID ON DriverVacation(DriverID) WITH DISALLOW NULL;
CREATE INDEX VacationID ON DriverVacation(VacationID) WITH DISALLOW NULL;


CREATE TABLE JobLog(
    JobID INTEGER,
    JobLogDateTime DATE,
    UserID INTEGER,
    ClientID INTEGER,
    DestinationID INTEGER,
    DriverID INTEGER,
    JobStatus TEXT(40),
    JobNextStep TEXT(40),
    CallSource TEXT(10),
    CallNumber TEXT(50),
    CallResolution TEXT(50));

CREATE INDEX ClientID ON JobLog(ClientID) WITH DISALLOW NULL;
CREATE INDEX DestinationID ON JobLog(DestinationID) WITH DISALLOW NULL;
CREATE INDEX DriverID ON JobLog(DriverID) WITH DISALLOW NULL;
CREATE INDEX JobClientUserID ON JobLog(UserID) WITH DISALLOW NULL;
CREATE INDEX JobID ON JobLog(JobID) WITH DISALLOW NULL;


CREATE TABLE Jobs(
    JobID AUTOINCREMENT(1,1) NOT NULL PRIMARY KEY,
    JobEntryDateTime DATE,
    ClientID INTEGER,
    DestinationID INTEGER,
    LinkedJobID INTEGER,
    JobAppointmentDateTime DATE,
    JobIsDVOWheelchair YESNO,
    Notes MEMO,
    Status TEXT(40),
    IsJobOneWay YESNO,
    PickUpSite TEXT(15),
    DriverID INTEGER,
    JobPickUpDateTime DATE);

CREATE INDEX ClientID ON Jobs(ClientID) WITH DISALLOW NULL;
CREATE INDEX DestinationID ON Jobs(DestinationID) WITH DISALLOW NULL;
CREATE INDEX DriverID ON Jobs(DriverID) WITH DISALLOW NULL;
CREATE INDEX JobID ON Jobs(JobID) WITH DISALLOW NULL;
CREATE INDEX LinkedJobID ON Jobs(LinkedJobID) WITH DISALLOW NULL;

