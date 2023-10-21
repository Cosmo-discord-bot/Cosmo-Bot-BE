import { CommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { logger } from '../../logger/pino';
import { ConfigModel } from '../../interfaces/ConfigModel';
import { getSecondArgumentFromText } from '../../helper/getSecondArgumentFromText';

export const setPrefix = (message: Message): void => {
    const prefixRegex: RegExp = new RegExp('^[a-z!@#$%^&*()_+-=]{1,4}$');
    try {
        const messageArguments: RegExpMatchArray | null =
            message.content.match('(?:\\S+\\s+)([\\s\\S]+)');
        if (!messageArguments) throw new Error('setPrefix: No arguments');

        let newPrefix: string = getSecondArgumentFromText(messageArguments[1]);

        if (!prefixRegex.test(newPrefix)) {
            throw new Error(`setPrefix: Wrong prefix`);
        }

        const config: ConfigModel = message.client.config.configs.find(
            (config: ConfigModel): boolean => config.guildId === message.guildId
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

export const prefix_slash: Command = {
    data: new SlashCommandBuilder().setName('prefix').setDescription('Change prefix for commands'),
    async execute(interaction: CommandInteraction) {
        await interaction.reply('Pong!');
    },
};