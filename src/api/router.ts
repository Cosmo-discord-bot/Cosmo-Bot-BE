import { logger } from '../logger/pino';
import { Router, Request, Response } from 'express';
import { auth } from './auth/auth';

export const router: Router = Router();

// Health Check
router.get('/', (req: Request, res: Response): void => {
    logger.info('Hello, i am alive!');
    res.send('Hello, i am alive!');
});

router.use('/auth', auth);
