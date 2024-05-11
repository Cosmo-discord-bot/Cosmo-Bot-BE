import {
    CategoryChannel,
    Client,
    Guild,
    GuildScheduledEvent,
    PartialGuildScheduledEvent,
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
            channel => channel.id === this.client.config.configs.get(guildId)!.eventsGroupId
        ) as CategoryChannel;
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
            `Creating event: ${event.name} in guild: ${
                this.client.guilds.cache.get(event.guildId)!.name
            } - ${event.guildId}`
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
            this.client.events.insertEvent(eventData);
        } catch (error) {
            logger.error(`Error creating role for event: ${error}`);
        }
    }

    /*
    Update:
      role name
      channel name
      active status
     */
    public updateEvent() {}

    public deleteEvent(event: GuildScheduledEvent | PartialGuildScheduledEvent) {
        logger.info(
            `Deleting event: ${event.name} in guild: ${
                this.client.guilds.cache.get(event.guildId)!.name
            } - ${event.guildId}`
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

            this.client.events.deleteEvent(event.id);
        } catch (error) {
            logger.error(`Error deleting event: ${error}`);
        }
        // Delete event role
        // Delete event channel
    }

    private addUserToEvent() {}

    private removeUserFromEvent() {}

    private promptTextChannelCreation() {}

    private createEventRole() {}

    private deleteEventRole() {}

    /*
    Maybe this should be a different handler
    private static subscribeToEvent() {}
     */
}
