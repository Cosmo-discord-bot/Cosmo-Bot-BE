import { Collection, Message } from 'discord.js';
import { logger } from './logger/pino';

import { CommandsEnum } from './enums/CommandsEnum';
import { IConfig } from './interfaces/common/IConfig';
import * as commands from './commands/common';

export const router = (message: Message, guildConfigs: Collection<string, IConfig>): void => {
    let config: IConfig = guildConfigs.get(message.guildId!)!;
    if (message.author.bot || !message.content.startsWith(config.prefix)) return;

    let args: string[] = message.content.slice(config.prefix.length).trim().split(/ +/g);
    let command: string = args[0].toLowerCase();
    logger.info(`${message.guildId} ${message.content}`);
    switch (command) {
        case CommandsEnum.Ping:
            commands.ping(message);
            break;
        case CommandsEnum.Set:
            commands.setRouter(message);
            break;
    }
};
