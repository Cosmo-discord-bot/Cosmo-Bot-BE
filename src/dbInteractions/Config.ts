import { ConfigModel } from '../interfaces/ConfigModel';
import mongoose, { Connection } from 'mongoose';
import { logger } from '../logger/pino';
import { Collection } from 'discord.js';

export class Config {
    private readonly model: mongoose.Model<ConfigModel>;
    private readonly collection: string = 'Configs';
    private connection: Connection;
    public configs: Collection<string, ConfigModel>;

    constructor(connection: Connection) {
        this.connection = connection;
        const configSchema: mongoose.Schema<ConfigModel> = new mongoose.Schema<ConfigModel>({
            guildId: { type: String, required: true },
            prefix: { type: String, required: true },
            color: { type: String, required: true },
            mainChannel: { type: String, required: true },
        });
        this.model = this.connection.model<ConfigModel>(
            this.collection,
            configSchema,
            this.collection
        );

        this.configs = new Collection<string, ConfigModel>();
    }

    public async loadConfig(): Promise<void> {
        const configs_obj: ConfigModel[] = await this.model.find({}).lean();
        for (const conf of configs_obj) {
            this.configs.set(conf.guildId, conf);
        }
    }

    public async insertNewConfig(config: ConfigModel): Promise<void> {
        await this.model.create(config);
    }
}
