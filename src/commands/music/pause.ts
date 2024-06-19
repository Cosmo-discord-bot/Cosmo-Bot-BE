import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../interfaces/common/ICommand';
import { useQueue } from 'discord-player';
import { InfoEmbed } from '../../helper/embeds';

const stop: ICommand = {
    data: new SlashCommandBuilder().setName('pause').setDescription('Pause playing music'),
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const queue = useQueue(interaction.guildId ?? '');
        if (!queue) {
            await interaction.reply('No music is being played!');
            return;
        }

        if (!queue.node.isPaused()) {
            queue.node.pause();
            interaction.reply({ embeds: [InfoEmbed('Paused playing music!')] });
            return;
        }
        interaction.reply({ embeds: [InfoEmbed('Music is already paused!')] });
    },
};

module.exports = stop;
