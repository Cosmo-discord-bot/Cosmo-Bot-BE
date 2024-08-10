import { logger } from '../../logger/pino';
import { Request, Response, Router } from 'express';
import { IConfig } from '../../definitions/interfaces/common/IConfig';
import { CustomClient } from '../../definitions/Classes/CustomClient';
import { validateConfig } from '../validators/validators/configurationValidator';
import { configurationSchema } from '../validators/schemas/configurationSchema';
import { ChannelType, Role } from 'discord.js';

interface Channels {
    name: string;
    channelId: string;
    type: ChannelType;
}

interface IConfigRequest extends IConfig {
    allChannels: Channels[];
    textChannels: Channels[];
    groupChannels: Channels[];
    guildRoles: Role[];
    djRoles: string[];
    RBACRoles: string[];
}

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
            const config: IConfig | undefined = client.config.configs.get(guildId);
            const allChannels: Channels[] | undefined = client.guilds.cache.get(guildId)?.channels.cache.map((channel) => {
                return { name: channel.name, channelId: channel.id, type: channel.type };
            });
            const textChannels: Channels[] | undefined = allChannels
                ?.filter((channel) => channel.type === ChannelType.GuildText)
                .sort((a, b) => a.name.localeCompare(b.name));

            const groupChannels: Channels[] | undefined = allChannels
                ?.filter((channel) => channel.type === ChannelType.GuildCategory)
                .sort((a, b) => a.name.localeCompare(b.name));

            const guildRoles: Role[] | undefined = guild.roles.cache.map((role) => role);

            if (!config || !allChannels || !textChannels || !groupChannels || !guildRoles) {
                logger.error('Settings not found:', guildId);
                return res.status(404).json({ error: 'Settings not found' });
            }
            const settings: IConfigRequest = {
                guildId: config.guildId,
                prefix: config.prefix,
                color: config.color,
                mainChannelId: config.mainChannelId,
                rolesChannelId: config.rolesChannelId,
                eventsGroupId: config.eventsGroupId,
                djRoles: config.djRoles,
                RBACRoles: config.RBACRoles,
                allChannels,
                textChannels,
                groupChannels,
                guildRoles,
            };
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
                djRoles: config.djRoles,
                RBACRoles: config.RBACRoles,
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
