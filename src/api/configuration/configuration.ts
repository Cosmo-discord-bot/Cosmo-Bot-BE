import { logger } from '../../logger/pino';
import { Request, Response, Router } from 'express';
import { IConfig } from '../../interfaces/common/IConfig';
import { CustomClient } from '../../Classes/CustomClient';
import { validateConfig } from '../validators/validators/configurationValidator';
import { configurationSchema } from '../validators/schemas/configurationSchema';

export const configuration = (client: CustomClient) => {
    const configurationRouter: Router = Router();

    configurationRouter.get('/:guildId', (req: Request, res: Response) => {
        const { guildId } = req.params;

        // Check if the guild exists
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            logger.error('Guild not found:', guildId);
            return res.status(404).json({ error: 'Guild not found' });
        }

        try {
            // Assuming you have a method to get configuration for a guild
            const settings: IConfig | undefined = client.config.configs.get(guildId);
            if (!settings) {
                logger.error('Settings not found:', guildId);
                return res.status(404).json({ error: 'Settings not found' });
            }
            res.json(settings);
        } catch (error) {
            logger.error('Error fetching guild configuration:', error);
        }
    });

    configurationRouter.post('/:guildId', validateConfig(configurationSchema), (req: Request, res: Response) => {
        const { guildId } = req.params;
        const config: IConfig = req.body;

        // Check if the guild exists
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            logger.error('Guild not found:', guildId);
            return res.status(404).json({ error: 'Guild not found' });
        }

        try {
            logger.debug('Updating configuration for guild:', config);
            const cfg: IConfig = {
                guildId: guildId,
                prefix: config.prefix ?? '!',
                color: config.color ?? '#000000',
                mainChannelId: config.mainChannelId,
                rolesChannelId: config.rolesChannelId,
                eventsGroupId: config.eventsGroupId,
            };
            console.log(cfg);
            client.config.updateConfig(cfg).then(() => client.config.loadConfig());
            res.json({ message: 'Configuration updated successfully' });
        } catch (error) {
            logger.error('Error updating guild configuration:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return configurationRouter;
};
