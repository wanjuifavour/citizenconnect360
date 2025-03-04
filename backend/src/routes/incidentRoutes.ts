import express from 'express'
import { createIncident, getIncidentById, getIncidents, verifyIncident, deleteIncident, updateIncident } from '../controllers/incidentController'
import { authMiddleware } from '../middlewares/authMiddleware'
import { handleMulterErrors } from '../middlewares/multerErrorHandler'

const router = express.Router()

// Use the custom error handler in your route
router.post('/report',
  authMiddleware as express.RequestHandler,
  handleMulterErrors,
  createIncident as express.RequestHandler
);
router.get('/getAll', authMiddleware as express.RequestHandler, getIncidents as express.RequestHandler);
router.get('/getOne/:id', authMiddleware as express.RequestHandler, getIncidentById as express.RequestHandler);
router.put('/verify/:id', verifyIncident as express.RequestHandler);
router.put('/update/:id', updateIncident as express.RequestHandler);
router.delete('/:id', deleteIncident as express.RequestHandler);

export default router