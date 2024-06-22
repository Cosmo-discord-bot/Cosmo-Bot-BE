import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    VoiceBasedChannel,
} from 'discord.js';
import { ICommand } from '../../interfaces/common/ICommand';
import { logger } from '../../logger/pino';
import { ErrorEmbed } from '../../helper/embeds';
import { Playlist, useMainPlayer } from 'discord-player';
import playerOptions from '../../config/playerOptions';

const play: ICommand = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music')
        .addStringOption(option =>
            option.setName('query').setDescription('The song you want to play').setRequired(true).setAutocomplete(true)
        ),

    async suggest(interaction: AutocompleteInteraction) {
        const query = interaction.options.getString('query', false)?.trim();
        if (!query) return;

        const player = useMainPlayer();
        const searchResult = await player.search(query).catch(() => null);
        await interaction.respond([{ name: 'No results found', value: '' }]);
        if (!searchResult) {
            return;
        }

        const tracks =
            searchResult.hasPlaylist() && searchResult.playlist
                ? searchResult.playlist.tracks.slice(0, 24)
                : searchResult.tracks.slice(0, 10);

        const formattedResult = tracks.map(track => ({
            name: track.title,
            value: track.url,
        }));

        if (searchResult.hasPlaylist() && searchResult.playlist) {
            formattedResult.unshift({
                name: `Playlist | ${searchResult.playlist.title}`,
                value: searchResult.playlist.url,
            });
        }

        logger.info(formattedResult);
        return interaction.respond(formattedResult);
    },
    execute: async (interaction: ChatInputCommandInteraction) => {
        if (!interaction.inCachedGuild()) return;
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel!;
        const query = interaction.options.getString('query', true);

        await interaction.deferReply();

        const result = await player.search(query, {
            requestedBy: interaction.user,
        });
        const queue = player.nodes.create(channel as VoiceBasedChannel, playerOptions);

        if (!result.hasTracks()) {
            const embed = ErrorEmbed('No results found');
            interaction.editReply({ embeds: [embed] });
            return;
        }

        if (result.hasPlaylist()) {
            const playlist = result.playlist as Playlist;
            queue.addTrack(playlist);
        } else {
            queue.addTrack(result.tracks);
        }
        logger.info(queue);
        queue.node.play();
    },
};

module.exports = play;
