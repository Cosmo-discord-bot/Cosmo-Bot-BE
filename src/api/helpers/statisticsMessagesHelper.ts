import { logger } from '../../logger/pino';
import { CustomClient } from '../../Classes/CustomClient';
import { IGuildMessageActivity } from '../../interfaces/statistics/IMessageActivity';

export class StatisticsMessagesHelper {
    public static async getActivityLastNDays(guildId: string, client: CustomClient, days: number = 30) {
        try {
            // TODO: Implement end days
            const nDaysAgo: Date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            const messages: IGuildMessageActivity | null = await client.statisticsWrapper.messageActivity.getMessageActivity(guildId, nDaysAgo, new Date());

            if (!messages || !messages.activities) {
                throw new Error('Error retrieving activity data');
            }

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

    private static formatDate(date: Date): string {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
}
