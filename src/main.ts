import { Config } from './startup/Config/Config';

require('dotenv').config();
import { logger } from './logger/pino';
import { Partials, GatewayIntentBits, Events, GuildBasedChannel } from 'discord.js';
import { router } from './router';
import { HandleSlashCommands } from './slash-commands/set-slash-commands';
import { CustomClient } from './Classes/CustomClient';
import { ConfigModel } from './interfaces/ConfigModel';

const client: CustomClient = new CustomClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [Partials.GuildScheduledEvent, Partials.GuildMember],
});

client.once(Events.ShardReady, async () => {
    logger.info('Ready!');
    await client.__initClient__().then(() => {
        logger.info(client.config?.configs.get('123'));
    });
});
client.on(Events.MessageCreate, message => router(message));
client.on(Events.InteractionCreate, async interaction => HandleSlashCommands(interaction));

client.login(process.env.DISCORD_TOKEN);
