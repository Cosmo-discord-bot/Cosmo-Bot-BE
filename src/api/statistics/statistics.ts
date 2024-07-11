import { Router } from 'express';
import { CustomClient } from '../../Classes/CustomClient';
import { validateStatistics } from '../validators/validators/statisticsValidator';
import { statisticsSchema } from '../validators/schemas/statisticsSchema';
import { channels } from './features/channels';

export const statistics = (client: CustomClient) => {
    const statisticsRouter: Router = Router({ mergeParams: true });

    statisticsRouter.use(validateStatistics(statisticsSchema));
    statisticsRouter.use('/channels', channels(client));

    return statisticsRouter;
};
