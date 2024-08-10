import { Events, Guild, GuildScheduledEvent, PartialGuildScheduledEvent, User, VoiceState } from 'discord.js';
import { logger } from '../logger/pino';
import { generateFirstConfig } from '../helper/generateFirstConfig';
import { EventsHelper } from '../helper/EventsHelper';
import { IMessageActivity } from '../definitions/interfaces/statistics/IMessageActivity';
import { interactionController } from '../controllers/InteractionController';
import { IConfig } from '../definitions/interfaces/common/IConfig';
import { EventController } from '../controllers/EventController';
import { CustomClient } from '../definitions/Classes/CustomClient';
import { IEventHandler } from '../definitions/interfaces/events/IEventHandler';

/*
    Once client is ready, get config for all guilds.
    If guild doesn't have config, create a default one.
    Create event handlers for all guilds.
    Sync events from DB with events in Discord.
*/

export const discordClientEvents = (client: CustomClient, eventHandlers: IEventHandler) => {
    client.once(Events.ClientReady, (): void => {
        logger.info('Client is ready!');
        const guildIDs: string[] = client.guilds.cache.map((guild) => guild.id);
        logger.info(guildIDs);
        client.__initClient__().then(async () => {
            for (const gID of guildIDs) {
                // Check if all guilds have a config and generate one if not
                const guild: Guild = client.guilds.cache.get(gID)!;
                if (client.config.configs.get(gID) == null) {
                    await client.config.insertNewConfig(await generateFirstConfig(guild));
                }
                // Create event handlers for all guilds
                await EventsHelper.__init__(eventHandlers, guild, client);
            }
            await client.config.loadConfig();
            logger.info('Initialization complete!');

            await client.dockerController.getRunningContainers();
        });
    });

    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot) return;
        // Insert message activity
        await client.statisticsWrapper.messageActivity.insertMessageActivity(message.guild!.id, {
            ts: Date.now(),
            channelId: message.channel.id,
            userId: message.author.id,
        } as IMessageActivity);
        // Route message to correct handler
        //router(message, client.config.configs);
    });

    client.on(Events.InteractionCreate, async (interaction) => interactionController(interaction));

    client.on(Events.GuildCreate, async (guild) => {
        try {
            if (!guild.available) {
                throw new Error('Guild not available');
            }
            const conf: IConfig = await generateFirstConfig(guild);
            if (client.config.configs.get(guild.id) != null) {
                throw new Error('Guild already exists');
            }
            eventHandlers[guild.id] = new EventController(client, guild.id);
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

    client.on(Events.GuildScheduledEventUpdate, (oldEvent: GuildScheduledEvent | PartialGuildScheduledEvent | null, newEvent: GuildScheduledEvent) => {
        try {
            if (!oldEvent) {
                throw new Error('Old event not found');
            }
            eventHandlers[oldEvent.guildId].updateEvent(oldEvent, newEvent);
        } catch (e) {
            logger.error('GuildScheduledEventUpdate: ' + e);
        }
    });

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

    client.on(Events.GuildScheduledEventUserRemove, (event: GuildScheduledEvent | PartialGuildScheduledEvent, user: User) => {
        try {
            eventHandlers[event.guildId].removeUserFromEvent(event, user);
        } catch (e) {
            logger.error('GuildScheduledEventUserRemove: ' + e);
        }
    });

    client.on(Events.VoiceStateUpdate, (oldState: VoiceState, newState: VoiceState) => {
        try {
            if (oldState.channelId === newState.channelId) {
                return;
            }
            if (newState.channelId == null) {
                client.statisticsWrapper.voiceActivity.onLeaveUpdateVoiceActivity(newState.guild.id, newState.member!.id, oldState.channelId!);
            } else if (oldState.channelId == null) {
                client.statisticsWrapper.voiceActivity.insertVoiceActivity(newState.guild.id, {
                    tsJoin: Date.now(),
                    tsLeave: -1,
                    userId: newState.member!.id,
                    channelId: newState.channelId,
                    active: true,
                });
                logger.debug(
                    'VoiceStateUpdate: ' +
                        JSON.stringify({
                            guildId: newState.guild.id,
                            tsJoin: Date.now(),
                            tsLeave: -1,
                            userId: newState.member!.id,
                            channelId: newState.channelId,
                            active: true,
                        })
                );
            } else {
                client.statisticsWrapper.voiceActivity.onLeaveUpdateVoiceActivity(oldState.guild.id, oldState.member!.id, oldState.channelId!);
                client.statisticsWrapper.voiceActivity.insertVoiceActivity(newState.guild.id, {
                    tsJoin: Date.now(),
                    tsLeave: -1,
                    userId: newState.member!.id,
                    channelId: newState.channelId,
                    active: true,
                });
            }
        } catch (e) {
            logger.error('VoiceStateUpdate: ' + e);
        }
    });

    client.on(Events.ChannelCreate || Events.ChannelDelete, async (channel) => {
        try {
            if (!channel.guild) {
                throw new Error('Guild not found');
            }
            if (!eventHandlers[channel.guild.id]) {
                throw new Error('Guild not found');
            }

            await client.statisticsWrapper.channelActivity.insertChannelActivity({
                name: channel.name,
                timestamp: new Date(),
                metadata: {
                    guildId: channel.guild.id,
                    channelId: channel.id,
                    type: Events.ChannelCreate ? 'ADDITION' : 'REMOVAL',
                },
            });
        } catch (e) {
            logger.error('ChannelCreate/Delete: ' + e);
        }
    });
};
