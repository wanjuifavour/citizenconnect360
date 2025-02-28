import express from 'express';
import { register, login, getAllUsers, deleteUser,updateUserRole } from '../controllers/userController';

const router = express.Router();

router.post('/register', register as express.RequestHandler);
router.post('/login', login as express.RequestHandler);
router.get('/getAll', getAllUsers as express.RequestHandler)
router.delete('/delete', deleteUser as express.RequestHandler)
router.put('/:id/role', updateUserRole as express.RequestHandler)


export default router;