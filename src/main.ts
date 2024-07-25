import 'dotenv/config';
import { GatewayIntentBits, Partials } from 'discord.js';
import { CustomClient } from './definitions/Classes/CustomClient';
import { IEventHandler } from './definitions/interfaces/events/IEventHandler';
import { discordClientEvents } from './events/discordClientEvents';
import { expressEvents } from './events/expressEvents';
import { Server } from 'socket.io';
import { musicPlayerEvents } from './events/musicPlayerEvents';
import { Player } from 'discord-player';

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

const player: Player = new Player(client);
player.extractors.loadDefault();

const eventHandlers: IEventHandler = {};

// Initialize client events

discordClientEvents(client, eventHandlers);
const io: Server = expressEvents(client);
musicPlayerEvents(io);
