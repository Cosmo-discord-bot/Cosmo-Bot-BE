import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { ICommand } from '../../interfaces/common/ICommand';
import { InfoEmbed, SuccessEmbed } from '../../helper/embeds';
import { useQueue } from 'discord-player';

const volume: ICommand = {
    data: {
        name: 'volume',
        description: 'Adjust the volume of the music player.',
        options: [
            {
                name: 'level',
                description: 'The volume level to set (0-100).',
                type: ApplicationCommandOptionType.Number,
                required: false,
                minValue: 0,
                maxValue: 100,
            },
        ],
        category: 'music',
        queueOnly: true,
        validateVC: true,
    },

    execute(interaction: ChatInputCommandInteraction) {
        const queue = useQueue(interaction.guildId!);
        const level = interaction.options.getNumber('level', false);

        if (!queue) {
            return interaction.reply({
                ephemeral: true,
                embeds: [InfoEmbed('There is no queue in this server.')],
            });
        }

        if (!level) {
            return interaction.reply({
                ephemeral: true,
                embeds: [InfoEmbed(`Current volume level is ${queue.node.volume}%.`)],
            });
        }

        queue.node.setVolume(level);

        return interaction.reply({
            embeds: [SuccessEmbed(`Volume has been set to ${level}%.`)],
        });
    },
};

module.exports = volume;
