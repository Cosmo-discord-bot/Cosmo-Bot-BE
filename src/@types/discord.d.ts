import { Collection } from 'discord.js';
import { ConfigDB } from '../dbInteractions/ConfigDB';
import { EventHandler } from '../commands/EventHandler';

declare module 'discord.js' {
    export interface Client {
        commands: Collection<String, any>;
        config: ConfigDB;
    }
    export interface Guild {
        config: ConfigDB;
        eventHandlers: EventHandler;
    }
}
