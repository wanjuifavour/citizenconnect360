-- Create Poll
CREATE PROCEDURE CreatePoll
    @title NVARCHAR(255),
    @description NVARCHAR(MAX),
    @category NVARCHAR(255),
    @options NVARCHAR(MAX),
    @status NVARCHAR(50),
    @createdBy INT
AS
BEGIN
    INSERT INTO Poll (title, description, category, options, status, createdBy)
    VALUES (@title, @description, @category, @options, @status, @createdBy);
    SELECT SCOPE_IDENTITY() AS id; -- Return the newly created poll ID
END;
GO

-- Get Poll by ID
CREATE PROCEDURE GetPollById
    @id INT
AS
BEGIN
    SELECT * FROM Poll WHERE id = @id;
END;
GO

-- Get All Polls
CREATE PROCEDURE GetPolls
AS
BEGIN
    SELECT * FROM Poll;
END;
GO


-- Update Poll
CREATE PROCEDURE UpdatePoll
    @id INT,
    @title NVARCHAR(255),
    @description NVARCHAR(MAX),
    @category NVARCHAR(255),
    @options NVARCHAR(MAX),
    @status NVARCHAR(50)
AS
BEGIN
    UPDATE Poll
    SET title = @title, description = @description, category = @category, options = @options, status = @status, updatedAt = GETDATE()
    WHERE id = @id;
END;
GO

-- Delete Poll
CREATE PROCEDURE DeletePoll
    @id INT
AS
BEGIN
    DELETE FROM Poll WHERE id = @id;
END;
GO