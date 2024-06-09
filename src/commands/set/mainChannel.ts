import { ApplicationCommandOptionType, GuildBasedChannel, Message } from 'discord.js';
import { logger } from '../../logger/pino';
import { IConfig } from '../../interfaces/common/IConfig';
import { Common } from '../../helper/Common';

export const mainChannel = (message: Message): void => {
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

//const play: ICommand = {
//    data: {
//        name: 'set',
//        description: 'Play music',
//        option: [
//            {
//                name: 'song',
//                description: 'The song you want to play',
//                type: ApplicationCommandOptionType.String,
//                required: true,
//            },
//        ],
//    },
//    execute: async (interaction: CommandInteraction) => {
//        await interaction.reply('Playing!');
//    },
//};
//
//module.exports = play;
