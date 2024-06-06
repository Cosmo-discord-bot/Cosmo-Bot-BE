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
    player!: Player;

    constructor(options: ClientOptions) {
        super(options);

        this.commands = new Collection();
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

            await this.loadCommands();
            this.registerCommand();
        } catch (e) {
            logger.error(e);
        }
    }

    public async loadCommands(): Promise<void> {
        const foldersPath: string = path.join(__dirname, '..', 'commands');
        const commandFolders: string[] = fs.readdirSync(foldersPath);

        for (const folder of commandFolders) {
            const commandsPath: string = path.join(foldersPath, folder);
            const commandFiles: string[] = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath: string = path.join(commandsPath, file);
                const command: ICommand = require(filePath) as ICommand;
                if ('data' in command && 'execute' in command) {
                    this.commands.set(command.data.name, command);
                } else {
                    logger.warn(
                        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
                    );
                }
            }
        }
    }

    public async registerCommand(): Promise<void> {
        const token: string | undefined = process.env.DISCORD_TOKEN;
        const clientId: string | undefined = process.env.DISCORD_APPLICATION_ID;
        if (!token || !clientId) {
            logger.error('Token or Client ID not found');
            throw 'Token or Client ID not found';
        }
        let commands = this.commands.map(command => command.data);
        const rest: REST = new REST({ version: '10' }).setToken(token);
        //for (const command of this.commands.values()) {
        for (const guildId of this.config.configs.keys()) {
            logger.info(`Registering commands in guild ${guildId}`);
            await rest
                .put(Routes.applicationGuildCommands(clientId, guildId), {
                    body: commands,
                })
                .catch(err => {
                    console.log(err);
                });
        }
        //}
    }
}
