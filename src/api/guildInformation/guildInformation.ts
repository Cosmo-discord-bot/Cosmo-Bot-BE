import { logger } from '../../logger/pino';
import { Request, Response, Router } from 'express';
import { CustomClient } from '../../definitions/Classes/CustomClient';

export const guildInformation = (client: CustomClient) => {
    const guildInformationRouter: Router = Router();

    guildInformationRouter.post('/:guildId', async (req: Request, res: Response) => {
        // Check if the user is authenticated
        if (!req.user) {
            logger.error('User not authenticated');
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { guildId } = req.params;
        const userId = req.user.user.id;
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            logger.error('Guild not found:', guildId);
            return res.status(404).json({ error: 'Guild not found' });
        }

        try {
            const config = client.config.configs.get(guildId);
            if (!config) {
                logger.error('Configuration is not set for guild', guildId);
                return res.status(400).json({ error: 'Configuration is not set for guild' });
            }

            if (!config.RBACRoles || config.RBACRoles.length === 0) {
                logger.info('RBAC roles not configured for guild, configuring the first time: ', guildId);
                return res.status(200).json({ hasPermission: true });
            }

            const member = await guild.members.fetch(userId);
            if (!member) {
                logger.error('User is not a member of the guild:', guildId);
                return res.status(403).json({ error: 'User is not a member of this guild' });
            }

            // Check if the user has any of the RBAC roles
            const hasRBACRole = member.roles.cache.some((role) => config.RBACRoles.includes(role.id));

            if (hasRBACRole) {
                res.json({ hasPermission: true });
            } else {
                res.status(403).json({ hasPermission: false, error: 'User does not have the required roles' });
            }
        } catch (error) {
            logger.error('Error checking RBAC roles:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return guildInformationRouter;
};
