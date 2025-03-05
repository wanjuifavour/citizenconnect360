import express from 'express'
import {
    createPoll,
    getPollById,
    getPolls,
    updatePoll,
    deletePoll,
    voteOnPoll,
    getUserVotes,
    getPollStatistics,
    getRecentPolls
} from '../controllers/pollController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = express.Router()

router.post('/create', /*authMiddleware as express.RequestHandler,*/ createPoll as express.RequestHandler)
router.get('/getAll', /*authMiddleware as express.RequestHandler,*/ getPolls as express.RequestHandler)
router.get('/getOne/:id', /*authMiddleware as express.RequestHandler,*/ getPollById as express.RequestHandler)
router.get('/recent', /*authMiddleware as express.RequestHandler,*/ getRecentPolls as express.RequestHandler)
router.put('/update/:id', /*authMiddleware as express.RequestHandler,*/ updatePoll as express.RequestHandler)
router.delete('/delete/:id', /*authMiddleware as express.RequestHandler,*/ deletePoll as express.RequestHandler)
router.post('/vote/:pollId', /*authMiddleware as express.RequestHandler,*/ voteOnPoll as express.RequestHandler)
router.get('/userVote/:pollId/:userId', /*authMiddleware as express.RequestHandler,*/ getUserVotes as express.RequestHandler)
router.get('/statistics/:pollId', /*authMiddleware as express.RequestHandler,*/ getPollStatistics as express.RequestHandler)

export default router