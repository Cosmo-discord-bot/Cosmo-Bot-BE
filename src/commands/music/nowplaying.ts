import { BaseEmbed } from '../../helper/embeds';
import { ICommand } from '../../interfaces/common/ICommand';
import { useQueue } from 'discord-player';
import { ChatInputCommandInteraction } from 'discord.js';

const nowplaying: ICommand = {
    data: {
        name: 'nowplaying',
        description: 'Show the current playing song',
        category: 'music',
        queueOnly: true,
    },
    execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        if (!interaction.guildId) return;

        const queue = useQueue(interaction.guildId!);

        if (!queue) {
            return interaction.reply({
                ephemeral: true,
                embeds: [BaseEmbed('There is no queue in this server.')],
            });
        }
        const track = queue.currentTrack;

        if (!track) {
            return interaction.reply({
                ephemeral: true,
                embeds: [BaseEmbed('There is no song playing.')],
            });
        }

        const embed = BaseEmbed()
            .setAuthor({ name: 'Nowplaying 🎵' })
            .setTitle(track.title)
            .setURL(track.url)
            .setThumbnail(track.thumbnail)
            .setDescription(`Played by: ${track.requestedBy!.toString()}\n\n${queue.node.createProgressBar()}`);

        return interaction.reply({ ephemeral: true, embeds: [embed] });
    },
};

module.exports = nowplaying;
