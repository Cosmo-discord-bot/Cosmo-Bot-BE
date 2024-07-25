import { Schema } from 'mongoose';
import { IConfig } from '../../definitions/interfaces/common/IConfig';

export const configSchema: Schema<IConfig> = new Schema<IConfig>({
    guildId: { type: String, required: true },
    prefix: { type: String, required: false },
    color: { type: String, required: false },
    mainChannelId: { type: String, required: true },
    rolesChannelId: { type: String, required: true },
    eventsGroupId: { type: String, required: true },
});
