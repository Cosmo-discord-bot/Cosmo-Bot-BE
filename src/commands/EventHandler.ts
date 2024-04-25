import { CategoryChannel, Client, Guild, GuildScheduledEvent } from 'discord.js';
import { logger } from '../logger/pino';

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

    public createEvent(event: GuildScheduledEvent) {
        logger.debug('Creating event: ' + event.name);
        logger.debug(this.client.guilds.cache.get(event.guildId)!.name);
        this.guild.roles
            .create({
                name: event.name.split(' ').join('_').toLowerCase(),
                color: 'White',
                reason: 'Event role for ' + event.name,
            })
            .then(role => {
                logger.debug('Role created: ' + role.name);
            });
    }

    public updateEvent() {}

    public deleteEvent() {}

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
