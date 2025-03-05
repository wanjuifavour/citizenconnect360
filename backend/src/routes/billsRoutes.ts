import express from 'express';
import { getBillContent, getBillsList } from '../controllers/billsController';

const router = express.Router();

router.get('/getAll', getBillsList as any);
router.get('/:billName', getBillContent as any);

export default router;