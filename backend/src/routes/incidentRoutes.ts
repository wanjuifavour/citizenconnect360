import express from 'express'
import { createIncident, getIncidentById, getIncidents } from '../controllers/incidentController'
import { authMiddleware } from '../middlewares/authMiddleware'
import { upload } from '../middlewares/uploadMiddleware'

const router = express.Router()

router.post('/report', /*authMiddleware as express.RequestHandler,*/ upload.single('media'), createIncident as express.RequestHandler)
router.get('/getAll', /*authMiddleware as express.RequestHandler,*/ getIncidents as express.RequestHandler)
router.get('/getOne/:id', /*authMiddleware as express.RequestHandler,*/ getIncidentById as express.RequestHandler)

export default router