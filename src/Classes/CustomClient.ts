import { Client, ClientOptions, Collection } from 'discord.js';
import { ping_slash } from '../commands/ping';
import { Command } from '../interfaces/Command';
import { Config } from '../startup/Config/Config';
import { MongoDB } from '../db';
import { ConfigModel } from '../interfaces/ConfigModel';
import { logger } from '../logger/pino';

export class CustomClient extends Client {
    commands: Collection<string, Command>;
    config: Config | undefined;
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

            const confModel: ConfigModel = {
                guildId: '123',
                prefix: '!',
                color: '#FF0000',
                mainChannel: '123',
            };

            await this.config.loadConfig();
            // await config.insertNewConfig(confModel);
        } catch (e) {
            logger.error(e);
        }
    }
}
