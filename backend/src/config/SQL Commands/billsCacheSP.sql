-- Get Cached Response
CREATE PROCEDURE GetCachedResponse
    @billName NVARCHAR(255),
    @query NVARCHAR(MAX)
AS
BEGIN
    SELECT response 
    FROM BillCache 
    WHERE billName = @billName 
      AND query = @query
      AND createdAt > DATEADD(DAY, -7, GETDATE())
    ORDER BY createdAt DESC;
END;
GO

-- Save Response to Cache
CREATE PROCEDURE SaveResponseToCache
    @billName NVARCHAR(255),
    @query NVARCHAR(MAX),
    @response NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO BillCache (billName, query, response)
    VALUES (@billName, @query, @response);
END;
GO

-- Clean Old Cache (run periodically)
CREATE PROCEDURE CleanOldCache
    @daysToKeep INT = 7
AS
BEGIN
    DELETE FROM BillCache 
    WHERE createdAt < DATEADD(DAY, -@daysToKeep, GETDATE());
END;
GO