import { Collection } from 'discord.js';
import { EventsDB } from '../db/models/EventsDB';
import { ConfigDB } from '../db/models/ConfigDB';
import { StatisticsWrapper } from '../Classes/StatisticsWrapper';
import { Player } from 'discord-music-player';

declare module 'discord.js' {
    export interface Client {
        commands: Collection<String, any>;
        config: ConfigDB;
        events: EventsDB;
        statisticsWrapper: StatisticsWrapper;
        player: Player;
    }
}
