import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder, VoiceBasedChannel } from 'discord.js';
import { ICommand } from '../../interfaces/common/ICommand';
import { logger } from '../../logger/pino';
import { BaseEmbed, ErrorEmbed } from '../../helper/embeds';
import { Player, Playlist, QueryType, SearchQueryType, useMainPlayer } from 'discord-player';
import playerOptions from '../../config/playerOptions';

const play: ICommand = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Play music')
        .addStringOption(option =>
            option.setName('query').setDescription('The song you want to play').setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('source')
                .setDescription('The source to search from')
                .addChoices([
                    { name: 'YouTube', value: QueryType.YOUTUBE },
                    { name: 'Spotify', value: QueryType.SPOTIFY_SEARCH },
                    { name: 'Auto', value: QueryType.AUTO_SEARCH },
                ])
                .setRequired(false)
        ),
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.member || !(interaction.member instanceof GuildMember)) {
            await interaction.reply({
                content: 'This command can only be used within a server and by a member.',
                ephemeral: true,
            });
            return;
        }

        const query: string = interaction.options.getString('query', true);
        const searchEngine: SearchQueryType =
            (interaction.options.getString('source', false) as SearchQueryType) ?? QueryType.AUTO_SEARCH;
        const player: Player = useMainPlayer();

        try {
            await interaction.deferReply();
            const channel: VoiceBasedChannel | null = interaction.member.voice.channel;
            if (!channel) {
                // make sure we have a voice channel
                interaction.reply({ embeds: [ErrorEmbed('You need to be in a voice channel to play music!')] });
                throw new Error('User not connected to a voice channel');
            }

            const result = await player.search(query, {
                searchEngine,
                requestedBy: interaction.user,
            });

            if (!result.hasTracks())
                interaction.editReply({
                    embeds: [ErrorEmbed(`No results found for \`${query}\`.`)],
                });

            const { queue, track, searchResult } = await player.play(channel, result, {
                nodeOptions: {
                    metadata: interaction,
                    ...playerOptions,
                },
                requestedBy: interaction.user,
                connectionOptions: { deaf: true },
            });

            const embed = BaseEmbed().setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.member.displayAvatarURL(),
            });

            if (searchResult.playlist) {
                const playlist: Playlist = searchResult.playlist;
                embed
                    .setAuthor({
                        name: `Playlist queued - ${playlist.tracks.length} tracks.`,
                    })
                    .setTitle(playlist.title)
                    .setURL(playlist.url)
                    .setThumbnail(playlist.thumbnail);

                queue.addTrack(searchResult.playlist);
                queue.node.play();
            } else {
                embed
                    .setAuthor({
                        name: `Track queued - Position ${queue.node.getTrackPosition(track) + 1}`,
                    })
                    .setTitle(track.title)
                    .setURL(track.url)
                    .setThumbnail(track.thumbnail);
                queue.node.play(track);
            }

            interaction.editReply({ embeds: [embed] }).catch(console.error);
        } catch (e) {
            // let's return error if something failed
            logger.error(e);
            interaction.editReply({
                embeds: [ErrorEmbed(`Something went wrong while playing \`${query}\``)],
            });
        }
    },
};

module.exports = play;
