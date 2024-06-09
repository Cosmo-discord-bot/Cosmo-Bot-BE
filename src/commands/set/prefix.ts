import { ApplicationCommandOptionType, CommandInteraction, Message } from 'discord.js';
import { ICommand } from '../../interfaces/common/ICommand';
import { logger } from '../../logger/pino';
import { IConfig } from '../../interfaces/common/IConfig';
import { Common } from '../../helper/Common';

const prefix = (message: Message): void => {
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

const setPrefix: ICommand = {
    data: {
        name: 'setprefix',
        description: 'Set the bot command prefix',
        option: [
            {
                name: 'prefix',
                description: 'The new prefix to set',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },
    execute: async (interaction: CommandInteraction) => {
        try {
            // @ts-ignore
            const prefix = interaction.options.getString('prefix');

            const prefixRegex: RegExp = new RegExp('^[a-z!@#$%^&*()_+-=]{1,4}$');
            if (!prefixRegex.test(prefix)) {
                throw new Error(`Wrong prefix`);
            }
            const config: IConfig = interaction.client.config.configs.find(
                (config: IConfig): boolean => config.guildId === interaction.guildId
            )!;
            config.prefix = prefix;
            interaction.client.config.updateConfig(config).then(() => interaction.client.config.loadConfig());

            await interaction.reply(`Prefix set to ${prefix}`);
        } catch (error) {
            if (error == 'Wrong prefix') {
                await interaction.reply('setPrefix: Wrong prefix');
                logger.error('setPrefix: Wrong prefix');
                return;
            } else if (error instanceof Error) {
                logger.error(`${error.message}`);
                await interaction.reply(error.message);
                return;
            }
            await interaction.reply('setPrefix: Something went wrong - general error');
            logger.error('setPrefix: Something went wrong - general error');
        }
    },
};

module.exports = setPrefix;
