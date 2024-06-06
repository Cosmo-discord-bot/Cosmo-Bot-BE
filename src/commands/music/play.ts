import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { ICommand } from '../../interfaces/common/ICommand';

const play: ICommand = {
    data: {
        name: 'play',
        description: 'Play music',
        option: [
            {
                name: 'song',
                description: 'The song you want to play',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },
    execute: async (interaction: CommandInteraction) => {
        await interaction.reply('Playing!');
    },
};

module.exports = play;
