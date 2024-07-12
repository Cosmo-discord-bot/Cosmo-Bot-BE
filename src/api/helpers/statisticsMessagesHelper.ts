import { logger } from '../../logger/pino';
import { CustomClient } from '../../Classes/CustomClient';
import { IGuildMessageActivity } from '../../interfaces/statistics/IMessageActivity';

export class StatisticsMessagesHelper {
    public static async getActivityLastNDays(guildId: string, client: CustomClient, days: number = 30) {
        try {
            const messages = await StatisticsMessagesHelper.getDBData(days, guildId, client);
            const dailyCounts: { [date: string]: number } = {};

            for (let i = 0; i <= days; i++) {
                const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
                const formattedDate = StatisticsMessagesHelper.formatDate(date);
                dailyCounts[formattedDate] = 0;
            }

            messages.activities.forEach((activity) => {
                const date: string = StatisticsMessagesHelper.formatDate(new Date(activity.ts));
                dailyCounts[date] += 1;
            });
            return dailyCounts;
        } catch (error) {
            logger.error(`getLastNDaysActivity: Error retrieving activity data for guild ${guildId}, Error: ${error}`);
            return null;
        }
    }

    public static async getActivityPerChannelLastNDays(guildId: string, client: CustomClient, days: number = 30) {
        try {
            const messages = await StatisticsMessagesHelper.getDBData(days, guildId, client);
            const channelsCount: { [id: string]: { name: string; count: number } } = {};

            messages.activities.forEach((activity) => {
                if (!channelsCount[activity.channelId]) {
                    const channelName = client.guilds.cache.get(guildId)?.channels.cache.find((channel) => channel.id == activity.channelId)?.name ?? 'Unknown';
                    channelsCount[activity.channelId] = {
                        name: channelName,
                        count: 1,
                    };
                } else {
                    channelsCount[activity.channelId].count += 1;
                }
            });
            return channelsCount;
        } catch (error) {
            logger.error(`getActivityPerChannelLastNDays: Error retrieving activity data for guild ${guildId}, Error: ${error}`);
            return null;
        }
    }

    public static async getActivityPerUserLastNDays(guildId: string, client: CustomClient, days: number = 30) {
        try {
            const messages = await StatisticsMessagesHelper.getDBData(days, guildId, client);
            const usersCount: { [id: string]: { name: string; count: number } } = {};

            messages.activities.forEach((activity) => {
                if (!usersCount[activity.userId]) {
                    const userName = client.guilds.cache.get(guildId)?.members.cache.find((member) => member.id == activity.userId)?.displayName ?? 'Unknown';
                    usersCount[activity.userId] = {
                        name: userName,
                        count: 1,
                    };
                } else {
                    usersCount[activity.userId].count += 1;
                }
            });
            return usersCount;
        } catch (error) {
            logger.error(`getActivityPerChannelLastNDays: Error retrieving activity data for guild ${guildId}, Error: ${error}`);
            return null;
        }
    }

    private static async getDBData(days: number, guildId: string, client: CustomClient) {
        // TODO: Implement end days
        const nDaysAgo: Date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const messages: IGuildMessageActivity | null = await client.statisticsWrapper.messageActivity.getMessageActivity(guildId, nDaysAgo, new Date());

        if (!messages || !messages.activities) {
            throw new Error('Error retrieving activity data');
        }
        return messages;
    }

    private static formatDate(date: Date): string {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
}
