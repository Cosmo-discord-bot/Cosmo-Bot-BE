import { EventHandler } from '../../controllers/EventHandler';

export interface IEventHandler {
    [guildId: string]: EventHandler;
}
