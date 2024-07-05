export interface IVoiceActivity {
    tsJoin: number;
    tsLeave: number;
    userId: string;
    channelId: string;
    active: boolean;
}

export interface IGuildVoiceActivity {
    guildId: string;
    activities: IVoiceActivity[];
}
