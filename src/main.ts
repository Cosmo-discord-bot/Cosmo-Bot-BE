import { generateFirstConfig } from './startup/init';
import { logger } from './logger/pino';
import {
    Events,
    GatewayIntentBits,
    Guild,
    GuildScheduledEvent,
    PartialGuildScheduledEvent,
    Partials,
} from 'discord.js';
import { router } from './router';
import { HandleSlashCommands } from './slash-commands/set-slash-commands';
import { CustomClient } from './Classes/CustomClient';
import { IConfig } from './interfaces/IConfig';
import { EventHandler } from './commands/EventHandler';
import { IEventHandler } from './interfaces/IEventHandler';

require('dotenv').config();

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

const eventHandlers: IEventHandler = {};

/*
    Once client is ready, get config for all guilds.
    If guild doesn't have config, create a default one.
*/
client.once(Events.ClientReady, (): void => {
    logger.info('Client is ready!');
    const guildIDs: string[] = client.guilds.cache.map(guild => guild.id);
    logger.info(guildIDs);
    client.__initClient__().then(async () => {
        for (const gID of guildIDs) {
            // Check if all guilds have a config and generate one if not
            if (client.config.configs.get(gID) == null) {
                let guild: Guild = client.guilds.cache.get(gID)!;
                await client.config.insertNewConfig(await generateFirstConfig(guild));
            }
            // Create event handlers for all guilds
            eventHandlers[gID] = new EventHandler(client, gID);
        }
        await client.config.loadConfig();
    });
});
client.on(Events.MessageCreate, message => router(message, client.config.configs));
client.on(Events.InteractionCreate, async interaction => HandleSlashCommands(interaction));
client.on(Events.GuildCreate, async guild => {
    const conf: IConfig = await generateFirstConfig(guild);
    /*
      TODO - Add a check to see if the guild already exists in the database
      TODO - Create new EventHandler
    */
    await client.config.insertNewConfig(conf);
    client.config?.loadConfig();
});
client.on(Events.GuildScheduledEventCreate, (event: GuildScheduledEvent) => {
    try {
        if (!eventHandlers[event.guildId]) {
            throw new Error('Guild not found');
        }
        eventHandlers[event.guildId].createEvent(event);
    } catch (e) {
        logger.error('GuildScheduledEventCreate: ' + e);
    }
});
client.on(Events.GuildScheduledEventUpdate, () => {});
client.on(
    Events.GuildScheduledEventDelete,
    (event: GuildScheduledEvent | PartialGuildScheduledEvent) => {
        try {
            eventHandlers[event.guildId].deleteEvent(event);
        } catch (e) {
            logger.error('GuildScheduledEventDelete: ' + e);
        }
    }
);
client.on(Events.GuildScheduledEventUserAdd, () => {});
client.on(Events.GuildScheduledEventUserRemove, () => {});
client.login(process.env.DISCORD_TOKEN);
