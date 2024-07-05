import {
    ApplicationCommandOptionType,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    VoiceBasedChannel,
} from 'discord.js'
import { ICommand } from '../../interfaces/common/ICommand'
import { BaseEmbed, ErrorEmbed } from '../../helper/embeds'
import { Player, useMainPlayer } from 'discord-player'
import playerOptions from '../../config/playerOptions'

const play: ICommand = {
    data: {
        name: 'play',
        description: 'Play music.',
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: 'query',
                description: 'The name or url of the song, you want to play.',
                required: true,
                minLength: 1,
                maxLength: 256,
            },
        ],
        category: 'music',
        queueOnly: true,
        validateVC: true,
    },
    async suggest(interaction: AutocompleteInteraction) {
        const query = interaction.options.getString('query', false)?.trim()
        if (!query) return

        const player = useMainPlayer()
        const searchResult = await player.search(query).catch(() => null)
        await interaction.respond([{ name: 'No results found', value: '' }])
        if (!searchResult) {
            return
        }

        const tracks =
            searchResult.hasPlaylist() && searchResult.playlist
                ? searchResult.playlist.tracks.slice(0, 24)
                : searchResult.tracks.slice(0, 10)

        const formattedResult = tracks.map((track) => ({
            name: track.title,
            value: track.url,
        }))

        if (searchResult.hasPlaylist() && searchResult.playlist) {
            formattedResult.unshift({
                name: `Playlist | ${searchResult.playlist.title}`,
                value: searchResult.playlist.url,
            })
        }

        return interaction.respond(formattedResult)
    },

    execute: async (interaction: ChatInputCommandInteraction) => {
        if (!interaction.inCachedGuild()) return

        const query: string = interaction.options.getString('query', true)
        const player: Player = useMainPlayer()
        const channel: VoiceBasedChannel = interaction.member.voice
            .channel as VoiceBasedChannel

        await interaction.deferReply()

        const result = await player.search(query, {
            requestedBy: interaction.user,
        })

        if (!result.hasTracks())
            return interaction.editReply({
                embeds: [ErrorEmbed(`No results found for \`${query}\`.`)],
            })

        try {
            const { queue, track, searchResult } = await player.play(
                channel,
                result,
                {
                    nodeOptions: {
                        metadata: interaction,
                        ...playerOptions,
                    },
                    requestedBy: interaction.user,
                    connectionOptions: { deaf: true },
                }
            )

            const embed = BaseEmbed().setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.member.displayAvatarURL(),
            })

            if (searchResult.hasPlaylist() && searchResult.playlist) {
                const playlist = searchResult.playlist
                embed
                    .setAuthor({
                        name: `Playlist queued - ${playlist.tracks.length} tracks.`,
                    })
                    .setTitle(playlist.title)
                    .setURL(playlist.url)
                    .setThumbnail(playlist.thumbnail)
            } else {
                embed
                    .setAuthor({
                        name: `Track queued - Position ${
                            queue.node.getTrackPosition(track) + 1
                        }`,
                    })
                    .setTitle(track.title)
                    .setURL(track.url)
                    .setThumbnail(track.thumbnail)
            }

            return interaction
                .editReply({ embeds: [embed] })
                .catch(console.error)
        } catch (e) {
            console.error(e)
            return interaction.editReply({
                embeds: [
                    ErrorEmbed(
                        `Something went wrong while playing \`${query}\``
                    ),
                ],
            })
        }
    },
}

module.exports = play
