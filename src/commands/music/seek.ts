import { BaseEmbed, ErrorEmbed, SuccessEmbed } from '../../helper/embeds'
import { ICommand } from '../../interfaces/common/ICommand'
import { useQueue } from 'discord-player'
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js'

const seek: ICommand = {
    data: {
        name: 'seek',
        description: 'Seek to a specific timestamp in the current track.',
        options: [
            {
                name: 'timestamp',
                description: 'The timestamp to seek to (in seconds).',
                type: ApplicationCommandOptionType.Number,
                required: true,
                minValue: 0,
            },
        ],
        category: 'music',
        queueOnly: true,
        validateVC: true,
    },
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return
        if (!interaction.guildId) return

        const queue = useQueue(interaction.guildId!)

        if (!queue) {
            return interaction.reply({
                ephemeral: true,
                embeds: [BaseEmbed('There is no queue in this server.')],
            })
        }
        const timestamp = interaction.options.getNumber('timestamp', true) * 1000

        if (!queue.currentTrack) {
            return interaction.reply({
                ephemeral: true,
                embeds: [ErrorEmbed('There is no song currently playing.')],
            })
        }

        if (timestamp > queue.currentTrack.durationMS) {
            return interaction.reply({
                ephemeral: true,
                embeds: [ErrorEmbed(`Please provide a valid timestamp within 0 and ${queue.currentTrack.durationMS / 1000}.`)],
            })
        }

        await interaction.deferReply()

        await queue.node.seek(timestamp)

        return interaction.editReply({
            embeds: [SuccessEmbed(`Seeked to ${timestamp}.`)],
        })
    },
}

module.exports = seek
