import { logger } from '../../logger/pino';
import { Request, Response, Router } from 'express';
import { CustomClient } from '../../definitions/Classes/CustomClient';

export const clientInformation = (client: CustomClient) => {
    const clientInformation: Router = Router();

    clientInformation.get('/guilds', (req: Request, res: Response) => {
        // Check if the user is authenticated
        if (!req.user) {
            logger.error('User not authenticated');
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Get the guilds from the client
        const clientGuilds = client.guilds.cache.map((guild) => {
            return {
                guildId: guild.id,
                name: guild.name,
                picture: guild.iconURL(),
            };
        });

        // Get the guilds from the JWT
        const { guilds: jwtGuilds } = req.user;

        // Find the common guilds
        const commonGuilds = clientGuilds.filter((clientGuild) => jwtGuilds.some((jwtGuild) => jwtGuild.id === clientGuild.guildId));

        // Return the common guilds
        res.json(commonGuilds);
    });

    return clientInformation;
};
