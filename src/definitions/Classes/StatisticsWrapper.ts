import { MessageActivityDB } from '../../db/models/MessageActivityDB';
import { VoiceActivityDB } from '../../db/models/VoiceActivityDB';
import { Connection } from 'mongoose';
import { ChannelActivityDB } from '../../db/models/ChannelActivityDB';

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
