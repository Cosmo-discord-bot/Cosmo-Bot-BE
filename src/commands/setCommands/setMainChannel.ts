import { CommandInteraction, GuildBasedChannel, Message, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { logger } from '../../logger/pino';
import { ConfigModel } from '../../interfaces/ConfigModel';
import { getSecondArgumentFromText } from '../../helper/getSecondArgumentFromText';

export const setMainChannel = (message: Message): void => {
    const mainChannelRegex: RegExp = new RegExp('^\\d{17,19}$');
    try {
        const messageArguments: RegExpMatchArray | null =
            message.content.match('(?:\\S+\\s+)([\\s\\S]+)');
        if (!messageArguments) throw new Error('setMainChannel: No arguments');

        const mainChannel: string = getSecondArgumentFromText(messageArguments[1]);

        if (!mainChannelRegex.test(mainChannel)) {
            throw new Error(`setMainChannel: invalid channel id`);
        }

        const config: ConfigModel = message.client.config.configs.find(
            (config: ConfigModel): boolean => config.guildId === message.guildId
        )!;

        const channel: GuildBasedChannel | null = message.guild!.channels.resolve(mainChannel);
        if (!channel) throw new Error('setMainChannel: channel id does not exist');

        config.mainChannel = mainChannel;
        message.client.config.updateConfig(config).then(() => message.client.config.loadConfig());
        message.reply(`setMainChannel: Changed to <#${mainChannel}>`);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`${error.message}`);
            message.reply(error.message);
            return;
        }
        message.reply('setMainChannel: Something went wrong - general error');
        logger.error('setMainChannel: Something went wrong - general error');
    }
};

/*
export const prefix_slash: Command = {
    data: new SlashCommandBuilder().setName('setMainChannel').setDescription('Change setMainChannel for commands'),
    async execute(interaction: CommandInteraction) {
        await interaction.reply('Pong!');
    },
};
*/
