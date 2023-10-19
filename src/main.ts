import { generateFirstConfig } from './startup/config';

require('dotenv').config();
import { logger } from './logger/pino';
import { Partials, GatewayIntentBits, Events, Guild } from 'discord.js';
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
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.GuildScheduledEvent, Partials.GuildMember],
});

/*
    Once client is ready, get config for all guilds.
    If guild doesn't have config, create a default one.
*/
client.once(Events.ClientReady, (): void => {
    logger.info('Ready!');
    const guildIDs: string[] = client.guilds.cache.map(guild => guild.id);
    logger.info(guildIDs);
    client.__initClient__().then(async () => {
        for (const gID of guildIDs) {
            if (client.config.configs.get(gID) == null) {
                let guild: Guild = client.guilds.cache.get(gID)!;
                await client.config.insertNewConfig(generateFirstConfig(guild));
            }
        }
        await client.config.loadConfig();
        logger.info(client.config.configs.toJSON());
    });
});

client.on(Events.MessageCreate, message => router(message, client.config.configs));
client.on(Events.InteractionCreate, async interaction => HandleSlashCommands(interaction));

client.on(Events.GuildCreate, async guild => {
    const conf: ConfigModel = generateFirstConfig(guild);

    client.config?.insertNewConfig(conf);
    client.config?.loadConfig();
});

client.login(process.env.DISCORD_TOKEN);
