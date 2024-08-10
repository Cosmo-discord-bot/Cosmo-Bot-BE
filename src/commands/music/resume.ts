import { ErrorEmbed, SuccessEmbed } from '../../helper/embeds';
import { ICommand } from '../../definitions/interfaces/common/ICommand';
import { useQueue } from 'discord-player';
import { ChatInputCommandInteraction } from 'discord.js';

const resume: ICommand = {
    data: {
        name: 'resume',
        description: 'Resume the playback',
        category: 'music',
        queueOnly: true,
        validateVC: true,
    },
    execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        if (!interaction.guildId) return;

        const queue = useQueue(interaction.guildId!);

        if (!queue || queue.isEmpty())
            return interaction.reply({
                ephemeral: true,
                embeds: [ErrorEmbed('The queue has no song to skip to.')],
            });

        if (queue.node.isPlaying())
            return interaction.reply({
                ephemeral: true,
                embeds: [ErrorEmbed('The playback is not paused.')],
            });

        queue.node.resume();

        return interaction.reply({
            embeds: [SuccessEmbed('Resumed the playback.')],
        });
    },
};

module.exports = resume;
