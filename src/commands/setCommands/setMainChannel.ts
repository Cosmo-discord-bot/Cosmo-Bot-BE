import { GuildBasedChannel, Message } from 'discord.js';
import { logger } from '../../logger/pino';
import { IConfig } from '../../interfaces/IConfig';
import { Common } from '../../helper/Common';

export const setMainChannel = (message: Message): void => {
    const mainChannelRegex: RegExp = new RegExp('^\\d{17,19}$');
    try {
        const messageArguments: RegExpMatchArray | null = message.content.match('(?:\\S+\\s+)([\\s\\S]+)');
        if (!messageArguments) throw new Error('setMainChannel: No arguments');

        const mainChannel: string = Common.getSecondArgumentFromText(messageArguments[1]);

        if (!mainChannelRegex.test(mainChannel)) {
            throw new Error(`setMainChannel: invalid channel id`);
        }

        const config: IConfig = message.client.config.configs.find(
            (config: IConfig): boolean => config.guildId === message.guildId
        )!;

        const channel: GuildBasedChannel | null = message.guild!.channels.resolve(mainChannel);
        if (!channel) throw new Error('setMainChannel: channel id does not exist');

        config.mainChannelId = mainChannel;
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
