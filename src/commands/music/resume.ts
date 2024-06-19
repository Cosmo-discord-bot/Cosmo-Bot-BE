import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder, VoiceBasedChannel } from 'discord.js';
import { ICommand } from '../../interfaces/common/ICommand';
import { useQueue } from 'discord-player';
import { ErrorEmbed, InfoEmbed } from '../../helper/embeds';

const stop: ICommand = {
    data: new SlashCommandBuilder().setName('resume').setDescription('Resume playing music'),
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const queue = useQueue(interaction.guildId ?? '');
        const member: GuildMember = interaction.member as GuildMember;
        const channel: VoiceBasedChannel | null = member.voice?.channel;
        if (!channel) {
            interaction.reply({ embeds: [ErrorEmbed('You need to join a voice channel first.')] });
            return;
        }
        /*
        if (!channel.viewable) {
            interaction.reply({ embeds: [ErrorEmbed('I need `View Channel` permission.')] });
            return;
        }
        if (!channel.joinable) {
            interaction.reply({ embeds: [ErrorEmbed('I need `Connect Channel` permission.')] });
            return;
        }
        if (channel.full) {
            interaction.reply({ embeds: [ErrorEmbed("Can't join, the voice channel is full.")] });
            return;
        }
        */
        if (!queue) {
            await interaction.reply({ ephemeral: true, embeds: [ErrorEmbed('No music is being played!')] });
            return;
        }
        if (queue.node.isPaused()) {
            queue.node.resume();
            interaction.reply({ embeds: [InfoEmbed('Resumed playing music!')] });
            return;
        }
        interaction.reply({ embeds: [InfoEmbed('Music is already playing!')] });
    },
};

module.exports = stop;
