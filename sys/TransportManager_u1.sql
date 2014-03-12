ALTER TABLE Drivers ADD CONSTRAINT PrimaryKey PRIMARY KEY (DriverID);
ALTER TABLE Destinations ADD CONSTRAINT FKDestinationsTypeID FOREIGN KEY (TypeID) REFERENCES DestinationType;
ALTER TABLE DriverExclusionList ADD CONSTRAINT FKDriverExclusionListDriverID FOREIGN KEY (DriverID) REFERENCES Drivers;
ALTER TABLE DriverExclusionList ADD CONSTRAINT FKDriverExclusionListClientID FOREIGN KEY (ClientID) REFERENCES Clients;
ALTER TABLE DriverVacation ADD CONSTRAINT FKDriverVacationDriverID FOREIGN KEY (DriverID) REFERENCES Drivers;
#ALTER TABLE JobLog ADD CONSTRAINT FKJobLogClientID FOREIGN KEY (ClientID) REFERENCES Clients;
#ALTER TABLE JobLog ADD CONSTRAINT FKJobLogDestinationID FOREIGN KEY (DestinationID) REFERENCES Destinations;
#ALTER TABLE JobLog ADD CONSTRAINT FKJobLogDriverID FOREIGN KEY (DriverID) REFERENCES Drivers;
#ALTER TABLE Jobs ADD CONSTRAINT FKJobsClientID FOREIGN KEY (ClientID) REFERENCES Clients;
#ALTER TABLE Jobs ADD CONSTRAINT FKJobsDestinationID FOREIGN KEY (DestinationID) REFERENCES Destinations;
#ALTER TABLE Jobs ADD CONSTRAINT FKJobsLinkedJobID FOREIGN KEY (LinkedJobID) REFERENCES Jobs;
#ALTER TABLE Jobs ADD CONSTRAINT FKJobsDriverID FOREIGN KEY (DriverID) REFERENCES Drivers;