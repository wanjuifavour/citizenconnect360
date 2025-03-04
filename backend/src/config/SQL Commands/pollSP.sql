-- Create Poll
CREATE PROCEDURE CreatePoll
    @title NVARCHAR(255),
    @description NVARCHAR(MAX),
    @category NVARCHAR(255),
    @options NVARCHAR(MAX),
    @status NVARCHAR(50),
    @createdBy INT,
    @deadline DATETIME = NULL,
    @allowMultipleSelections BIT = 0
AS
BEGIN
    INSERT INTO Poll (title, description, category, options, status, createdBy, deadline, allowMultipleSelections)
    VALUES (@title, @description, @category, @options, @status, @createdBy, @deadline, @allowMultipleSelections);
    SELECT SCOPE_IDENTITY() AS id;
END;
GO

-- Get Poll by ID
CREATE PROCEDURE GetPollById
    @id INT
AS
BEGIN
    -- Update status if deadline has passed
    UPDATE Poll
    SET status = 'closed'
    WHERE id = @id AND status = 'open' AND deadline IS NOT NULL AND deadline < GETDATE();
    
    -- Get poll with vote counts and participant count
    SELECT 
        p.*, 
        ISNULL(pp.participantCount, 0) AS participantCount,
        (
            SELECT 
                optionIndex, voteCount
            FROM 
                PollOptionVotes
            WHERE 
                pollId = p.id
            FOR JSON PATH
        ) AS voteCounts
    FROM 
        Poll p
    LEFT JOIN 
        PollParticipants pp ON p.id = pp.pollId
    WHERE 
        p.id = @id;
END;
GO

-- Get All Polls
CREATE PROCEDURE GetPolls
AS
BEGIN
    -- Update status for all polls with passed deadlines
    UPDATE Poll
    SET status = 'closed'
    WHERE status = 'open' AND deadline IS NOT NULL AND deadline < GETDATE();
    
    -- Get all polls with participant counts
    SELECT 
        p.*, 
        ISNULL(pp.participantCount, 0) AS participantCount
    FROM 
        Poll p
    LEFT JOIN 
        PollParticipants pp ON p.id = pp.pollId;
END;
GO


-- Update Poll
CREATE PROCEDURE UpdatePoll
    @id INT,
    @title NVARCHAR(255),
    @description NVARCHAR(MAX),
    @category NVARCHAR(255),
    @options NVARCHAR(MAX),
    @status NVARCHAR(50),
    @deadline DATETIME = NULL,
    @allowMultipleSelections BIT = NULL
AS
BEGIN
    UPDATE Poll
    SET title = @title, 
        description = @description, 
        category = @category, 
        options = @options, 
        status = @status, 
        deadline = @deadline,
        allowMultipleSelections = ISNULL(@allowMultipleSelections, allowMultipleSelections),
        updatedAt = GETDATE()
    WHERE id = @id;
END;
GO

-- Vote on Poll
CREATE PROCEDURE VoteOnPoll
    @pollId INT,
    @userId INT,
    @optionIndex INT
AS
BEGIN
    -- Check if poll exists and is open
    DECLARE @pollStatus NVARCHAR(50);
    DECLARE @allowMultiple BIT;
    
    SELECT 
        @pollStatus = status,
        @allowMultiple = allowMultipleSelections 
    FROM Poll 
    WHERE id = @pollId;
    
    IF @pollStatus IS NULL
    BEGIN
        RAISERROR('Poll not found', 16, 1);
        RETURN;
    END;
    
    -- Update poll status if deadline has passed
    UPDATE Poll
    SET status = 'closed'
    WHERE id = @pollId AND status = 'open' AND deadline IS NOT NULL AND deadline < GETDATE();
    
    -- Get updated status
    SELECT @pollStatus = status FROM Poll WHERE id = @pollId;
    
    IF @pollStatus <> 'open'
    BEGIN
        RAISERROR('Poll is not open for voting', 16, 1);
        RETURN;
    END;
    
    -- Check if multiple selections are allowed
    IF @allowMultiple = 0
    BEGIN
        -- If multiple selections aren't allowed, remove any existing votes first
        DELETE FROM PollVote 
        WHERE pollId = @pollId AND userId = @userId;
    END
    
    -- Try to insert the vote
    BEGIN TRY
        INSERT INTO PollVote (pollId, userId, optionIndex)
        VALUES (@pollId, @userId, @optionIndex);
        
        -- Return success
        SELECT 'Vote recorded successfully' AS message;
    END TRY
    BEGIN CATCH
        -- Check if error is due to unique constraint violation (same option)
        IF ERROR_NUMBER() = 2627 OR ERROR_NUMBER() = 2601
        BEGIN
            -- Remove the vote instead (toggle behavior)
            DELETE FROM PollVote
            WHERE pollId = @pollId AND userId = @userId AND optionIndex = @optionIndex;
            
            SELECT 'Vote removed successfully' AS message;
        END
        ELSE
        BEGIN
            -- Re-throw the error
            DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
            RAISERROR(@ErrorMessage, 16, 1);
        END
    END CATCH;
END;
GO

-- Get User's Vote on Poll
CREATE PROCEDURE GetUserVotes
    @pollId INT,
    @userId INT
AS
BEGIN
    SELECT optionIndex
    FROM PollVote
    WHERE pollId = @pollId AND userId = @userId
    ORDER BY optionIndex;
END;
GO

-- Get Poll Stats
CREATE PROCEDURE GetPollStatistics
    @pollId INT
AS
BEGIN
    -- Get total participants
    SELECT 
        COUNT(DISTINCT userId) AS totalParticipants
    FROM 
        PollVote
    WHERE 
        pollId = @pollId;
    
    -- Get vote counts per option
    SELECT 
        optionIndex,
        COUNT(*) AS voteCount
    FROM 
        PollVote
    WHERE 
        pollId = @pollId
    GROUP BY 
        optionIndex
    ORDER BY 
        optionIndex;
END;
GO