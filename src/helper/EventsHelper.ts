import { Collection, GuildScheduledEvent } from 'discord.js';
import { ICategorizedEvents } from '../interfaces/ICategorizedEvents';
import { IEvent } from '../interfaces/IEvent';
import { logger } from '../logger/pino';

export class EventsHelper {
    public static splitEventsByGuild(
        events: Collection<string, GuildScheduledEvent>,
        guildId: string
    ): GuildScheduledEvent[] {
        let eventsByGuild: GuildScheduledEvent[] = [];
        events.forEach((event: GuildScheduledEvent) => {
            if (event.guildId === guildId) {
                eventsByGuild.push(event);
            }
        });
        return eventsByGuild;
    }

    public static categorizeEvents(guildEvents: GuildScheduledEvent[], dbEvents: IEvent[]): ICategorizedEvents {
        let categorizedEvents: ICategorizedEvents = {
            create: [],
            update: [],
            delete: [],
        };

        for (const discordEvent of guildEvents) {
            if (dbEvents.some(event => event.eventId === discordEvent.id)) {
                categorizedEvents.update.push(discordEvent);
            } else {
                categorizedEvents.create.push(discordEvent);
            }
        }

        // TODO Check this logic
        let tempDeleteArray: IEvent[] = [];
        for (const dbEvent of dbEvents) {
            if (!guildEvents.some(event => event.id === dbEvent.guildId)) {
                tempDeleteArray.push(dbEvent);
            }
        }

        logger.info('DELETE-ARRAY: ' + tempDeleteArray);

        // for (const dbEvent of tempDeleteArray) {
        //     const matchingGuildEvent = guildEvents.find(event => event.id === dbEvent.id);
        //     if (!matchingGuildEvent) {
        //         categorizedEvents.delete.push(dbEvent);
        //     }
        // }

        return categorizedEvents;
    }
}
