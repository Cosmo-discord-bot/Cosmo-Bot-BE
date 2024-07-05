import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';

export const validateConfig = (schema: z.ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await schema.parseAsync({
            ...req.body,
            guildId: req.params.guildId, // Include guildId from params
        });
        return next();
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};
