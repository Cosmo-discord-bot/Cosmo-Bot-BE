import { Message } from "discord.js";
import { logger } from "./logger/pino";

import { CommandsEnum } from "./enums/commands-enum";
import { ping } from "./commands";

const prefix_length:number = 1;
export const router = (message: Message ):void => {
    let args:string[] = message.content.slice(prefix_length).trim().split(/ +/g);
    let command:string = args[0].toLowerCase();

    logger.debug(command)
    switch (command){
        case CommandsEnum.Ping: ping(message);
    }
}