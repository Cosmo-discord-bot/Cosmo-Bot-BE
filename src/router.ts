import { Collection, Message } from 'discord.js';
import { logger } from './logger/pino';

import { CommandsEnum } from './enums/commands-enum';
import { ConfigModel } from './interfaces/ConfigModel';
import { ping, prefix } from './commands';

export const router = (message: Message, guildConfigs: Collection<string, ConfigModel>): void => {
    let config: ConfigModel = guildConfigs.get(message.guildId!)!;
    if (message.author.bot || !message.content.startsWith(config.prefix)) return;

    let args: string[] = message.content.slice(config.prefix.length).trim().split(/ +/g);
    let command: string = args[0].toLowerCase();
    logger.info(`${message.guildId} ${message.content}`);
    switch (command) {
        case CommandsEnum.Ping:
            ping(message);
            break;
        case CommandsEnum.Prefix:
            prefix(message);
            break;
    }
};
