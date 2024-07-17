import mongoose, { Connection, PipelineStage, UpdateWriteOpResult } from 'mongoose';
import { logger } from '../../logger/pino';
import { IGuildVoiceActivity, IVoiceActivity } from '../../interfaces/statistics/IVoiceActivity';
import { guildVoiceActivitySchema } from '../schemas/VoiceActivitySchema';

export class VoiceActivityDB {
    private model: mongoose.Model<IGuildVoiceActivity>;
    private readonly collection: string = 'GuildVoiceActivities';
    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
        guildVoiceActivitySchema.index({ guildId: 1 }); // Create index on for better performance
        this.model = this.connection.model<IGuildVoiceActivity>(this.collection, guildVoiceActivitySchema, this.collection);
    }

    public async getVoiceStatistics(guildId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
        try {
            let matchStage: any = { guildId: guildId };

            if (startDate || endDate) {
                matchStage['activities.tsJoin'] = {};
                if (startDate) matchStage['activities.tsJoin'].$gte = startDate.getTime();
                if (endDate) matchStage['activities.tsJoin'].$lte = endDate.getTime();
            }

            const pipeline: PipelineStage[] = [
                { $match: matchStage },
                { $unwind: '$activities' },
                { $match: { 'activities.active': false, 'activities.tsLeave': { $exists: true, $ne: null } } },
                {
                    $project: {
                        _id: 0,
                        userid: '$activities.userId',
                        tsjoin: { $toString: '$activities.tsJoin' },
                        tsleave: { $toString: '$activities.tsLeave' },
                        length: {
                            $toString: {
                                $subtract: ['$activities.tsLeave', '$activities.tsJoin'],
                            },
                        },
                        channel: '$activities.channelId',
                    },
                },
                { $sort: { tsjoin: -1 } },
            ];

            const result = await this.model.aggregate(pipeline);
            logger.info(`getVoiceStatistics: Retrieved statistics for guild ${guildId}`);
            return result;
        } catch (error) {
            logger.error(`getVoiceStatistics: Error retrieving statistics for guild ${guildId}, Error: ${error}`);
            throw error;
        }
    }

    public async insertVoiceActivity(guildId: string, event: IVoiceActivity): Promise<void> {
        try {
            await this.model.updateOne({ guildId }, { $push: { activities: event } }, { upsert: true });
            logger.info(`insertVoiceActivity: Event inserted - ${guildId} - ${event.userId} - ${event.channelId}`);
        } catch (error) {
            logger.error(`insertVoiceActivity: Error inserting event - ${guildId}, Error: ${error}`);
        }
    }

    public async onLeaveUpdateVoiceActivity(guildId: string, userId: string, channelId: string): Promise<void> {
        try {
            const result: UpdateWriteOpResult = await this.model.updateOne(
                {
                    guildId: guildId,
                    activities: {
                        $elemMatch: {
                            userId: userId,
                            channelId: channelId,
                            active: true,
                        },
                    },
                },
                {
                    $set: {
                        'activities.$.tsLeave': Date.now(),
                        'activities.$.active': false,
                    },
                }
            );

            if (result.matchedCount === 0) {
                logger.warn(`No matching active activity found for user ${userId} in channel ${channelId} of guild ${guildId}`);
            } else {
                logger.info(`updateLeaveVoiceActivity: Leave event updated - ${guildId} - ${userId} - ${channelId}`);
            }
        } catch (error) {
            logger.error(`updateLeaveVoiceActivity: Error updating leave event - ${guildId}, Error: ${error}`);
        }
    }
}
