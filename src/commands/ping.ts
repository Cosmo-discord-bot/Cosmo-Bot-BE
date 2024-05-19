import { CommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../interfaces/ICommand';

export const ping = (message: Message): void => {
    message.reply('Pong!');
};

export const ping_slash: ICommand = {
    data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
    async execute(interaction: CommandInteraction) {
        await interaction.reply('Pong!');
    },
};
