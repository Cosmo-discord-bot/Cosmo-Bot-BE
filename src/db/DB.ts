import 'dotenv/config';
import mongoose, { Connection } from 'mongoose';
import { logger } from '../logger/pino';

export class MongoDB {
    public connection: Connection | null;

    constructor() {
        this.connection = null;
    }

    public async connect(): Promise<void> {
        try {
            this.connection = await mongoose.createConnection(`mongodb://${process.env.DB_URL!}/${process.env.DB_NAME!}`, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            } as mongoose.ConnectOptions);
            logger.info('Connected to MongoDB');
        } catch (error) {
            logger.error('Error connecting to MongoDB:', error);
        }
    }

    public disconnect(): void {
        if (this.connection) {
            this.connection.close();
            console.log('Disconnected from MongoDB');
        }
    }
}
