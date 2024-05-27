import { MessageActivityDB } from '../dbInteractions/MessageActivityDB';
import { VoiceActivityDB } from '../dbInteractions/VoiceActivityDB';
import { Connection } from 'mongoose';

export class StatisticsWrapper {
    public voiceActivity: VoiceActivityDB;
    public messageActivity: MessageActivityDB;

    constructor(connection: Connection) {
        this.voiceActivity = new VoiceActivityDB(connection);
        this.messageActivity = new MessageActivityDB(connection);
    }
}
