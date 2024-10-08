import http from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import { rtr } from '../api/router';
import { CustomClient } from '../definitions/Classes/CustomClient';
import { logger } from '../logger/pino';

export const expressEvents = (client: CustomClient) => {
    /*
    Express api server initialization
    */

    const app = express();
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'PUT', 'POST', 'DELETE'],
        },
    });
    const port: string | 3000 = process.env.EXPRESS_PORT || 3000;

    app.use(
        cors({
            origin: process.env.CORS_ORIGIN || '*',
            methods: 'GET,PUT,POST,DELETE',
        })
    );
    app.use(express.json());
    app.use('/api/v1', rtr(client));

    server.listen(port, () => {
        logger.info(`API is running at http://localhost:${port}`);
    });

    return io;
};
