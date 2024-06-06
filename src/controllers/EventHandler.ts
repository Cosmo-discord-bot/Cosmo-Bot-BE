import {
    CategoryChannel,
    ChannelType,
    Client,
    Guild,
    GuildBasedChannel,
    GuildScheduledEvent,
    GuildScheduledEventStatus,
    MessageReaction,
    PartialGuildScheduledEvent,
    PermissionFlagsBits,
    ReactionCollector,
    Role,
    User,
} from 'discord.js';
import { logger } from '../logger/pino';
import { IEvent } from '../interfaces/events/IEvent';
import { Common } from '../helper/Common';

// TODO - Channels from ended events should be moved to Previous Events category
// TODO - Check if channels should be threads
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
    }

    /*
    Create a new category channel for events
     */
    public static createChannelCategory() {}

    /*
    Create a role for the event
    Create a new text channel for event
    When an event is created, parse description for @mentions and roles and share link of event to #general
    */
    public async createEvent(event: GuildScheduledEvent) {
        logger.info(
            `Creating event: ${event.name} in guild: ${this.client.guilds.cache.get(event.guildId)!.name} - ${
                event.guildId
            }`
        );
        const sanitizedEventName: string = Common.sanitizeEventName(event.name);
        try {
            let createdRole = await this.guild.roles.create({
                name: sanitizedEventName,
                color: 'White',
                reason: 'Event role for ' + sanitizedEventName,
            });
            if (!event.creatorId) {
                throw new Error('Event creator not found');
            }
            this.guild.members.cache.get(event.creatorId)?.roles.add(createdRole);
            logger.info(`Role created: ${createdRole.name} - ${createdRole.id}`);

            const mentionedRoles: string[] = this.parseEventDescriptionForMentions(event);
            this.sendEventLinkToGeneral(event, mentionedRoles);

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
                sanitizedEventName = Common.sanitizeEventName(newEvent.name);
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

    public deleteEventByIEvent(event: IEvent) {
        logger.info(
            `Deleting event: ${event.eventName} in guild: ${this.client.guilds.cache.get(event.guildId)!.name}`
        );
        try {
            const foundEvent = this.client.events.events.get(event.eventId);
            if (!foundEvent) {
                throw new Error('Event not found');
            }
            const roleId = foundEvent.roleId;
            if (!roleId) {
                throw new Error('Role not found');
            }
            this.guild.roles.cache.find(role => role.id === roleId)?.delete();
            logger.info(`Role deleted: ${roleId}`);

            this.client.events.deleteEvent(event.eventId);
        } catch (error) {
            logger.error(`Error deleting event: ${error}`);
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
        } catch (error) {
            logger.error(`Error deleting event: ${error}`);
        }
    }

    public addUserToEvent(event: GuildScheduledEvent | PartialGuildScheduledEvent, user: User) {
        try {
            logger.info(`Adding user: ${user.username} to event: ${event.name}`);
            const role = this.getRoleFromEvent(event);
            this.guild.members.cache.find(member => member.id === user.id)?.roles.add(role);
        } catch (error) {
            logger.error(`Error adding user to event: ${error}`);
        }
    }

    public removeUserFromEvent(event: GuildScheduledEvent | PartialGuildScheduledEvent, user: User) {
        try {
            logger.info(`Removing user: ${user.username} from event: ${event.name}`);
            const role = this.getRoleFromEvent(event);
            this.guild.members.cache.find(member => member.id === user.id)?.roles.remove(role);
        } catch (error) {
            logger.error(`Error removing user from event: ${error}`);
        }
    }

    public removeUsersFromRoleByEvent(event: GuildScheduledEvent | PartialGuildScheduledEvent) {
        try {
            logger.info(`Removing all users from event: ${event.name}`);
            const role = this.getRoleFromEvent(event);
            role.members.forEach(member => {
                member.roles.remove(role);
            });
        } catch (error) {
            logger.error(`Error removing users from event: ${error}`);
        }
    }

    private parseEventDescriptionForMentions(event: GuildScheduledEvent | PartialGuildScheduledEvent): string[] {
        let mentionedRoles: string[] = [];
        if (event.description) {
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
        return mentionedRoles;
    }

    private async sendEventLinkToGeneral(
        event: GuildScheduledEvent | PartialGuildScheduledEvent,
        mentionedRoles: string[]
    ) {
        let mainChannel = this.guild.channels.cache.get(this.client.config.configs.get(this.guild.id)!.mainChannelId);
        if (mainChannel && mainChannel.isTextBased()) {
            const mentionedRolesStr = createTaggableRoleStringFromIds(mentionedRoles);
            let message = await mainChannel.send(`${event.url} - ${mentionedRolesStr}`);
            logger.debug(`Event URL: ${event.url} - ${mentionedRolesStr}`);
            await message.react('✅');
            await message.react('❌');

            const filter = (reaction: MessageReaction, user: User) => {
                if (reaction && reaction.emoji && reaction.emoji.name && user) {
                    return ['✅', '❌'].includes(reaction.emoji.name);
                }
                return false;
            };

            const collector: ReactionCollector = message.createReactionCollector({ filter, time: 60_000 });

            collector.on('collect', (reaction, user) => {
                if (reaction.emoji.name === '✅' && user.id === event.creatorId) {
                    if (!this.isChannelCategoryCreated()) {
                        this.createChannelCategory();
                    }
                    this.createEventChannel(event);
                    collector.stop('Event creator created channel');
                    logger.debug(`Creating event channel for ${event.id} ${event.name}`);
                }
                if (reaction.emoji.name === '❌' && user.id === event.creatorId) {
                    collector.stop('Event creator cancelled channel creation');
                    logger.debug(`Event creator cancelled channel creation`);
                }
            });

            collector.on('end', collected => {
                message.reactions.removeAll().catch(error => {
                    logger.error(`Error removing reactions from ${event.id} ${event.name}: ${error}`);
                });
                logger.info(`Collected ${collected.size} reactions for ${event.id} ${event.name}`);
            });
        } else {
            logger.error('sendEventLinkToGeneral - Main channel not found');
        }
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

    private isChannelCategoryCreated(): boolean {
        if (this.eventsCategory) return true;
        else {
            const channel: GuildBasedChannel | undefined = this.guild.channels.cache.get('events');
            if (channel) {
                if (channel.type === ChannelType.GuildCategory) {
                    return true;
                }
            }
            return false;
        }
    }

    private async createChannelCategory() {
        this.eventsCategory = await this.guild.channels.create({
            name: 'events',
            type: ChannelType.GuildCategory,
            position: 0.1,
            reason: 'Events category where future events will have their channels created',
        });
    }

    private async createEventChannel(event: GuildScheduledEvent | PartialGuildScheduledEvent) {
        if (!this.eventsCategory) {
            throw new Error('Events category not found');
        }
        if (!event.name) {
            throw new Error('Event name not found');
        }
        const sanitizedEventName: string = Common.sanitizeEventName(event.name);
        const eventChannel = await this.guild.channels.create({
            name: sanitizedEventName,
            type: ChannelType.GuildText,
            parent: this.eventsCategory,
            reason: 'Event channel for ' + sanitizedEventName,
            permissionOverwrites: [
                {
                    id: this.guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: this.getRoleFromEvent(event).id,
                    allow: [PermissionFlagsBits.ViewChannel],
                },
            ],
        });
        logger.info(`Event channel created: ${eventChannel.name} - ${eventChannel.id}`);

        this.client.events.updateEvents({
            eventId: event.id,
            guildId: event.guildId,
            eventsCategoryId: this.eventsCategory.id,
            eventName: event.name,
            roleId: this.getRoleFromEvent(event).id,
            channelId: eventChannel.id,
        });
    }

    /*
    Maybe this should be a different handler
    private static subscribeToEvent() {}
     */
}

function createTaggableRoleStringFromIds(ids: string[]): string {
    return ids.map(id => `<@&${id}>`).join(' ');
}
