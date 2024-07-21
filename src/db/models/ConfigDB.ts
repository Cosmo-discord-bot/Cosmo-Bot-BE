import { IConfig } from '../../interfaces/common/IConfig';
import mongoose, { Connection } from 'mongoose';
import { logger } from '../../logger/pino';
import { Collection } from 'discord.js';
import { configSchema } from '../schemas/ConfigSchema';

export class ConfigDB {
    private readonly model: mongoose.Model<IConfig>;
    private readonly collection: string = 'Configs';
    private connection: Connection;
    public configs: Collection<string, IConfig>;

    constructor(connection: Connection) {
        this.connection = connection;
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

    public async updateConfig(config: Partial<IConfig>): Promise<void> {
        try {
            const { guildId, ...updateFields } = config;
            const response: mongoose.UpdateWriteOpResult = await this.model.updateOne({ guildId: guildId }, { $set: updateFields }, { upsert: true });
            if (!response.acknowledged) throw new Error('updateConfig: Config updating failed');
            logger.debug('Config updated successfully:', response);
        } catch (error) {
            logger.error(`updateConfig: Config updating failed - ${config.guildId}`, error);
            throw error;
        }
    }
}
