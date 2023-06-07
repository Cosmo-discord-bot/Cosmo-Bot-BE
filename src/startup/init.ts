import {Client} from "discord.js";
import {MongoDB} from "../db/index";
export const __init__ = (client: Client): void => {
    let db:MongoDB = new MongoDB();
    db.connect();
}