import { MessageActivityDB } from '../dbInteractions/MessageActivityDB';
import { VoiceActivityDB } from '../dbInteractions/VoiceActivityDB';
import { Connection } from 'mongoose';
import { ChannelActivityDB } from '../dbInteractions/ChannelActivityDB';

export class StatisticsWrapper {
    public voiceActivity: VoiceActivityDB;
    public messageActivity: MessageActivityDB;
    public channelActivity: ChannelActivityDB;

    constructor(connection: Connection) {
        this.voiceActivity = new VoiceActivityDB(connection);
        this.messageActivity = new MessageActivityDB(connection);
        this.channelActivity = new ChannelActivityDB(connection);
    }
}
