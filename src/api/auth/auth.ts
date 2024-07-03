import { logger } from '../../logger/pino';
import { Router, Request, Response } from 'express';

export const auth: Router = Router();

auth.get('/', (req: Request, res: Response): void => {
    logger.info('Hello, i am alive!');
    res.send('Hello, i am alive!');
});
