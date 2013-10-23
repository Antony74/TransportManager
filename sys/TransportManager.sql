
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

CREATE TABLE Destinations(
    DestinationID AUTOINCREMENT(1,1) NOT NULL PRIMARY KEY,
    TypeID INTEGER,
    Name TEXT(30),
    AddressLine1 TEXT(25),
    AddressLine2 TEXT(25),
    Town TEXT(25),
    Postcode TEXT(10));

CREATE TABLE DestinationType(
    DestinationTypeID AUTOINCREMENT(1,1) NOT NULL PRIMARY KEY,
    DestinationLevel1 TEXT(30),
    DestinationLevel2 TEXT(30));

CREATE TABLE DriverExclusionList(
    DriverID INTEGER,
    ClientID INTEGER);

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

CREATE TABLE DriverVacation(
    VacationID AUTOINCREMENT(1,1) NOT NULL PRIMARY KEY,
    VacationEntryDateTime DATE,
    DriverID INTEGER,
    VacationFrom DATE,
    VacationTo DATE);

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
