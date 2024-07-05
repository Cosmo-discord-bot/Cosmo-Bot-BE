import { Collection, FetchGuildScheduledEventSubscribersOptions, Guild, GuildScheduledEvent } from 'discord.js';
import { ICategorizedEvents } from '../interfaces/events/ICategorizedEvents';
import { IEvent } from '../interfaces/events/IEvent';
import { logger } from '../logger/pino';
import { EventController } from '../controllers/EventController';
import { IEventHandler } from '../interfaces/events/IEventHandler';
import { CustomClient } from '../Classes/CustomClient';

export class EventsHelper {
    public static async __init__(eventHandlers: IEventHandler, guild: Guild, client: CustomClient): Promise<void> {
        const gID: string = guild.id;
        logger.debug(`Events - ${gID} ${guild.name} `);
        eventHandlers[gID] = new EventController(client, gID);
        const events: Collection<string, GuildScheduledEvent> = await guild.scheduledEvents.fetch();

        const discordEvents: GuildScheduledEvent[] = EventsHelper.splitEventsByGuild(events, gID);
        const dbEvents: IEvent[] = [...client.events.events.values()].filter((event) => event.guildId === gID);

        const categorizedEvents: ICategorizedEvents = EventsHelper.categorizeEvents(discordEvents, dbEvents);

        logger.debug(categorizedEvents);

        // Create missing events
        for (const event of categorizedEvents.create) {
            await eventHandlers[gID].createEvent(event);
        }

        // Update events and roles for existing events

        for (const event of categorizedEvents.update) {
            eventHandlers[gID].updateEvent(event, event);
            // Handle role subscribers
            const options: FetchGuildScheduledEventSubscribersOptions = {
                withMember: true,
            };
            // Check for a better way of doing this
            eventHandlers[gID].removeUsersFromRoleByEvent(event);
            event.fetchSubscribers(options).then((subscribers) => {
                subscribers.forEach((subscriber) => {
                    eventHandlers[gID].addUserToEvent(event, subscriber.user);
                });
            });
        }

        // Delete events
        for (const event of categorizedEvents.delete) {
            eventHandlers[gID].deleteEventByIEvent(event);
        }
    }

    public static splitEventsByGuild(events: Collection<string, GuildScheduledEvent>, guildId: string): GuildScheduledEvent[] {
        const eventsByGuild: GuildScheduledEvent[] = [];
        events.forEach((event: GuildScheduledEvent) => {
            if (event.guildId === guildId) {
                eventsByGuild.push(event);
            }
        });
        return eventsByGuild;
    }

    public static categorizeEvents(guildEvents: GuildScheduledEvent[], dbEvents: IEvent[]): ICategorizedEvents {
        const categorizedEvents: ICategorizedEvents = {
            create: [],
            update: [],
            delete: [],
        };

        // Loop through guild events
        for (const discordEvent of guildEvents) {
            // Check if the event exists in the database
            const dbEventIndex = dbEvents.findIndex((event) => event.eventId === discordEvent.id);

            if (dbEventIndex == -1) {
                // If the event only exists in the guild, push it to the create array
                categorizedEvents.create.push(discordEvent);
            } else {
                // If the event exists in both guild and database, push it to the update array
                categorizedEvents.update.push(discordEvent);
                // Remove the event from the dbEvents array to keep track of events that need to be deleted
                dbEvents.splice(dbEventIndex, 1);
            }
        }

        // Remaining events in dbEvents array should be marked for deletion
        categorizedEvents.delete = dbEvents;

        return categorizedEvents;
    }
}
