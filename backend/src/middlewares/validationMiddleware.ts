import { Request, Response, NextFunction } from 'express'
import Joi, { Schema } from 'joi'

export const registerSchema = Joi.object({
    username: Joi.string().required().min(3).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6)
})

export const loginSchema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required()
})

export const validateRequest = (schema: Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.details.map(detail => detail.message)
            });
        }
        next();
    };
};