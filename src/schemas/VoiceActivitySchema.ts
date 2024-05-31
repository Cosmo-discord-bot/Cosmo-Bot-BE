import mongoose from 'mongoose';
import { IGuildVoiceActivity, IVoiceActivity } from '../interfaces/IStatistics/IVoiceActivity';

const voiceActivitySchema: mongoose.Schema<IVoiceActivity> = new mongoose.Schema<IVoiceActivity>(
    {
        tsJoin: { type: Number, required: true },
        tsLeave: { type: Number, required: false },
        userId: { type: String, required: true },
        channelId: { type: String, required: true },
        active: { type: Boolean, required: true },
    },
    { _id: false }
);

export const guildVoiceActivitySchema: mongoose.Schema<IGuildVoiceActivity> = new mongoose.Schema<IGuildVoiceActivity>({
    guildId: { type: String, required: true, unique: true },
    activities: [voiceActivitySchema],
});
