require('dotenv').config();
import { logger } from './logger/pino';
import { Partials, GatewayIntentBits, Events, GuildBasedChannel } from 'discord.js';
import { router } from './router';
import { HandleSlashCommands } from './slash-commands/set-slash-commands';
import { CustomClient } from './Classes/CustomClient';
import { ConfigModel } from './interfaces/ConfigModel';

const client: CustomClient = new CustomClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [Partials.GuildScheduledEvent, Partials.GuildMember],
});

client.once(Events.ShardReady, async () => {
    logger.info('Ready!');
    await client.__initClient__().then(() => {
        logger.info(client.config?.configs.get('123'));
    });
});
client.on(Events.MessageCreate, message => router(message));
client.on(Events.InteractionCreate, async interaction => HandleSlashCommands(interaction));

client.on(Events.GuildCreate, async guild => {
    const mainChannel: GuildBasedChannel | undefined = guild.channels.cache.find(
        channel => channel.name === 'general'
    );

    if (!mainChannel) return;

    const conf: ConfigModel = {
        guildId: guild.id,
        prefix: '!',
        color: '#00FF00',
        mainChannel: mainChannel.id,
    };
    client.config?.insertNewConfig(conf);
    client.config?.loadConfig();
});

client.login(process.env.DISCORD_TOKEN);
