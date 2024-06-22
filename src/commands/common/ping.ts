import { CommandInteraction } from 'discord.js';
import { ICommand } from '../../interfaces/common/ICommand';

const ping: ICommand = {
    data: {
        name: 'ping',
        description: 'Replies with Pong!',
    },
    execute: async (interaction: CommandInteraction) => {
        await interaction.reply('Pong!');
    },
};

module.exports = ping;
