import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { executeStoredProcedure } from '../config/sqlServer';

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await executeStoredProcedure('GetUserByEmail', { email });
        if (existingUser.recordset.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await executeStoredProcedure('CreateUser', {
            name,
            email,
            password: hashedPassword,
        });

        const user = result.recordset[0];

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

        res.status(201).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt:", { email });

        const result = await executeStoredProcedure('GetUserByEmail', { email });
        console.log("GetUserByEmail result:", result);
        
        const user = result.recordset[0];
        if (!user) {
            console.log("No user found with email:", email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log("Found user:", { id: user.id, email: user.email });
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match result:", isMatch);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await executeStoredProcedure('GetAllUsers', {});

        // Extract the list of users from the result
        const users = result.recordset;

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Soft delete the user
        await executeStoredProcedure('DeleteUser', { id });

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const validRoles = ['admin', 'citizen', 'leader'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const result = await executeStoredProcedure('UpdateUserRole', {
            id: parseInt(id, 10),
            role,
        });

        const message = result.recordset[0]?.message;

        if (message === 'User role updated successfully') {
            res.status(200).json({ message });
        } else {
            res.status(404).json({ message: 'User not found or deleted' });
        }
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ message: 'Server error' });
    }
};