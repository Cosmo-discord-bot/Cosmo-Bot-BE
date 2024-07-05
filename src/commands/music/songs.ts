import { ICommand } from '../../interfaces/common/ICommand'
import { BaseEmbed, ErrorEmbed } from '../../helper/embeds'
import { useHistory, useQueue } from 'discord-player'
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
} from 'discord.js'

const songs: ICommand = {
    data: {
        name: 'songs',
        description: 'Display songs from the queue or history.',
        options: ['queue', 'history'].map((type) => ({
            type: ApplicationCommandOptionType.Subcommand,
            name: type,
            description: `Display songs from the ${type}.`,
            options: [
                {
                    name: 'page',
                    description:
                        'Specify the page number to view (default: 1).',
                    type: ApplicationCommandOptionType.Number,
                    required: false,
                    min_value: 1,
                },
            ],
        })),
        category: 'music',
        queueOnly: true,
        validateVC: true,
    },

    execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return

        const queue = useQueue(interaction.guildId)

        if (!queue) {
            return interaction.reply({
                ephemeral: true,
                embeds: [ErrorEmbed('There is no queue in this server.')],
            })
        }
        const history = useHistory(interaction.guildId)

        if (!history) {
            return interaction.reply({
                ephemeral: true,
                embeds: [ErrorEmbed('There is no history in this server.')],
            })
        }

        const type = interaction.options.getSubcommand()
        const songsdata =
            type === 'history' ? history.tracks.data : queue.tracks.data
        const songsLength = songsdata.length

        if (!songsLength) {
            return interaction.reply({
                ephemeral: true,
                embeds: [ErrorEmbed(`There are no songs in the ${type}.`)],
            })
        }

        let page = interaction.options.getNumber('page', false) ?? 1
        const multiple = 10
        const maxPage = Math.ceil(songsLength / multiple)

        if (page > maxPage) page = maxPage

        const end = page * multiple
        const start = end - multiple
        const tracks = songsdata.slice(start, end)

        const embed = BaseEmbed()
            .setDescription(
                tracks
                    .map(
                        (track, i) =>
                            `${start + i + 1} - [${track.title}](${
                                track.url
                            }) ~ [${track.requestedBy?.toString()}]`
                    )
                    .join('\n')
            )
            .setFooter({
                text: `Page ${page} of ${maxPage} | Showing songs ${
                    start + 1
                } to ${
                    end > songsLength ? songsLength : end
                } of ${songsLength}`,
                iconURL: interaction.user.displayAvatarURL(),
            })

        return interaction.reply({ ephemeral: true, embeds: [embed] })
    },
}

module.exports = songs
