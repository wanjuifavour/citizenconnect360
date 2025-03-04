import { Request, Response } from 'express';
import { executeStoredProcedure } from '../config/sqlServer';

export const createPoll = async (req: Request, res: Response) => {
    try {
        const { title, description, category, options, createdBy, deadline, allowMultipleSelections } = req.body;

        const result = await executeStoredProcedure('CreatePoll', {
            title,
            description,
            category,
            options: JSON.stringify(options),
            status: 'unverified',
            createdBy,
            deadline: deadline || null,
            allowMultipleSelections: allowMultipleSelections || false
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
        
        // Parse the options JSON from each poll record
        const polls = result.recordset.map(poll => ({
            ...poll,
            options: JSON.parse(poll.options)
        }));
        
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

        const poll = result.recordset[0];
        
        // Parse the options and vote counts JSON
        poll.options = JSON.parse(poll.options);
        poll.voteCounts = poll.voteCounts ? JSON.parse(poll.voteCounts) : [];
        
        res.json(poll);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updatePoll = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, category, options, status, deadline } = req.body;

        await executeStoredProcedure('UpdatePoll', {
            id,
            title,
            description,
            category,
            options: JSON.stringify(options),
            status,
            deadline: deadline || null
        });

        res.json({ message: 'Poll updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const voteOnPoll = async (req: Request, res: Response) => {
    try {
        const { pollId } = req.params;
        const { userId, optionIndex } = req.body;

        if (userId === undefined || optionIndex === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const result = await executeStoredProcedure('VoteOnPoll', {
            pollId,
            userId,
            optionIndex
        });

        res.json({ message: result.recordset[0].message });
    } catch (error: any) {
        console.error(error);
        
        // Check for specific error messages from the stored procedure
        if (error.message && (
            error.message.includes('Poll not found') || 
            error.message.includes('Poll is not open for voting')
        )) {
            return res.status(400).json({ message: error.message });
        }
        
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUserVotes = async (req: Request, res: Response) => {
    try {
        const { pollId, userId } = req.params;

        const result = await executeStoredProcedure('GetUserVotes', {
            pollId,
            userId
        });

        if (result.recordset.length === 0) {
            return res.json({ hasVoted: false, selectedOptions: [] });
        }

        res.json({
            hasVoted: true,
            selectedOptions: result.recordset.map(record => record.optionIndex)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPollStatistics = async (req: Request, res: Response) => {
    try {
        const { pollId } = req.params;

        const result = await executeStoredProcedure('GetPollStatistics', { pollId });
        
        if (!Array.isArray(result.recordsets) || result.recordsets.length < 2) {
            return res.status(500).json({ message: 'Failed to get poll statistics' });
        }

        const totalParticipants = result.recordsets[0][0].totalParticipants;
        const optionVotes = result.recordsets[1];

        res.json({
            totalParticipants,
            optionVotes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deletePoll = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await executeStoredProcedure('DeletePoll', { id });

        res.json({ message: 'Poll deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};