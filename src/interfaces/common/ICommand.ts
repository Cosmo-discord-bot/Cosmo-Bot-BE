import { ApplicationCommandOption, AutocompleteInteraction, CommandInteraction } from 'discord.js';

export interface ICommand {
    data: {
        name: string;
        description: string;
        autocomplete?: boolean;
        option?: ApplicationCommandOption[];
    };
    suggest?(interaction: AutocompleteInteraction): Promise<void>;
    execute(interaction: CommandInteraction): Promise<void>;
}
