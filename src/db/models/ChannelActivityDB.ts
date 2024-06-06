import mongoose, { Connection } from 'mongoose';
import { logger } from '../../logger/pino';
import { IGuildChannelActivity } from '../../interfaces/statistics/IChannelActivity';
import { guildChannelActivitySchema } from '../schemas/ChannelsActivitySchema';

export class ChannelActivityDB {
    private model: mongoose.Model<IGuildChannelActivity>;
    private readonly collection: string = 'GuildChannelActivities';
    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
        this.model = this.connection.model<IGuildChannelActivity>(
            this.collection,
            guildChannelActivitySchema,
            this.collection
        );
    }

    public async insertChannelActivity(channelActivity: IGuildChannelActivity): Promise<void> {
        try {
            await this.model.create(channelActivity);
            logger.info(`insertChannelActivity: Message activity inserted - ${JSON.stringify(channelActivity)}`);
        } catch (error) {
            logger.error(
                `insertChannelActivity: Error inserting Message activity - ${JSON.stringify(
                    channelActivity
                )}, Error: ${error}`
            );
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
