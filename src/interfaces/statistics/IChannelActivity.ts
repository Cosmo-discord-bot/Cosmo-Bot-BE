export interface IChannelActivityMetaData {
    guildId: string
    channelId: string
    type: 'ADDITION' | 'REMOVAL'
}
export interface IGuildChannelActivity {
    name: string
    timestamp: Date
    metadata: IChannelActivityMetaData
}
