import { Guild, GuildBasedChannel } from 'discord.js';
import { ConfigModel } from '../interfaces/ConfigModel';

export const generateFirstConfig = (guild: Guild): ConfigModel => {
    const mainChannel: GuildBasedChannel | undefined = guild.channels.cache.find(
        channel => channel.name === 'general'
    );

    if (!mainChannel)
        return {
            guildId: guild.id,
            prefix: '!',
            color: '#00FF00',
            mainChannel: '-1',
        };

    return {
        guildId: guild.id,
        prefix: '!',
        color: '#00FF00',
        mainChannel: mainChannel.id,
    };
};
