/*
export class Events {
    private readonly model: mongoose.Model<ConfigModel>;
    private readonly collection: string = 'Configs';
    private connection: Connection;
    public configs: Collection<string, ConfigModel>;

    constructor(connection: Connection) {
        this.connection = connection;
        const configSchema: mongoose.Schema<ConfigModel> = new mongoose.Schema<ConfigModel>({});
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

    public async updateConfig(config: ConfigModel): Promise<void> {
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
*/
