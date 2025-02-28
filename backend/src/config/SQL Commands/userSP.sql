-- Create User
CREATE PROCEDURE CreateUser
    @name NVARCHAR(255),
    @email NVARCHAR(255),
    @password NVARCHAR(255)
AS
BEGIN
    INSERT INTO [User] (name, email, password)
    VALUES (@name, @email, @password);
    SELECT SCOPE_IDENTITY() AS id;
END;
GO

-- Get User by Email
CREATE or ALTER PROCEDURE GetUserByEmail
    @email NVARCHAR(255)
AS
BEGIN
    SELECT * FROM [User] WHERE email = @email AND isDeleted = 0;
END;
GO

-- Update User
CREATE PROCEDURE UpdateUser
    @id INT,
    @name NVARCHAR(255),
    @email NVARCHAR(255),
    @password NVARCHAR(255),
    @role NVARCHAR(50)
AS
BEGIN
    UPDATE [User]
    SET name = @name, email = @email, password = @password, role = @role, updatedAt = GETDATE()
    WHERE id = @id;
END;
GO

-- Delete User
CREATE PROCEDURE DeleteUser
    @id INT
AS
BEGIN
    UPDATE [User] SET isDeleted = 1 WHERE id = @id;
END;
GO

-- Get all Users
CREATE PROCEDURE GetAllUsers
AS
BEGIN
    SELECT 
        id, 
        name, 
        email, 
        role
    FROM [User]
    WHERE isDeleted = 0;
END;
GO

-- Update User Role
CREATE PROCEDURE UpdateUserRole
    @id INT,
    @role NVARCHAR(50)
AS
BEGIN
    -- Check if the user exists and is not deleted
    IF EXISTS (SELECT 1 FROM [User] WHERE id = @id AND isDeleted = 0)
    BEGIN
        -- Update the user's role
        UPDATE [User]
        SET role = @role, updatedAt = GETDATE()
        WHERE id = @id;
        SELECT 'User role updated successfully' AS message;
    END
    ELSE
    BEGIN
        SELECT 'User not found or deleted' AS message;
    END
END;