import 'dotenv/config';
import { GatewayIntentBits, Partials } from 'discord.js';
import { CustomClient } from './definitions/Classes/CustomClient';
import { IEventHandler } from './definitions/interfaces/events/IEventHandler';
import { discordClientEvents } from './events/discordClientEvents';
import { expressEvents } from './events/expressEvents';

const client: CustomClient = new CustomClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
    ],
    partials: [Partials.GuildScheduledEvent, Partials.GuildMember],
});
client.login(process.env.DISCORD_TOKEN);

const eventHandlers: IEventHandler = {};

// Initialize client events
expressEvents(client);
discordClientEvents(client, eventHandlers);
