import { Collection } from 'discord.js';
import { EventsDB } from '../dbInteractions/EventsDB';
import { ConfigDB } from '../dbInteractions/ConfigDB';

declare module 'discord.js' {
    export interface Client {
        commands: Collection<String, any>;
        config: ConfigDB;
        events: EventsDB;
    }
}
