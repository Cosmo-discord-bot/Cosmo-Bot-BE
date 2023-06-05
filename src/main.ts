
require("dotenv").config();
import { logger } from "./logger/pino";
import { Partials, GatewayIntentBits, Events } from 'discord.js';

import { router } from "./router";
import { HandleSlashCommands } from "./slash-commands/set-slash-commands";
import { CustomClient } from "./Classes/CustomClient";

const client = new CustomClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildScheduledEvents, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.GuildScheduledEvent, Partials.GuildMember]
});

client.once("ready", () => logger.info("Ready!"));
client.on("messageCreate", (message) => router(message));
client.on(Events.InteractionCreate, async interaction => HandleSlashCommands(interaction));

client.login(process.env.DISCORD_TOKEN);
