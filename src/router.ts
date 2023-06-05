import { Message } from "discord.js";
import { logger } from "./logger/pino";

import { CommandsEnum } from "./enums/commands-enum";
import { ping } from "./commands";

const prefix = "!"
export const router = (message: Message ):void => {

    if (message.author.bot || !message.content.startsWith(prefix)) return;

    let args:string[] = message.content.slice(prefix.length).trim().split(/ +/g);
    let command:string = args[0].toLowerCase();
    logger.info(message.content)
    switch (command){
        case CommandsEnum.Ping: ping(message);
    }
}