require("dotenv").config();

import { Client, Partials, GatewayIntentBits } from 'discord.js';
import { router } from "./router";


const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildScheduledEvents, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.GuildScheduledEvent, Partials.GuildMember]
});

client.once("ready", () => console.log("Ready!"));
client.on("messageCreate", (message) => router(message));

client.login(process.env.DISCORD_TOKEN);
