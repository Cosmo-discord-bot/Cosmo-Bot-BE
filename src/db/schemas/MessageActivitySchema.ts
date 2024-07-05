import mongoose from 'mongoose';
import { IGuildMessageActivity, IMessageActivity } from '../../interfaces/statistics/IMessageActivity';

const messageActivitySchema: mongoose.Schema<IMessageActivity> = new mongoose.Schema<IMessageActivity>(
    {
        ts: { type: Number, required: true },
        channelId: { type: String, required: true },
        userId: { type: String, required: true },
    },
    { _id: false }
);

export const guildMessageActivitySchema: mongoose.Schema<IGuildMessageActivity> = new mongoose.Schema<IGuildMessageActivity>({
    guildId: { type: String, required: true, unique: true },
    activities: [messageActivitySchema],
});
