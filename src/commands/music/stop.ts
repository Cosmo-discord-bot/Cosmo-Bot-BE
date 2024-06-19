import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../interfaces/common/ICommand';
import { useQueue } from 'discord-player';
import { InfoEmbed } from '../../helper/embeds';

const stop: ICommand = {
    data: new SlashCommandBuilder().setName('stop').setDescription('Stop playing music and leave the voice channel'),
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const queue = useQueue(interaction.guildId ?? '');
        if (!queue) {
            await interaction.reply('No music is being played!');
            return;
        }

        if (queue.node.isPlaying()) {
            queue.delete();
            await interaction.reply({
                embeds: [InfoEmbed('Stopped playing music!')],
            });
        }
    },
};

module.exports = stop;
