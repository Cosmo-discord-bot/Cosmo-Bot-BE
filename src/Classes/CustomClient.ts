import { Client, ClientOptions, Collection } from 'discord.js';
import { ping_slash } from '../commands/ping';
import { Command } from '../interfaces/Command';
import { Config } from '../dbInteractions/Config';
import { MongoDB } from '../db';
import { logger } from '../logger/pino';

export class CustomClient extends Client {
    commands: Collection<string, Command>;
    config!: Config;
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
            this.config = new Config(db.connection!);
            await this.config.loadConfig();
        } catch (e) {
            logger.error(e);
        }
    }
}
