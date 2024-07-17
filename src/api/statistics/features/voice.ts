import { Request, Response, Router } from 'express';
import { CustomClient } from '../../../Classes/CustomClient';
import { StatisticsVoiceHelper } from '../../helpers/statisticsVoiceHelper';

export const voice = (client: CustomClient) => {
    const voiceRouter: Router = Router({ mergeParams: true });

    voiceRouter.get('/activity', async (req: Request, res: Response) => {
        const { guildId } = req.params;
        const { days } = req.query;
        try {
            const voiceActivity = await StatisticsVoiceHelper.getActivityLastNDays(client, guildId, parseInt(days as string));
            res.status(200).json(voiceActivity);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // voiceRouter.get('/perChannel', async (req: Request, res: Response) => {
    //     const { guildId } = req.params;
    //     const { days } = req.query;
    //     try {
    //         const messagesDailyCount = await StatisticsMessagesHelper.getActivityPerChannelLastNDays(guildId, client, parseInt(days as string));
    //         res.status(200).json(messagesDailyCount);
    //     } catch (error) {
    //         res.status(500).json({ error: 'Internal server error' });
    //     }
    // });
    //
    // voiceRouter.get('/perUser', async (req: Request, res: Response) => {
    //     const { guildId } = req.params;
    //     const { days } = req.query;
    //     try {
    //         const messagesDailyCount = await StatisticsMessagesHelper.getActivityPerUserLastNDays(guildId, client, parseInt(days as string));
    //         res.status(200).json(messagesDailyCount);
    //     } catch (error) {
    //         res.status(500).json({ error: 'Internal server error' });
    //     }
    // });
    //
    // voiceRouter.get('/heatmap', async (req: Request, res: Response) => {
    //     const { guildId } = req.params;
    //     const { days } = req.query;
    //     try {
    //         const messagesDailyCount = await StatisticsMessagesHelper.getActivityHeatmap(guildId, client, parseInt(days as string));
    //         res.status(200).json(messagesDailyCount);
    //     } catch (error) {
    //         res.status(500).json({ error: 'Internal server error' });
    //     }
    // });

    return voiceRouter;
};
