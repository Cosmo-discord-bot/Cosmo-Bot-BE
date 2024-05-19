import 'dotenv/config';
import { generateFirstConfig } from './startup/init';
import { logger } from './logger/pino';
import {
    Events,
    GatewayIntentBits,
    Guild,
    GuildScheduledEvent,
    PartialGuildScheduledEvent,
    Partials,
    User,
} from 'discord.js';
import { router } from './router';
import { HandleSlashCommands } from './slash-commands/set-slash-commands';
import { CustomClient } from './Classes/CustomClient';
import { IConfig } from './interfaces/IConfig';
import { EventHandler } from './commands/EventHandler';
import { IEventHandler } from './interfaces/IEventHandler';
import { EventsHelper } from './helper/EventsHelper';

const client: CustomClient = new CustomClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
    ],
    partials: [Partials.GuildScheduledEvent, Partials.GuildMember],
});

const eventHandlers: IEventHandler = {};

/*
    Once client is ready, get config for all guilds.
    If guild doesn't have config, create a default one.
    Create event handlers for all guilds.
    Sync events from DB with events in Discord.
*/
client.once(Events.ClientReady, (): void => {
    logger.info('Client is ready!');
    const guildIDs: string[] = client.guilds.cache.map(guild => guild.id);
    logger.info(guildIDs);
    client.__initClient__().then(async () => {
        for (const gID of guildIDs) {
            // Check if all guilds have a config and generate one if not
            let guild: Guild = client.guilds.cache.get(gID)!;
            if (client.config.configs.get(gID) == null) {
                await client.config.insertNewConfig(await generateFirstConfig(guild));
            }
            // Create event handlers for all guilds
            await EventsHelper.__init__(eventHandlers, guild, client);
        }
        await client.config.loadConfig();
        logger.info('Initialization complete!');
    });
});
client.on(Events.MessageCreate, message => router(message, client.config.configs));
client.on(Events.InteractionCreate, async interaction => HandleSlashCommands(interaction));
client.on(Events.GuildCreate, async guild => {
    try {
        if (!guild.available) {
            throw new Error('Guild not available');
        }
        const conf: IConfig = await generateFirstConfig(guild);
        if (client.config.configs.get(guild.id) != null) {
            throw new Error('Guild already exists');
        }
        eventHandlers[guild.id] = new EventHandler(client, guild.id);
        await client.config.insertNewConfig(conf);
        client.config?.loadConfig();
    } catch (e) {
        logger.error('GuildCreate: ' + e);
    }
});
client.on(Events.GuildScheduledEventCreate, async (event: GuildScheduledEvent) => {
    try {
        if (!eventHandlers[event.guildId]) {
            throw new Error('Guild not found');
        }
        await eventHandlers[event.guildId].createEvent(event);
    } catch (e) {
        logger.error('GuildScheduledEventCreate: ' + e);
    }
});
client.on(
    Events.GuildScheduledEventUpdate,
    (oldEvent: GuildScheduledEvent | PartialGuildScheduledEvent | null, newEvent: GuildScheduledEvent) => {
        try {
            if (!oldEvent) {
                throw new Error('Old event not found');
            }
            eventHandlers[oldEvent.guildId].updateEvent(oldEvent, newEvent);
        } catch (e) {
            logger.error('GuildScheduledEventUpdate: ' + e);
        }
    }
);
client.on(Events.GuildScheduledEventDelete, (event: GuildScheduledEvent | PartialGuildScheduledEvent) => {
    try {
        eventHandlers[event.guildId].deleteEvent(event);
    } catch (e) {
        logger.error('GuildScheduledEventDelete: ' + e);
    }
});
client.on(Events.GuildScheduledEventUserAdd, (event: GuildScheduledEvent | PartialGuildScheduledEvent, user: User) => {
    try {
        eventHandlers[event.guildId].addUserToEvent(event, user);
    } catch (e) {
        logger.error('GuildScheduledEventUserAdd: ' + e);
    }
});

client.on(
    Events.GuildScheduledEventUserRemove,
    (event: GuildScheduledEvent | PartialGuildScheduledEvent, user: User) => {
        try {
            eventHandlers[event.guildId].removeUserFromEvent(event, user);
        } catch (e) {
            logger.error('GuildScheduledEventUserRemove: ' + e);
        }
    }
);

client.login(process.env.DISCORD_TOKEN);
