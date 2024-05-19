import { Message } from 'discord.js';
import { getSecondArgumentFromText } from '../../helper/getSecondArgumentFromText';
import { SetEnum } from '../../enums/SetEnum';
import { setMainChannel } from './setMainChannel';
import { setPrefix } from './setPrefix';
import { logger } from '../../logger/pino';
import { setRolesChannel } from './setRolesChannel';

export const setRouter = (message: Message): void => {
    try {
        const setOption: string = getSecondArgumentFromText(message.content);

        switch (setOption) {
            case SetEnum.Prefix:
                setPrefix(message);
                break;
            case SetEnum.MainChannel:
                setMainChannel(message);
                break;
            case SetEnum.RolesChannel:
                setRolesChannel(message);
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
