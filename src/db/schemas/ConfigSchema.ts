import { Schema } from 'mongoose';
import { IConfig } from '../../interfaces/common/IConfig';

export const configSchema: Schema<IConfig> = new Schema<IConfig>({
    guildId: { type: String, required: true },
    prefix: { type: String, required: true },
    color: { type: String, required: true },
    mainChannelId: { type: String, required: true },
    rolesChannelId: { type: String, required: true },
    eventsGroupId: { type: String, required: true },
});
