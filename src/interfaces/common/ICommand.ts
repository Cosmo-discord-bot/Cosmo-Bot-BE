import { ApplicationCommandOption, CommandInteraction } from 'discord.js';

export interface ICommand {
    data: {
        name: string;
        description: string;
        autocomplete?: boolean;
        option?: ApplicationCommandOption[];
    };
    execute(interaction: CommandInteraction): Promise<void>;
}
