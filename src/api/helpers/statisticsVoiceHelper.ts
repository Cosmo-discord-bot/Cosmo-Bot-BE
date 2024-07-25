import { logger } from '../../logger/pino';
import { CustomClient } from '../../definitions/Classes/CustomClient';
import { Snowflake } from 'discord.js';

interface VoiceActivity {
    userid: string;
    tsjoin: string;
    tsleave: string;
    length: string;
    channel: string;
}

interface DailyUserActivity {
    [date: string]: {
        [userid: string]: number;
    };
}

export class StatisticsVoiceHelper {
    public static async getActivityLastNDays(client: CustomClient, guildId: Snowflake, days: number = 30) {
        try {
            const messages = await StatisticsVoiceHelper.getDBData(client, guildId, days);
            return StatisticsVoiceHelper.processVoiceActivity(client, guildId, messages, days);
        } catch (error) {
            logger.error(`getLastNDaysActivity: Error retrieving activity data for guild ${guildId}, Error: ${error}`);
            return null;
        }
    }

    private static processVoiceActivity(client: CustomClient, guildId: Snowflake, activities: VoiceActivity[], days: number): DailyUserActivity {
        const dailyActivity: DailyUserActivity = {};
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

        // Pre-seed empty arrays for each day
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateKey = StatisticsVoiceHelper.formatDate(d);
            dailyActivity[dateKey] = {};
        }

        activities.forEach((activity: VoiceActivity) => {
            const joinDate = new Date(Number(activity.tsjoin));
            const dateKey = StatisticsVoiceHelper.formatDate(joinDate);
            const user = client.guilds.cache.get(guildId)?.members.cache.get(activity.userid)?.user.displayName ?? 'Unknown';

            const duration = Number(activity.length) / 1000 / 60; // Convert to minutes

            if (!dailyActivity[dateKey][user]) {
                dailyActivity[dateKey][user] = 0;
            }

            dailyActivity[dateKey][user] += duration;
        });

        // Convert minutes to hours and round to 2 decimal places
        Object.keys(dailyActivity).forEach((date) => {
            Object.keys(dailyActivity[date]).forEach((userId) => {
                dailyActivity[date][userId] = Number((dailyActivity[date][userId] / 60).toFixed(2));
            });
        });

        return dailyActivity;
    }

    public static async getActivityPerChannelLastNDays(client: CustomClient, guildId: Snowflake, days: number = 30): Promise<DailyUserActivity | null> {
        try {
            const activities = await StatisticsVoiceHelper.getDBData(client, guildId, days);
            return StatisticsVoiceHelper.processVoiceActivityPerChannel(client, guildId, activities, days);
        } catch (error) {
            logger.error(`getActivityPerChannelLastNDays: Error retrieving activity data for guild ${guildId}, Error: ${error}`);
            return null;
        }
    }

    private static processVoiceActivityPerChannel(client: CustomClient, guildId: Snowflake, activities: VoiceActivity[], days: number): DailyUserActivity {
        const dailyChannelActivity: DailyUserActivity = {};
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

        // Pre-seed empty objects for each day
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateKey = StatisticsVoiceHelper.formatDate(d);
            dailyChannelActivity[dateKey] = {};
        }

        activities.forEach((activity: VoiceActivity) => {
            const joinDate = new Date(Number(activity.tsjoin));
            const dateKey = StatisticsVoiceHelper.formatDate(joinDate);
            const channelId = activity.channel;
            const channelName = client.guilds.cache.get(guildId)?.channels.cache.get(channelId)?.name ?? 'Unknown Channel';

            const duration = Number(activity.length) / 1000 / 60 / 60; // Convert to hours

            if (!dailyChannelActivity[dateKey][channelName]) {
                dailyChannelActivity[dateKey][channelName] = 0;
            }

            dailyChannelActivity[dateKey][channelName] += duration;
        });

        // Round to 2 decimal places
        Object.keys(dailyChannelActivity).forEach((date) => {
            Object.keys(dailyChannelActivity[date]).forEach((channelName) => {
                dailyChannelActivity[date][channelName] = Number(dailyChannelActivity[date][channelName].toFixed(2));
            });
        });

        return dailyChannelActivity;
    }

    // public static async getActivityPerChannelLastNDays(guildId: string, client: CustomClient, days: number = 30) {}

    // public static async getActivityPerUserLastNDays(guildId: string, client: CustomClient, days: number = 30) {}

    // public static async getActivityHeatmap(guildId: string, client: CustomClient, days: number = 30) {}

    private static async getDBData(client: CustomClient, guildId: string, days: number) {
        // TODO: Implement end days
        const nDaysAgo: Date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const messages = await client.statisticsWrapper.voiceActivity.getVoiceStatistics(guildId, nDaysAgo, new Date());

        if (!messages || !messages) {
            throw new Error('Error retrieving activity data');
        }
        return messages;
    }

    private static formatDate(date: Date): string {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
}
