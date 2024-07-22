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
    });

    return clientInformation;
};
