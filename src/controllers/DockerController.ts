import Docker from 'dockerode';
import { logger } from '../logger/pino';

export class DockerController {
    private docker: Docker;

    constructor() {
        try {
            this.docker = new Docker({
                socketPath: '/var/run/docker.sock',
            });
        } catch (error) {
            console.error('Error initializing Docker:', error);
            throw error;
        }
    }

    public async getImages() {
        try {
            const images = await this.docker.listImages();
            images.map((image) => {
                logger.warn(`Image: ${image.Id}`);
            });
            // return images;
        } catch (error) {
            logger.error('Error getting images:', error);
            return error;
        }
    }

    public async getRunningContainers() {
        try {
            const containers = await this.docker.listContainers();
            containers.map((container) => {
                logger.warn(`Container: ${container.Names.toString()}`);
            });
            // return containers;
        } catch (error) {
            logger.error('Error getting containers:', error);
            return error;
        }
    }

    public async createCompilerContainer() {
        try {
            const container = await this.docker.createContainer({
                Image: 'compiler',
                Cmd: ['node', 'index.js'],
                name: 'compiler',
            });
            logger.warn(`Container: ${container.id} created`);
            // return container;
        } catch (error) {
            logger.error('Error creating container:', error);
            return error;
        }
    }
}
