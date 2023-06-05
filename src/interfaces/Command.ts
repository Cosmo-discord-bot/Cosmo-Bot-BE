import {ApplicationCommandOption, CommandInteraction} from "discord.js";

export interface Command {
    data: {
        name: string,
        description: string,
        type?: number,
        option?: ApplicationCommandOption[]
    },
    execute (interaction: CommandInteraction): Promise<void>
}