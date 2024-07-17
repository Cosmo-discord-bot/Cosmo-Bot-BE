import { logger } from '../../logger/pino';
import { CustomClient } from '../../Classes/CustomClient';

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
    public static async getActivityLastNDays(client: CustomClient, guildId: string, days: number = 30) {
        try {
            const messages = await StatisticsVoiceHelper.getDBData(client, guildId, days);
            return StatisticsVoiceHelper.processVoiceActivity(messages, days);
        } catch (error) {
            logger.error(`getLastNDaysActivity: Error retrieving activity data for guild ${guildId}, Error: ${error}`);
            return null;
        }
    }

    private static processVoiceActivity(activities: VoiceActivity[], days: number): DailyUserActivity {
        const dailyActivity: DailyUserActivity = {};
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

        // Pre-seed empty arrays for each day
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateKey = StatisticsVoiceHelper.formatDate(d);
            dailyActivity[dateKey] = {};
        }

        activities.forEach((activity) => {
            const joinDate = new Date(Number(activity.tsjoin));
            const dateKey = StatisticsVoiceHelper.formatDate(joinDate);
            const userId = activity.userid;
            const duration = Number(activity.length) / 1000 / 60; // Convert to minutes

            if (!dailyActivity[dateKey][userId]) {
                dailyActivity[dateKey][userId] = 0;
            }

            dailyActivity[dateKey][userId] += duration;
        });

        // Convert minutes to hours and round to 2 decimal places
        Object.keys(dailyActivity).forEach((date) => {
            Object.keys(dailyActivity[date]).forEach((userId) => {
                dailyActivity[date][userId] = Number((dailyActivity[date][userId] / 60).toFixed(2));
            });
        });

        return dailyActivity;
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
