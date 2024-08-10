import { IEvent } from '../../definitions/interfaces/events/IEvent';
import { logger } from '../../logger/pino';
import { Connection, Model, UpdateWriteOpResult } from 'mongoose';
import { eventSchema } from '../schemas/EventsSchema';

export class EventsDB {
    private readonly model: Model<IEvent>;
    private readonly collection: string = 'Events';
    private connection: Connection;
    public events: Map<string, IEvent>;

    constructor(connection: Connection) {
        this.connection = connection;

        this.model = this.connection.model<IEvent>(this.collection, eventSchema, this.collection);

        this.events = new Map<string, IEvent>();
    }

    public async loadEvents(): Promise<void> {
        const eventsArray: IEvent[] = await this.model.find({}).lean();
        for (const event of eventsArray) {
            this.events.set(event.eventId, event);
        }
        logger.info('Events loaded successfully!');
    }

    public async insertEvent(event: IEvent): Promise<void> {
        await this.model.create(event);
        this.events.set(event.eventId, event);
        logger.info(`Event inserted successfully - ${event.guildId}`);
    }

    public async updateEvents(event: IEvent): Promise<void> {
        try {
            const response: UpdateWriteOpResult = await this.model.replaceOne({ eventId: event.eventId }, event);
            if (!response.acknowledged) throw new Error('updateConfig: Config updating failed');
        } catch (error) {
            logger.error(`updateConfig: Config updating failed - ${event.guildId}`);
        }
    }

    public async deleteEvent(eventId: string): Promise<void> {
        try {
            const response = await this.model.deleteOne({ eventId: eventId });
            if (!response.acknowledged) throw new Error('deleteEvent: Event deletion failed');
            this.events.delete(eventId);
        } catch (error) {
            logger.error(`deleteEvent: Event deletion failed - ${eventId}`);
        }
    }
}
