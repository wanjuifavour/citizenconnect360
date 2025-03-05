-- Create Incident
CREATE PROCEDURE CreateIncident
    @title NVARCHAR(255),
    @description NVARCHAR(MAX),
    @category NVARCHAR(50),
    @reportedBy INT
AS
BEGIN
    INSERT INTO Incident (title, description, category, reportedBy)
    VALUES (@title, @description, @category, @reportedBy);
    SELECT SCOPE_IDENTITY() AS id; -- Return the newly created incident ID
END;
GO

-- Get Incident by ID
CREATE PROCEDURE GetIncidentById
    @id INT
AS
BEGIN
    SELECT * FROM Incident WHERE id = @id;
END;
GO

-- Get media by Incident ID
CREATE PROCEDURE GetMediaByIncidentId
    @incidentId INT
AS
BEGIN
    SELECT * FROM Media WHERE incidentId = @incidentId;
END;
GO

-- Get Incidents
CREATE PROCEDURE GetIncidents
AS
BEGIN
    SELECT i.* 
    FROM Incident i
    ORDER BY i.createdAt DESC
END
GO

-- Update Incident
CREATE PROCEDURE UpdateIncident
    @id INT,
    @title NVARCHAR(255),
    @description NVARCHAR(MAX),
    @category NVARCHAR(50),
    @status NVARCHAR(50)
AS
BEGIN
    UPDATE Incident
    SET title = @title, description = @description, category = @category, status = @status, updatedAt = GETDATE()
    WHERE id = @id;
END;
GO

-- Verify Incident
CREATE PROCEDURE VerifyIncident
    @id INT
AS
BEGIN
    UPDATE Incident
    SET status = 'Verified', 
        updatedAt = GETDATE()
    WHERE id = @id;
END;
GO

-- Delete Incident
CREATE PROCEDURE DeleteIncident
    @id INT
AS
BEGIN
    DELETE FROM Media WHERE incidentId = @id;
    DELETE FROM Incident WHERE id = @id;
END;
GO

-- Add media to Incident
CREATE PROCEDURE AddMediaToIncident
    @type NVARCHAR(50),
    @url NVARCHAR(MAX),
    @incidentId INT
AS
BEGIN
    INSERT INTO Media (type, url, incidentId)
    VALUES (@type, @url, @incidentId);
END;
GO

-- Create a new stored procedure for getting incidents with media
CREATE OR ALTER PROCEDURE GetIncidentsWithMedia
AS
BEGIN
    SELECT 
        i.id, 
        i.title, 
        i.description, 
        i.category, 
        i.status, 
        i.reportedBy, 
        i.createdAt, 
        i.updatedAt,
        m.id as media_id,
        m.type as media_type,
        m.url as media_url
    FROM 
        Incident i
    LEFT JOIN 
        Media m ON i.id = m.incidentId
    ORDER BY 
        i.createdAt DESC
END
GO

-- Get Recent Incidents
CREATE OR ALTER PROCEDURE GetRecentIncidents
    @limit INT = 5
AS
BEGIN
    SELECT TOP (@limit)
        i.id, 
        i.title, 
        i.description, 
        i.category, 
        i.status, 
        i.reportedBy, 
        i.createdAt, 
        i.updatedAt
    FROM 
        Incident i
    ORDER BY 
        i.createdAt DESC;
END;
GO