-- Add Media to Incident
CREATE PROCEDURE AddMediaToIncident
    @type NVARCHAR(50),
    @url NVARCHAR(MAX),
    @incidentId INT
AS
BEGIN
    INSERT INTO Media (type, url, incidentId)
    VALUES (@type, @url, @incidentId);
    SELECT SCOPE_IDENTITY() AS id; -- Return the newly created media ID
END;
GO

-- Get Media by Incident ID
CREATE PROCEDURE GetMediaByIncidentId
    @incidentId INT
AS
BEGIN
    SELECT * FROM Media WHERE incidentId = @incidentId;
END;
GO

-- Delete Media
CREATE PROCEDURE DeleteMedia
    @id INT
AS
BEGIN
    DELETE FROM Media WHERE id = @id;
END;
GO