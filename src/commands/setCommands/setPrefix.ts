import { CommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../interfaces/ICommand';
import { logger } from '../../logger/pino';
import { IConfig } from '../../interfaces/IConfig';
import { Common } from '../../helper/Common';

export const setPrefix = (message: Message): void => {
    const prefixRegex: RegExp = new RegExp('^[a-z!@#$%^&*()_+-=]{1,4}$');
    try {
        const messageArguments: RegExpMatchArray | null = message.content.match('(?:\\S+\\s+)([\\s\\S]+)');
        if (!messageArguments) throw new Error('setPrefix: No arguments');

        let newPrefix: string = Common.getSecondArgumentFromText(messageArguments[1]);

        if (!prefixRegex.test(newPrefix)) {
            throw new Error(`setPrefix: Wrong prefix`);
        }

        const config: IConfig = message.client.config.configs.find(
            (config: IConfig): boolean => config.guildId === message.guildId
        )!;
        config.prefix = newPrefix;
        message.client.config.updateConfig(config).then(() => message.client.config.loadConfig());
        message.reply(`setPrefix: Changed to ${newPrefix}`);
    } catch (error) {
        if (error instanceof Error) {
            message.reply(error.message);
            logger.error(error.message);
            return;
        }
        message.reply('setPrefix: Something went wrong - general error');
        logger.error('setPrefix: Something went wrong - general error');
    }
};

export const prefix_slash: ICommand = {
    data: new SlashCommandBuilder().setName('prefix').setDescription('Change prefix for commands'),
    async execute(interaction: CommandInteraction) {
        await interaction.reply('Pong!');
    },
};
