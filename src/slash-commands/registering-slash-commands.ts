import { REST, Routes } from 'discord.js';
import { logger } from '../logger/pino';
import { ping_slash } from './index';

require('dotenv').config();

const commands = [JSON.stringify(ping_slash.data)];

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

(async () => {
    try {
        logger.info(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationGuildCommands(
                process.env.DISCORD_APPLICATION_ID!,
                process.env.DISCORD_DEV_SERVER_ID!
            ),
            { body: commands }
        );

        // @ts-ignore
        logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        logger.error(error);
    }
})();
