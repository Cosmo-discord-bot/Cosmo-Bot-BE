import { ICommand } from '../../interfaces/common/ICommand';
import { ErrorEmbed, SuccessEmbed } from '../../helper/embeds';
import { useQueue } from 'discord-player';
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';

const stop: ICommand = {
    data: {
        name: 'stop',
        description: 'Stop the playback.',
        category: 'music',
        queueOnly: true,
        validateVC: true,
    },

    execute(interaction: ChatInputCommandInteraction) {
        const queue = useQueue(interaction.guildId!);
        if (!queue) {
            return interaction.reply({
                ephemeral: true,
                embeds: [ErrorEmbed('There is no queue in this server.')],
            });
        }

        queue.node.stop();

        return interaction.reply({
            embeds: [SuccessEmbed('Stopped the playback.')],
        });
    },
};

module.exports = stop;
