import { Collection } from 'discord.js';
import { EventsDB } from '../dbInteractions/EventsDB';

declare module 'discord.js' {
    export interface Client {
        commands: Collection<String, any>;
        config: ConfigDB;
        events: EventsDB;
    }
}
