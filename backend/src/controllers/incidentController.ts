import { Request, Response } from 'express';
import { executeStoredProcedure } from '../config/sqlServer';
import { AuthRequest } from '../middlewares/authMiddleware';

interface CreateIncidentRequest extends AuthRequest {
    file?: Express.Multer.File;
    body: {
        title: string;
        description: string;
        category: string;
        reportedBy: number;
    };
}

export const createIncident = async (req: CreateIncidentRequest, res: Response) => {
    try {
        const { title, description, category, reportedBy } = req.body;

        // Create incident first
        const incidentResult = await executeStoredProcedure('CreateIncident', {
            title,
            description,
            category,
            reportedBy,
        });

        const incident = incidentResult.recordset[0];

        // If media file exists, save it to the database
        if (req.file) {
            const mediaType = req.file.mimetype.startsWith('image/') ? 'PHOTO' : 'VIDEO';
            const mediaUrl = `/uploads/${req.file.filename}`;

            await executeStoredProcedure('AddMediaToIncident', {
                type: mediaType,
                url: mediaUrl,
                incidentId: incident.id
            });
        }

        res.status(201).json(incident);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getIncidents = async (req: Request, res: Response) => {
    try {
        const result = await executeStoredProcedure('GetIncidents');
        const incidents = result.recordset;
        res.json(incidents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getIncidentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; 

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ message: 'Invalid incident ID' });
        }

        const incidentResult = await executeStoredProcedure('GetIncidentById', {
            id: parseInt(id, 10),
        });

        if (incidentResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        const incident = incidentResult.recordset[0];

        const mediaResult = await executeStoredProcedure('GetMediaByIncidentId', {
            incidentId: Number(id),
        });

        const media = mediaResult.recordset;

        res.status(200).json({
            ...incident,
            media,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};