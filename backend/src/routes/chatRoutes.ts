import express from 'express';
import { chatWithBill } from '../controllers/chatController';

const router = express.Router();

router.post('/bill-chat', chatWithBill as any);

export default router;