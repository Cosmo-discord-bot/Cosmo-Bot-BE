import { ErrorEmbed, SuccessEmbed } from '../../helper/embeds'
import { ICommand } from '../../interfaces/common/ICommand'
import { useQueue } from 'discord-player'
import { ChatInputCommandInteraction } from 'discord.js'

const pause: ICommand = {
    data: {
        name: 'pause',
        description: 'Pause the playback',
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

        if (queue.node.isPaused())
            return interaction.reply({
                ephemeral: true,
                embeds: [ErrorEmbed('The playback is already paused.')],
            })

        queue.node.pause()

        return interaction.reply({
            embeds: [SuccessEmbed('Paused the playback.')],
        })
    },
}

module.exports = pause
