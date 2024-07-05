import { ICommand } from '../../interfaces/common/ICommand'
import { ErrorEmbed, SuccessEmbed } from '../../helper/embeds'
import { useQueue } from 'discord-player'
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
} from 'discord.js'

const jump: ICommand = {
    data: {
        name: 'jump',
        description:
            'Jump to specific song on the queue without removing others',
        options: [
            {
                name: 'position',
                description: 'The position of the song to jump to',
                type: ApplicationCommandOptionType.Number,
                required: true,
                minValue: 1,
            },
        ],
        category: 'music',
        queueOnly: true,
        validateVC: true,
    },

    execute(interaction: ChatInputCommandInteraction) {
        const queue = useQueue(interaction.guildId!)

        if (!queue || queue.isEmpty())
            return interaction.reply({
                ephemeral: true,
                embeds: [ErrorEmbed('The queue is empty.')],
            })

        const position = interaction.options.getNumber('position', true)

        if (position > queue.size)
            return interaction.reply({
                ephemeral: true,
                embeds: [ErrorEmbed('The provided position is not valid.')],
            })

        queue.node.jump(position - 1)

        return interaction.reply({
            embeds: [SuccessEmbed(`Jumped to the ${position} song.`)],
        })
    },
}

module.exports = jump
