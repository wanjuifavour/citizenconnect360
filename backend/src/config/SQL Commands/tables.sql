-- Users Table
CREATE TABLE [User] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL CHECK (role IN ('admin', 'citizen', 'leader')) DEFAULT ('citizen'),
    isDeleted BIT DEFAULT 0,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

-- Incidents Table
CREATE TABLE Incident (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    category NVARCHAR(50) NOT NULL CHECK (category IN ('Corruption', 'Crime', 'Human Rights Violation', 'Natural Disaster', 'Insecurity', 'Power Outage')),
    status NVARCHAR(50) NOT NULL CHECK (status IN ('Verified', 'Unverified')) DEFAULT 'Unverified',
    reportedBy INT NOT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (reportedBy) REFERENCES [User](id)
);

-- Media Table
CREATE TABLE Media (
    id INT IDENTITY(1,1) PRIMARY KEY,
    type NVARCHAR(50) NOT NULL CHECK (type IN ('PHOTO', 'VIDEO')),
    url NVARCHAR(MAX) NOT NULL,
    incidentId INT NOT NULL,
    FOREIGN KEY (incidentId) REFERENCES Incident(id)
);

-- Polls Table
CREATE TABLE Poll (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    category NVARCHAR(255) NOT NULL,
    options NVARCHAR(MAX) NOT NULL,
    status NVARCHAR(50) NOT NULL  CHECK (status IN ('unverified', 'open', 'closed', 'suspended')),
    createdBy INT NOT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (createdBy) REFERENCES [User](id)
);