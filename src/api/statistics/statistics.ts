import { Router } from 'express';
import { CustomClient } from '../../Classes/CustomClient';
import { validateStatistics } from '../validators/validators/statisticsValidator';
import { statisticsSchema } from '../validators/schemas/statisticsSchema';
import { messages } from './features/messages';
import { voice } from './features/voice';

export const statistics = (client: CustomClient) => {
    const statisticsRouter: Router = Router({ mergeParams: true });

    statisticsRouter.use(validateStatistics(statisticsSchema));
    statisticsRouter.use('/messages', messages(client));
    statisticsRouter.use('/voice', voice(client));

    return statisticsRouter;
};
