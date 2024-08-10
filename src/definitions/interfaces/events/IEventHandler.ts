import { EventController } from '../../../controllers/EventController';

export interface IEventHandler {
    [guildId: string]: EventController;
}
