import {Message} from "discord.js";

export const ping = (message: Message):void => {
    message.reply("Pong!");
}