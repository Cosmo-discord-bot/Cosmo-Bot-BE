import { z } from 'zod';

export const configurationSchema = z.object({
    guildId: z.string().min(1, 'Guild ID is required'),
    prefix: z.string().min(1, 'Prefix is required'),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color'),
    mainChannelId: z.string().min(1, 'Main channel ID is required'),
    rolesChannelId: z.string().min(1, 'Roles channel ID is required'),
    eventsGroupId: z.string().min(1, 'Events group ID is required'),
});

export type IConfig = z.infer<typeof configurationSchema>;
