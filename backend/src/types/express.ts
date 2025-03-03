// backend/src/types/express.ts
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string | number;
    [key: string]: any;
  };
}