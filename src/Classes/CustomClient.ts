import { Client, ClientOptions, Collection, REST, Routes } from 'discord.js';
import { ICommand } from '../interfaces/common/ICommand';
import { ConfigDB } from '../db/models/ConfigDB';
import { MongoDB } from '../db/DB';
import { logger } from '../logger/pino';
import { EventsDB } from '../db/models/EventsDB';
import { StatisticsWrapper } from './StatisticsWrapper';
import { Player } from 'discord-music-player';
import * as path from 'node:path';
import * as fs from 'node:fs';

export class CustomClient extends Client {
    commands: Collection<string, ICommand>;
    config!: ConfigDB;
    events!: EventsDB;
    statisticsWrapper!: StatisticsWrapper;

    constructor(options: ClientOptions) {
        super(options);

        this.commands = new Collection();
        this.loadCommands();
    }

    private loadCommands(): void {
        this.commands.set(ping_slash.data.name, ping_slash);
    }

    public async __initClient__(): Promise<void> {
        try {
            let db: MongoDB = new MongoDB();
            await db.connect();
            this.config = new ConfigDB(db.connection!);
            await this.config.loadConfig();

            this.events = new EventsDB(db.connection!);
            await this.events.loadEvents();

            this.statisticsWrapper = new StatisticsWrapper(db.connection!);
        } catch (e) {
            logger.error(e);
        }
    }
}
