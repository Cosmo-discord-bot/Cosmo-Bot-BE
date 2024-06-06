import { Message } from 'discord.js';
import { SetEnum } from '../../enums/SetEnum';
import { mainChannel } from './mainChannel';
import { prefix } from './prefix';
import { logger } from '../../logger/pino';
import { rolesChannel } from './rolesChannel';
import { Common } from '../../helper/Common';

export const setRouter = (message: Message): void => {
    try {
        const setOption: string = Common.getSecondArgumentFromText(message.content);

        switch (setOption) {
            case SetEnum.Prefix:
                prefix(message);
                break;
            case SetEnum.MainChannel:
                mainChannel(message);
                break;
            case SetEnum.RolesChannel:
                rolesChannel(message);
                break;
            default:
                throw new Error('setRouter: setting does not exist');
        }
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
            message.reply(error.message);
            return;
        }
        message.reply('setRouter: Something went wrong - general error');
        logger.error('setRouter: Something went wrong - general error');
    }
};
