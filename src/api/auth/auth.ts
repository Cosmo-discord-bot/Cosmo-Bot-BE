import { Request, Response, Router } from 'express';
import axios from 'axios';
import querystring from 'querystring';
import { logger } from '../../logger/pino';
import jwt from 'jsonwebtoken';

export const auth = () => {
    const authRouter: Router = Router();
    const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeyfortesting'; // Use a strong, unique secret in production

    // Discord OAuth configuration
    const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
    const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

    authRouter.post('/discord', async (req: Request, res: Response) => {
        const { code } = req.query;
        logger.debug('Discord OAuth code:', code);

        if (!code) {
            return res.status(400).json({ error: 'No code provided' });
        }

        try {
            // Exchange code for token
            const tokenResponse = await axios.post(
                'https://discord.com/api/oauth2/token',
                querystring.stringify({
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    grant_type: 'authorization_code',
                    code: code as string,
                    redirect_uri: REDIRECT_URI,
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            const { access_token, token_type } = tokenResponse.data;

            // Get user information
            const userResponse = await axios.get('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${token_type} ${access_token}`,
                },
            });

            // Get user guilds
            const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
                headers: {
                    authorization: `${token_type} ${access_token}`,
                },
            });

            // Create a payload for JWT
            const payload = {
                user: userResponse.data,
                guilds: guildsResponse.data,
                discordToken: access_token,
            };

            // Create JWT
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

            // Send JWT back to the client
            res.json({ token });
        } catch (error) {
            logger.error('Error during Discord authentication:', error);
            res.status(500).json({ error: 'Authentication failed' });
        }
    });

    return authRouter;
};
