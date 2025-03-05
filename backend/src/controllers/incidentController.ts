import { Request, Response } from 'express';
import { executeStoredProcedure } from '../config/sqlServer';
import { AuthRequest } from '../middlewares/authMiddleware';

interface CreateIncidentRequest extends AuthRequest {
    files?: Express.Multer.File[];
    body: {
        title: string;
        description: string;
        category: string;
    };
}

export const createIncident = async (req: CreateIncidentRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        
        const { title, description, category } = req.body;

        // Create the incident first
        const incidentResult = await executeStoredProcedure('CreateIncident', {
            title,
            description,
            category,
            reportedBy: userId,
        });

        const incident = incidentResult.recordset[0];

        // Process all uploaded files if they exist
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            for (const file of req.files) {
                const mediaType = file.mimetype.startsWith('image/') ? 'PHOTO' : 'VIDEO';
                const mediaUrl = `/uploads/${file.filename}`;

                await executeStoredProcedure('AddMediaToIncident', {
                    type: mediaType,
                    url: mediaUrl,
                    incidentId: incident.id
                });
            }
            
            // Get all media for this incident to return in response
            const mediaResult = await executeStoredProcedure('GetMediaByIncidentId', {
                incidentId: incident.id
            });
            
            incident.media = mediaResult.recordset;
        } else {
            incident.media = [];
        }

        res.status(201).json(incident);
    } catch (error) {
        console.error('Create incident error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getIncidents = async (req: Request, res: Response) => {
    try {
        // Get all incidents
        const incidentsResult = await executeStoredProcedure('GetIncidents');
        const incidents = incidentsResult.recordset;
        
        // For each incident, get its media
        const incidentsWithMedia = [];
        
        for (const incident of incidents) {
            const mediaResult = await executeStoredProcedure('GetMediaByIncidentId', {
                incidentId: incident.id
            });
            
            incidentsWithMedia.push({
                ...incident,
                media: mediaResult.recordset
            });
        }
        
        res.json(incidentsWithMedia);
    } catch (error) {
        console.error('Get incidents error:', error);
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

export const verifyIncident = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        await executeStoredProcedure('VerifyIncident', { id });
        
        res.json({ message: 'Incident verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteIncident = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        await executeStoredProcedure('DeleteIncident', { id });
        
        res.json({ message: 'Incident deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateIncident = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, category } = req.body;
        
        await executeStoredProcedure('UpdateIncident', {
            id: parseInt(id, 10),
            title,
            description,
            category,
            status: req.body.status || 'Unverified'
        });
        
        res.json({ message: 'Incident updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getRecentIncidents = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 5;
        
        const result = await executeStoredProcedure('GetRecentIncidents', { limit });
        
        // Create array to hold incidents with media
        const incidentsWithMedia = [];
        
        // For each incident, fetch its media
        for (const incident of result.recordset) {
            const mediaResult = await executeStoredProcedure('GetMediaByIncidentId', {
                incidentId: incident.id
            });
            
            incidentsWithMedia.push({
                ...incident,
                media: mediaResult.recordset
            });
        }
        
        res.json(incidentsWithMedia);
    } catch (error) {
        console.error('Get recent incidents error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};