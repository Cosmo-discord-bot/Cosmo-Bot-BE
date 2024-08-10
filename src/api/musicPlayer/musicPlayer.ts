import { logger } from '../../logger/pino';
import { Request, Response, Router } from 'express';
import { useQueue } from 'discord-player';

export const musicPlayer = () => {
    const musicRouter: Router = Router({ mergeParams: true });

    musicRouter.get('/queue', (req: Request, res: Response) => {
        const queue = useQueue(req.params.guildId);
        if (!queue) {
            logger.error('Queue not found:', req.params.guildId);
            return res.status(404).json({ error: 'Queue not found' });
        }
        res.json(queue?.tracks);
    });

    musicRouter.get('/nowPlaying', (req: Request, res: Response) => {
        const queue = useQueue(req.params.guildId);
        if (!queue) {
            logger.error('Queue not found:', req.params.guildId);
            return res.status(404).json({ error: 'Queue not found' });
        }

        res.json(queue.currentTrack ?? '');
    });

    return musicRouter;
};
