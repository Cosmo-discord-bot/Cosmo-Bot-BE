import { GuildBasedChannel, Message } from 'discord.js';
import { logger } from '../../logger/pino';
import { IConfig } from '../../interfaces/IConfig';
import { getSecondArgumentFromText } from '../../helper/getSecondArgumentFromText';

export const setRolesChannel = (message: Message): void => {
    const snowflakeMatch: RegExp = new RegExp('^\\d{17,19}$');
    try {
        const messageArguments: RegExpMatchArray | null =
            message.content.match('(?:\\S+\\s+)([\\s\\S]+)');
        if (!messageArguments) throw new Error('setRolesChannel: No arguments');

        const rolesChannel: string = getSecondArgumentFromText(messageArguments[1]);

        if (!snowflakeMatch.test(rolesChannel)) {
            throw new Error(`setRolesChannel: invalid channel id`);
        }

        const config: IConfig = message.client.config.configs.find(
            (config: IConfig): boolean => config.guildId === message.guildId
        )!;

        const channel: GuildBasedChannel | null = message.guild!.channels.resolve(rolesChannel);
        if (!channel) throw new Error('setRolesChannel: channel id does not exist');

        config.rolesChannelId = rolesChannel;
        message.client.config.updateConfig(config).then(() => message.client.config.loadConfig());
        message.reply(`setRolesChannel: Changed to <#${rolesChannel}>`);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`${error.message}`);
            message.reply(error.message);
            return;
        }
        message.reply('setRolesChannel: Something went wrong - general error');
        logger.error('setRolesChannel: Something went wrong - general error');
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
