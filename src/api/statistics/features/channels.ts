import { Request, Response, Router } from 'express';
import { CustomClient } from '../../../Classes/CustomClient';
import { StatisticsMessagesHelper } from '../../helpers/statisticsMessagesHelper';

export const channels = (client: CustomClient) => {
    const channelsRouter: Router = Router({ mergeParams: true });

    channelsRouter.get('/', async (req: Request, res: Response) => {
        const { guildId } = req.params;
        const { days } = req.query;
        try {
            const messagesDailyCount = await StatisticsMessagesHelper.getActivityLastNDays(guildId, client, parseInt(days as string));
            res.status(200).json(messagesDailyCount);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return channelsRouter;
};
