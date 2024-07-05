import { ErrorEmbed, SuccessEmbed } from '../../helper/embeds'
import { ICommand } from '../../interfaces/common/ICommand'
import { useQueue } from 'discord-player'
import { ChatInputCommandInteraction } from 'discord.js'

const skip: ICommand = {
    data: {
        name: 'skip',
        description: 'Skip to the next song',
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

        queue.node.skip()

        return interaction.reply({
            embeds: [SuccessEmbed('Skipped to the next song.')],
        })
    },
}

module.exports = skip
