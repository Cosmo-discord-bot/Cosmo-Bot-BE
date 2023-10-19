import { CommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { Command } from '../interfaces/Command';
import { logger } from '../logger/pino';
import { ConfigModel } from '../interfaces/ConfigModel';

export const prefix = (message: Message): void => {
    const prefixRegex: RegExp = new RegExp('^[a-z!@#$%^&*()_+-=]{1,4}$');
    try {
        let newPrefixMatch: RegExpMatchArray | null = message.content.match('\\s+([^\\s]+)');
        if (!newPrefixMatch) throw new Error('Prefix: Prefix is missing');

        let newPrefix: string = newPrefixMatch[0].split(' ')[1];

        if (!prefixRegex.test(newPrefix)) {
            throw new Error(`Prefix: Prefix is wrong`);
        }

        const config: ConfigModel = message.client.config.configs.find(
            (config: ConfigModel): boolean => config.guildId === message.guildId
        )!;
        config.prefix = newPrefix;
        message.client.config.updateConfig(config).then(() => message.client.config.loadConfig());
        message.reply(`Prefix: Changed to ${newPrefix}`);
    } catch (error) {
        logger.error(`Prefix: Prefix is wrong - ${message.content}`);
    }
};

export const prefix_slash: Command = {
    data: new SlashCommandBuilder().setName('prefix').setDescription('Change prefix for commands'),
    async execute(interaction: CommandInteraction) {
        await interaction.reply('Pong!');
    },
};
