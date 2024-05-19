import { ping_slash } from '../commands/ping';
import { CustomClient } from '../Classes/CustomClient';
import { Interaction } from 'discord.js';

export const SetSlashCommands = (client: CustomClient): void => {
    client.commands.set(ping_slash.data.name, ping_slash);
};

export const HandleSlashCommands = async (interaction: Interaction): Promise<void> => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            });
        }
    }
};
