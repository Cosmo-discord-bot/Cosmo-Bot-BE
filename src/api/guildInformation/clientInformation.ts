import { logger } from '../../logger/pino';
import { Request, Response, Router } from 'express';
import { CustomClient } from '../../Classes/CustomClient';

export const clientInformation = (client: CustomClient) => {
    const clientInformation: Router = Router();

    clientInformation.get('/guilds', (req: Request, res: Response) => {
        const { guildId } = req.params;

        // Check if the guild exists
        const guild = client.guilds.cache.map((guild) => {
            return {
                guildId: guild.id,
                name: guild.name,
                picture: guild.iconURL(),
            };
        });
        if (!guild) {
            logger.error('Guild not found:', guildId);
            return res.status(404).json({ error: 'Guild not found' });
        }
        res.json(guild);
        // try {
        //     // Assuming you have a method to get configuration for a guild
        //     const settings: IConfig | undefined = client.config.configs.get(guildId);
        //     if (!settings) {
        //         logger.error('Settings not found:', guildId);
        //         return res.status(404).json({ error: 'Settings not found' });
        //     }
        //     res.json(settings);
        // } catch (error) {
        //     logger.error('Error fetching guild configuration:', error);
        // }
    });

    return clientInformation;
};
