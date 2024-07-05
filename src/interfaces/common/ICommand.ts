import {
    ApplicationCommandOption,
    AutocompleteInteraction,
    CommandInteraction,
    InteractionResponse,
    Message,
} from 'discord.js'

export interface ICommand {
    data: {
        name: string
        description: string
        autocomplete?: boolean
        options?: ApplicationCommandOption[]
        category?: string
        queueOnly?: boolean
        validateVC?: boolean
    }
    suggest?(interaction: AutocompleteInteraction): Promise<void>
    execute(
        interaction: CommandInteraction
    ): Promise<Message<true> | InteractionResponse<true> | void> | undefined
}
