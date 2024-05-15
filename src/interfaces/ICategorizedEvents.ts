import { GuildScheduledEvent } from 'discord.js';
import { IEvent } from './IEvent';

export interface ICategorizedEvents {
    create: GuildScheduledEvent[];
    update: GuildScheduledEvent[];
    delete: IEvent[];
}
