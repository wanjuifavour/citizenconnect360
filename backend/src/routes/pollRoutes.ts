import express from 'express'
import { createPoll, getPollById, getPolls } from '../controllers/pollController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = express.Router()

router.post('/create', /*authMiddleware as express.RequestHandler,*/ createPoll as express.RequestHandler)
router.get('/getAll', /*authMiddleware as express.RequestHandler,*/ getPolls as express.RequestHandler)
router.get('/getOne/:id', /*authMiddleware as express.RequestHandler,*/ getPollById as express.RequestHandler)

export default router