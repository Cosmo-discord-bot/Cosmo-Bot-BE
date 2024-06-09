import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../interfaces/common/ICommand';

const ping: ICommand = {
    data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
    execute: async (interaction: CommandInteraction) => {
        await interaction.reply('Pong!');
    },
};

module.exports = ping;
