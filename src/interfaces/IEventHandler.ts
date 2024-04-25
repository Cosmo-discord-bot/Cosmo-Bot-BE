import { EventHandler } from '../commands/EventHandler';

export interface IEventHandler {
    [guildId: string]: EventHandler;
}
