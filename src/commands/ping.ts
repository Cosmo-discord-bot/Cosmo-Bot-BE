import { CommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { Command } from '../interfaces/Command';

export const ping = (message: Message): void => {
    message.reply('Pong!');
};

export const ping_slash: Command = {
    data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
    async execute(interaction: CommandInteraction) {
        await interaction.reply('Pong!');
    },
};
