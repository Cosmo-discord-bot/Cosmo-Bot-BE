import { Request, Response, Router } from 'express';
import { logger } from '../logger/pino';
import { CustomClient } from '../definitions/Classes/CustomClient';
import { configuration } from './configuration/configuration';
import { statistics } from './statistics/statistics';
import { clientInformation } from './clientInformation/clientInformation';
import { auth } from './auth/auth';
import { musicPlayer } from './musicPlayer/musicPlayer';
import { authenticateJWT } from './middleware/authMiddleware';
import { guildInformation } from './guildInformation/guildInformation';

export const rtr = (client: CustomClient) => {
    const router: Router = Router();

    router.get('/health', (req: Request, res: Response): void => {
        const healthCheck = {
            uptime: process.uptime(),
            message: 'OK',
            timestamp: Date.now(),
            discordStatus: client.ws.status === 0 ? 'Connected' : 'Disconnected',
            ping: client.ws.ping,
            guildCount: client.guilds.cache.size,
        };

        try {
            res.status(200).json(healthCheck);
            logger.debug('Health check passed:', healthCheck);
        } catch (error) {
            console.error('Health check failed:', error);

            const errorResponse = {
                uptime: process.uptime(),
                message: 'Error in health check',
                timestamp: Date.now(),
                error: error instanceof Error ? error.message : String(error),
            };

            res.status(503).json(errorResponse);
        }
    });

    router.use('/authenticate', auth());
    router.use(authenticateJWT);
    router.use('/musicPlayer/:guildId', musicPlayer());
    router.use('/configuration', configuration(client));
    router.use('/statistics/:guildId', statistics(client));
    router.use('/guildInfo', guildInformation(client));
    router.use('/clientInfo', clientInformation(client));
    return router;
};
