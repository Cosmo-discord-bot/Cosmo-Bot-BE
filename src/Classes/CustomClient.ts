import {Client, ClientOptions, Collection} from "discord.js";
import {ping_slash} from "../commands/ping";

export class CustomClient extends Client {

    commands:Collection<string, any>;
    constructor(options: ClientOptions) {
        super(options);
        this.commands = new Collection();
        this.loadCommands();
    }

    private loadCommands():void {
        this.commands.set(ping_slash.data.name, ping_slash);
    }
}