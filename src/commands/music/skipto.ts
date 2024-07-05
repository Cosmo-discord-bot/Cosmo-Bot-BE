import { ErrorEmbed, SuccessEmbed } from '../../helper/embeds'
import { ICommand } from '../../interfaces/common/ICommand'
import { useQueue } from 'discord-player'
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js'

const skip: ICommand = {
    data: {
        name: 'skipto',
        description: 'Skip to the given song, removing others on the way',
        options: [
            {
                type: ApplicationCommandOptionType.Number,
                name: 'position',
                description: 'The position of the song to skip to',
                required: true,
                minValue: 1,
            },
        ],
        category: 'music',
        queueOnly: true,
        validateVC: true,
    },
    execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return
        if (!interaction.guildId) return

        const queue = useQueue(interaction.guildId!)

        if (!queue || queue.isEmpty())
            return interaction.reply({
                ephemeral: true,
                embeds: [ErrorEmbed('The queue has no song to skip to.')],
            })

        const position = interaction.options.getNumber('position', true)

        if (position > queue.size)
            interaction.reply({
                ephemeral: true,
                embeds: [ErrorEmbed('The provided position is not valid.')],
            })

        queue.node.skipTo(position - 1)

        return interaction.reply({
            embeds: [SuccessEmbed(`Skipped to the ${position} song.`)],
        })
    },
}

module.exports = skip
