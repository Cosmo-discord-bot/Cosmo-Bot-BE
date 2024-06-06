import { ApplicationCommandOption, CommandInteraction } from 'discord.js';

export interface ICommand {
    data: {
        name: string;
        description: string;
        type?: number;
        option?: ApplicationCommandOption[];
    };
    execute(interaction: CommandInteraction): Promise<void>;
}
