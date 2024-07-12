import { Router } from 'express';
import { CustomClient } from '../../Classes/CustomClient';
import { validateStatistics } from '../validators/validators/statisticsValidator';
import { statisticsSchema } from '../validators/schemas/statisticsSchema';
import { messages } from './features/messages';

export const statistics = (client: CustomClient) => {
    const statisticsRouter: Router = Router({ mergeParams: true });

    statisticsRouter.use(validateStatistics(statisticsSchema));
    statisticsRouter.use('/messages', messages(client));

    return statisticsRouter;
};
