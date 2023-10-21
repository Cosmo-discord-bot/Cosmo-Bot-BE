import { Message } from 'discord.js';
import { getSecondArgumentFromText } from '../../helper/getSecondArgumentFromText';
import { SetEnum } from '../../enums/setEnum';
import { setMainChannel } from './setMainChannel';
import { setPrefix } from './setPrefix';
import { logger } from '../../logger/pino';

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
        }
    } catch (error) {
        logger.error('setRouter: Something went wrong - general error');
    }
};
