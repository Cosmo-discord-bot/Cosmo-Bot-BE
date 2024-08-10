import { ICommand } from '../../definitions/interfaces/common/ICommand';
import { ErrorEmbed, SuccessEmbed } from '../../helper/embeds';
import { useQueue } from 'discord-player';
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';

const replay: ICommand = {
    data: {
        name: 'replay',
        description: 'Jump to specific song on the queue without removing others',
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
        const queue = useQueue(interaction.guildId!);

        if (!queue || queue.isEmpty())
            return interaction.reply({
                ephemeral: true,
                embeds: [ErrorEmbed('The queue is empty.')],
            });

        if (!queue.currentTrack) {
            return interaction.reply({
                ephemeral: true,
                embeds: [ErrorEmbed('There is no song currently playing.')],
            });
        }

        queue.node.seek(0);

        return interaction.reply({
            embeds: [SuccessEmbed('Replaying the current song.')],
        });
    },
};

module.exports = replay;
