import { GuildScheduledEvent } from 'discord.js';

export interface ICategorizedEvents {
    create: GuildScheduledEvent[];
    update: GuildScheduledEvent[];
    delete: GuildScheduledEvent[];
}
