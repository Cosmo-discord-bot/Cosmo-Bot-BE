import { ErrorEmbed, SuccessEmbed } from '../../helper/embeds'
import { ICommand } from '../../interfaces/common/ICommand'
import { useQueue } from 'discord-player'
import { ChatInputCommandInteraction } from 'discord.js'

const shuffle: ICommand = {
    data: {
        name: 'shuffle',
        description: 'Shuffle the queue.',
        category: 'music',
        queueOnly: true,
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

        const mode = queue.toggleShuffle()

        return interaction.reply({
            embeds: [SuccessEmbed(`${mode ? 'Enabled' : 'Disabled'} shuffle mode.`)],
        })
    },
}

module.exports = shuffle
