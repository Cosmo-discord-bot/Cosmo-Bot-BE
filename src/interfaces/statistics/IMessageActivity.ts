export interface IMessageActivity {
    ts: number
    channelId: string
    userId: string
}
export interface IGuildMessageActivity {
    guildId: string
    activities: IMessageActivity[]
}
