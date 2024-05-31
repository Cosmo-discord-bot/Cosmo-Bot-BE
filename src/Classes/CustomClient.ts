import { Client, ClientOptions, Collection } from 'discord.js';
import { ping_slash } from '../commands/ping';
import { ICommand } from '../interfaces/ICommand';
import { ConfigDB } from '../dbInteractions/ConfigDB';
import { MongoDB } from '../db';
import { logger } from '../logger/pino';
import { EventsDB } from '../dbInteractions/EventsDB';
import { StatisticsWrapper } from './StatisticsWrapper';

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
