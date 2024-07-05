import { ApplicationCommandOptionType, ChannelType, ChatInputCommandInteraction, GuildBasedChannel, Snowflake } from 'discord.js'
import { ICommand } from '../../interfaces/common/ICommand'
import { IConfig } from '../../interfaces/common/IConfig'
import { logger } from '../../logger/pino'

const set: ICommand = {
    data: {
        name: 'set',
        description: 'Set various bot configurations',
        options: [
            {
                name: 'mainchannel',
                description: 'Set the main channel',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'channel',
                        description: 'The main channel to set',
                        type: ApplicationCommandOptionType.Channel,
                        required: true,
                    },
                ],
            },
        ],
    },
    execute: async (interaction: ChatInputCommandInteraction) => {
        try {
            const subcommand: string | null = interaction.options.getSubcommand()
            if (!subcommand) {
                throw new Error('No subcommand provided')
            }

            if (subcommand === 'mainchannel') {
                const channel = interaction.options.getChannel('channel')
                if (!channel || channel.type !== ChannelType.GuildText) {
                    await interaction.reply({
                        content: 'Please provide a valid text channel.',
                        ephemeral: true,
                    })
                    return
                }
                setMainchannel(channel.id, interaction)
            }
            /*
            else if (subcommand === 'prefix') {

                const prefix = interaction.options.getString('prefix');
                if (!prefix) {
                    await interaction.reply({ content: 'Please provide a valid prefix.', ephemeral: true });
                    return;
                }
                setPrefix(prefix, interaction);
            }
             */
        } catch (error) {
            if (error == 'No subcommand provided') {
                await interaction.reply({
                    content: 'Please provide a subcommand.',
                    ephemeral: true,
                })
                return
            }
            console.error(error)
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            })
        }
    },
}

const setPrefix = (prefix: string, interaction: ChatInputCommandInteraction): void => {
    const prefixRegex: RegExp = new RegExp('^[a-z!@#$%^&*()_+-=]{1,4}$')
    try {
        if (!prefixRegex.test(prefix)) {
            throw new Error(`setPrefix: Wrong prefix`)
        }

        const config: IConfig = interaction.client.config.configs.find((config: IConfig): boolean => config.guildId === interaction.guildId)!
        config.prefix = prefix
        interaction.client.config.updateConfig(config).then(() => interaction.client.config.loadConfig())
        interaction.reply(`setPrefix: Changed to ${prefix}`)
        logger.info(`setPrefix: Changed to ${prefix}`)
    } catch (error) {
        if (error instanceof Error) {
            interaction.reply(error.message)
            logger.error(error.message)
            return
        }
        interaction.reply('setPrefix: Something went wrong - general error')
        logger.error('setPrefix: Something went wrong - general error')
    }
}

const setMainchannel = (mainchannel: Snowflake, interaction: ChatInputCommandInteraction): void => {
    //const mainChannelRegex: RegExp = new RegExp('^\\d{17,19}$');
    try {
        const config: IConfig = interaction.client.config.configs.find((config: IConfig): boolean => config.guildId === interaction.guildId)!

        const channel: GuildBasedChannel | null = interaction.guild!.channels.resolve(mainchannel)
        if (!channel) throw new Error('setMainChannel: channel id does not exist')

        config.mainChannelId = mainchannel
        interaction.client.config.updateConfig(config).then(() => interaction.client.config.loadConfig())
        interaction.reply(`setMainChannel: Changed to <#${mainchannel}>`)
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`${error.message}`)
            interaction.reply(error.message)
            return
        }
        interaction.reply('setMainChannel: Something went wrong - general error')
        logger.error('setMainChannel: Something went wrong - general error')
    }
}

module.exports = set
