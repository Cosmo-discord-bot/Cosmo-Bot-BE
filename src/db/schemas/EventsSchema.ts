import { Schema } from 'mongoose'
import { IEvent } from '../../interfaces/events/IEvent'

export const eventSchema: Schema<IEvent> = new Schema<IEvent>({
    eventName: { type: String, required: true },
    guildId: { type: String, required: true },
    eventsCategoryId: { type: String, required: true },
    eventId: { type: String, required: true },
    roleId: { type: String, required: true },
    channelId: { type: String, required: true },
})
