
# We'd like to add some extra fields to the Clients table, but we can't until compatibility with the old system is no longer required.
# So this is a temporary workaround.

CREATE TABLE ClientsEx(
    ClientID INTEGER NOT NULL,
    CONSTRAINT PrimaryKey PRIMARY KEY(ClientID),
    DateofBirth DATE,
    Gender TEXT(1),
    CHECK (Gender = 'M' OR Gender = 'F' OR Gender = 'X'));

