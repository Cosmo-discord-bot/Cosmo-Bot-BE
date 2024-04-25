import { IConfig } from '../interfaces/IConfig';
import mongoose, { Connection } from 'mongoose';
import { logger } from '../logger/pino';
import { Collection } from 'discord.js';

export class ConfigDB {
    private readonly model: mongoose.Model<IConfig>;
    private readonly collection: string = 'Configs';
    private connection: Connection;
    public configs: Collection<string, IConfig>;

    constructor(connection: Connection) {
        this.connection = connection;
        const configSchema: mongoose.Schema<IConfig> = new mongoose.Schema<IConfig>({
            guildId: { type: String, required: true },
            prefix: { type: String, required: true },
            color: { type: String, required: true },
            mainChannelId: { type: String, required: true },
            rolesChannelId: { type: String, required: true },
            eventsGroupId: { type: String, required: true },
        });
        this.model = this.connection.model<IConfig>(this.collection, configSchema, this.collection);

        this.configs = new Collection<string, IConfig>();
    }

    public async loadConfig(): Promise<void> {
        const configObj: IConfig[] = await this.model.find({}).lean();
        for (const conf of configObj) {
            this.configs.set(conf.guildId, conf);
        }
    }

    public async insertNewConfig(config: IConfig): Promise<void> {
        await this.model.create(config);
    }

    public async updateConfig(config: IConfig): Promise<void> {
        try {
            let response: mongoose.UpdateWriteOpResult = await this.model.replaceOne(
                { guildId: config.guildId },
                config
            );
            if (!response.acknowledged) throw new Error('updateConfig: Config updating failed');
        } catch (error) {
            logger.error(`updateConfig: Config updating failed - ${config.guildId}`);
        }
    }
}
