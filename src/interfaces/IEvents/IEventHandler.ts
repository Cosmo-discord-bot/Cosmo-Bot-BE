import { EventHandler } from '../../features/EventHandler';

export interface IEventHandler {
    [guildId: string]: EventHandler;
}
