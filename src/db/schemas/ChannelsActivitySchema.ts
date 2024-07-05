import { Schema } from 'mongoose'
import { IGuildChannelActivity } from '../../interfaces/statistics/IChannelActivity'

export const guildChannelActivitySchema: Schema<IGuildChannelActivity> = new Schema<IGuildChannelActivity>(
    {
        name: { type: String, required: true },
        timestamp: { type: Date, required: true },
        metadata: {
            guildId: { type: String, required: true },
            channelId: { type: String, required: true },
            type: { type: String, required: true },
        },
    },
    {
        timeseries: {
            timeField: 'timestamp',
            metaField: 'metadata',
            granularity: 'hours',
        },
    }
)
