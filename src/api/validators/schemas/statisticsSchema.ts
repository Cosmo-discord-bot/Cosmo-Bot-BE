import { z } from 'zod';

export const statisticsSchema = z.object({
    guildId: z.string().regex(/^\d{17,19}$/),
    days: z.optional(z.number().int().positive().max(365)),
    // Add more fields as needed
});

export type IStatistics = z.infer<typeof statisticsSchema>;
