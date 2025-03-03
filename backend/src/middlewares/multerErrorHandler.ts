import express from 'express'
import { upload } from './uploadMiddleware'


export const handleMulterErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    upload.array('media', 5)(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({
                    message: 'File too large',
                    error: 'One or more files exceed the 10MB size limit'
                });
            }
            if (err.message === 'Unexpected field') {
                return res.status(400).json({
                    message: 'Invalid upload',
                    error: 'Too many files or invalid field name'
                });
            }
            // Handle other multer errors
            return res.status(400).json({
                message: 'Upload error',
                error: err.message
            });
        }
        next();
    });
};