import { logger } from '../../../logger/pino';
import { Request, Response, Router } from 'express';
import { CustomClient } from '../../../Classes/CustomClient';
import { Channel } from 'discord.js';

export const channels = (client: CustomClient) => {
    const channelsRouter: Router = Router();

    channelsRouter.get('/:guildId', (req: Request, res: Response) => {
        const { guildId } = req.params;

        // Check if the guild exists
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            logger.error('Guild not found:', guildId);
            return res.status(404).json({ error: 'Guild not found' });
        }

        try {
            const channels: Channel | undefined = client.channels.cache.get(guildId);
            if (!channels) {
                logger.error('Channels not found:', guildId);
                return res.status(404).json({ error: 'Channels not found' });
            }
            res.json(channels);
        } catch (error) {
            logger.error('Error fetching guild channels:', error);
        }
    });
};
