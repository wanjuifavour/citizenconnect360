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
    deadline DATETIME NULL,
    allowMultipleSelections BIT NOT NULL DEFAULT 0,
    createdBy INT NOT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (createdBy) REFERENCES [User](id)
);

-- Poll Votes Table
CREATE TABLE PollVote (
    id INT IDENTITY(1,1) PRIMARY KEY,
    pollId INT NOT NULL,
    userId INT NOT NULL,
    optionIndex INT NOT NULL,
    votedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (pollId) REFERENCES Poll(id),
    FOREIGN KEY (userId) REFERENCES [User](id),
    -- Ensure each user can only vote once per poll
    CONSTRAINT UC_PollVote_Option UNIQUE (pollId, userId, optionIndex)
);
GO

-- View to get vote count for each poll option
CREATE VIEW PollOptionVotes AS
SELECT
    pv.pollId,
    pv.optionIndex,
    COUNT(*) AS voteCount
FROM
    PollVote pv
GROUP BY
    pv.pollId, pv.optionIndex;
GO

-- view to get participants count for each poll
CREATE VIEW PollParticipants AS
SELECT
    pollId,
    COUNT(DISTINCT userId) AS participantCount
FROM
    PollVote
GROUP BY
    pollId;
GO

-- Create BillCache Table
CREATE TABLE BillCache (
    id INT IDENTITY(1,1) PRIMARY KEY,
    billName NVARCHAR(255) NOT NULL,
    query NVARCHAR(MAX) NOT NULL,
    queryShort NVARCHAR(900) NULL,
    response NVARCHAR(MAX) NOT NULL,
    createdAt DATETIME DEFAULT GETDATE()
);
CREATE INDEX idx_billCache_billName_query ON BillCache (billName, queryShort);
CREATE INDEX idx_billCache_createdAt ON BillCache (createdAt);
GO