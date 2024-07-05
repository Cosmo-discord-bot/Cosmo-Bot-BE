import mongoose, { Connection } from 'mongoose';
import { logger } from '../../logger/pino';
import { IGuildMessageActivity, IMessageActivity } from '../../interfaces/statistics/IMessageActivity';
import { guildMessageActivitySchema } from '../schemas/MessageActivitySchema';

export class MessageActivityDB {
    private model: mongoose.Model<IGuildMessageActivity>;
    private readonly collection: string = 'GuildMessageActivities';
    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
        this.model = this.connection.model<IGuildMessageActivity>(this.collection, guildMessageActivitySchema, this.collection);
    }

    public async insertMessageActivity(guildId: string, messageActivity: IMessageActivity): Promise<void> {
        try {
            await this.model.updateOne({ guildId }, { $push: { activities: messageActivity } }, { upsert: true });
            logger.info(`insertMessageActivity: Message activity inserted - ${guildId} - ${messageActivity.userId} - ${messageActivity.channelId}`);
        } catch (error) {
            logger.error(`insertMessageActivity: Error inserting Message activity - ${guildId}, Error: ${error}`);
        }
    }

    //public async onLeaveUpdateVoiceActivity(guildId: string, userId: string, channelId: string): Promise<void> {
    //    try {
    //        const result: UpdateWriteOpResult = await this.model.updateOne(
    //            {
    //                guildId: guildId,
    //                activities: {
    //                    $elemMatch: {
    //                        userId: userId,
    //                        channelId: channelId,
    //                        active: true,
    //                    },
    //                },
    //            },
    //            {
    //                $set: {
    //                    'activities.$.tsLeave': Date.now(),
    //                    'activities.$.active': false,
    //                },
    //            }
    //        );
    //
    //        if (result.matchedCount === 0) {
    //            logger.warn(
    //                `No matching active activity found for user ${userId} in channel ${channelId} of guild ${guildId}`
    //            );
    //        } else {
    //            logger.info(`updateLeaveVoiceActivity: Leave event updated - ${guildId} - ${userId} - ${channelId}`);
    //        }
    //    } catch (error) {
    //        logger.error(`updateLeaveVoiceActivity: Error updating leave event - ${guildId}, Error: ${error}`);
    //    }
    //}
}
