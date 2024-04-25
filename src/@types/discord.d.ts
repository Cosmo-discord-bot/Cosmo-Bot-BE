import { Collection } from 'discord.js';
import { Config } from '../dbInteractions/Config';

declare module 'discord.js' {
    export interface Client {
        commands: Collection<String, any>;
        config: Config;
    }
}
