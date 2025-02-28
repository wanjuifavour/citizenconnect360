import { Request, Response } from 'express';
import { executeStoredProcedure } from '../config/sqlServer';

export const createPoll = async (req: Request, res: Response) => {
    try {
        const { title, description, category, options, createdBy } = req.body;

        const result = await executeStoredProcedure('CreatePoll', {
            title,
            description,
            category,
            options: JSON.stringify(options),
            status: 'unverified',
            createdBy,
        });

        const poll = result.recordset[0];
        res.status(201).json(poll);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPolls = async (req: Request, res: Response) => {
    try {
        const result = await executeStoredProcedure('GetPolls');
        const polls = result.recordset;
        res.json(polls);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPollById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await executeStoredProcedure('GetPollById', { id });

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};