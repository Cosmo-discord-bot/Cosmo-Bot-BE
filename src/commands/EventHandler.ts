import {
    CategoryChannel,
    Client,
    Guild,
    GuildScheduledEvent,
    GuildScheduledEventStatus,
    PartialGuildScheduledEvent,
    Role,
    User,
} from 'discord.js';
import { logger } from '../logger/pino';
import { sanitizeEventName } from '../helper/sanitizeNames';
import { IEvent } from '../interfaces/IEvent';

export class EventHandler {
    private guild: Guild;
    private client: Client;
    private eventsCategory: CategoryChannel;

    constructor(client: Client, guildId: string) {
        this.client = client;

        if (!this.client.config) {
            throw new Error('Config not found');
        }

        const guild: Guild | undefined = this.client.guilds.cache.get(guildId);
        if (!guild) {
            throw new Error('Guild not found');
        }
        this.guild = guild;

        this.eventsCategory = guild.channels.cache.find(
            channel => channel.id === this.client.config.configs.get(guildId)?.eventsGroupId
        ) as CategoryChannel;

        // TODO INIT
    }

    /*
    Create a new category channel for events
     */
    public static createChannelCategory() {}

    public async createEvent(event: GuildScheduledEvent) {
        /*
        When an event is created, parse description for @mentions and roles and share link of event to #general
         */
        logger.info(
            `Creating event: ${event.name} in guild: ${this.client.guilds.cache.get(event.guildId)!.name} - ${
                event.guildId
            }`
        );
        const sanitizedEventName: string = sanitizeEventName(event.name);
        try {
            let createdRole = await this.guild.roles.create({
                name: sanitizedEventName,
                color: 'White',
                reason: 'Event role for ' + sanitizedEventName,
            });

            logger.info(`Role created: ${createdRole.name} - ${createdRole.id}`);

            const eventData: IEvent = {
                eventId: event.id,
                guildId: event.guildId,
                eventsCategoryId: '-1',
                eventName: sanitizedEventName,
                roleId: createdRole.id,
                channelId: '-1',
            };
            logger.debug(`Event data: ${JSON.stringify(eventData)}`);
            let mentionedRoles: string[] = [];
            if (event.description) {
                //const description = event.description;
                const mentions = event.description.match(/@[^ ]+/g);
                logger.debug(`Mentions: ${mentions}`);
                if (mentions) {
                    mentions.forEach(mention => {
                        // Check for mentioned roles
                        const role = this.guild.roles.cache.find(
                            role => role.name.toLowerCase() === mention.substring(1).toLowerCase()
                        );
                        if (role) {
                            mentionedRoles.push(role.id);
                        }
                    });
                    logger.debug(`Mentioned roles: ${mentionedRoles}`);
                }
                logger.debug(`Event description: ${event.description}`);
            }

            let mainChannel = this.guild.channels.cache.get(
                this.client.config.configs.get(this.guild.id)!.mainChannelId
            );
            if (mainChannel && mainChannel.isTextBased()) {
                const mentionedRolesStr = createTaggableStringFromIds(mentionedRoles);
                mainChannel.send(`${event.url} - ${mentionedRolesStr}`);
                logger.debug(`Event URL: ${event.url} - ${mentionedRolesStr}`);
            }
            this.client.events.insertEvent(eventData);
        } catch (error) {
            logger.error(`Error creating role for event: ${error}`);
        }
    }

    /*
    Update:
      role name
      active status
     */
    public updateEvent(
        oldEvent: GuildScheduledEvent | PartialGuildScheduledEvent,
        newEvent: GuildScheduledEvent | PartialGuildScheduledEvent
    ) {
        logger.info(
            `Updating event: ${oldEvent.name} in guild: ${this.client.guilds.cache.get(oldEvent.guildId)!.name} - ${
                oldEvent.guildId
            }`
        );
        try {
            const foundEvent = this.client.events.events.get(oldEvent.id);
            if (!foundEvent) {
                throw new Error('Event not found');
            }
            const roleId = foundEvent.roleId;
            if (!roleId) {
                throw new Error('Role not found');
            }
            let sanitizedEventName: string = '';
            if (newEvent.name) {
                sanitizedEventName = sanitizeEventName(newEvent.name);
                if (foundEvent) {
                    this.guild.roles.cache.find(role => role.id === foundEvent.roleId)!.setName(sanitizedEventName);
                }
                this.client.events.updateEvents({
                    eventId: newEvent.id,
                    guildId: newEvent.guildId,
                    eventsCategoryId: foundEvent.eventsCategoryId,
                    eventName: newEvent.name,
                    roleId: roleId,
                    channelId: foundEvent.channelId,
                });
            }

            if (newEvent.status == GuildScheduledEventStatus.Completed) {
                this.client.events.deleteEvent(newEvent.id);

                this.guild.roles.cache.find(role => role.id === roleId)?.delete();
            }
        } catch (error) {
            logger.error(`Error updating event: ${error}`);
        }
    }

    public deleteEvent(event: GuildScheduledEvent | PartialGuildScheduledEvent) {
        logger.info(
            `Deleting event: ${event.name} in guild: ${this.client.guilds.cache.get(event.guildId)!.name} - ${
                event.guildId
            }`
        );
        try {
            const foundEvent = this.client.events.events.get(event.id);
            if (!foundEvent) {
                throw new Error('Event not found');
            }
            const roleId = foundEvent.roleId;
            if (!roleId) {
                throw new Error('Role not found');
            }
            this.guild.roles.cache.find(role => role.id === roleId)?.delete();
            logger.info(`Role deleted: ${roleId}`);

            this.client.events.deleteEvent(event.id);
            if (foundEvent.channelId != '-1') {
                this.guild.channels.cache.find(channel => channel.id === foundEvent.channelId)?.delete();
                logger.info(`Channel deleted: ${foundEvent.channelId}`);
            }
        } catch (error) {
            logger.error(`Error deleting event: ${error}`);
        }
    }

    public addUserToEvent(event: GuildScheduledEvent | PartialGuildScheduledEvent, user: User) {
        // Check if user is already in event
        // Add user to event
        logger.info(`Adding user: ${user.username} to event: ${event.name}`);
        const role = this.getRoleFromEvent(event);
        this.guild.members.cache.find(member => member.id === user.id)?.roles.add(role);
    }

    public removeUserFromEvent(event: GuildScheduledEvent | PartialGuildScheduledEvent, user: User) {
        logger.info(`Removing user: ${user.username} from event: ${event.name}`);
        const role = this.getRoleFromEvent(event);
        this.guild.members.cache.find(member => member.id === user.id)?.roles.remove(role);
    }

    private getRoleFromEvent(event: GuildScheduledEvent | PartialGuildScheduledEvent): Role {
        const foundEvent = this.client.events.events.get(event.id);
        if (!foundEvent) {
            throw new Error('Event not found');
        }
        const roleId = foundEvent.roleId;
        if (!roleId) {
            throw new Error('Role not found');
        }
        const role = this.guild.roles.cache.find(role => role.id === roleId);
        if (!role) {
            throw new Error('Role not found');
        }
        return role;
    }

    private promptTextChannelCreation() {}
    /*
    Maybe this should be a different handler
    private static subscribeToEvent() {}
     */
}

function createTaggableStringFromIds(ids: string[]): string {
    return ids.map(id => `<@&${id}>`).join(' ');
}
