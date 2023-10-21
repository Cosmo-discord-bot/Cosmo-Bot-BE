import { BaseGuildTextChannel, Guild, GuildBasedChannel, ChannelType } from 'discord.js';
import { ConfigModel } from '../interfaces/ConfigModel';

export const generateFirstConfig = async (guild: Guild): Promise<ConfigModel> => {
    const mainChannel: GuildBasedChannel | undefined = guild.channels.cache.find(
        channel => channel.name === 'general'
    );

    let rolesChannel: GuildBasedChannel | undefined = guild.channels.cache.find(
        channel => channel.name === 'roles'
    );

    if (!rolesChannel) {
        // Create roles channel
        rolesChannel = await guild.channels.create({
            name: 'roles',
            type: ChannelType.GuildText,
            permissionOverwrites: [],
            position: 1,
        });
    }

    return {
        guildId: guild.id,
        prefix: '!',
        color: '#00FF00',
        mainChannel: mainChannel ? mainChannel.id : '-1',
        rolesChannel: rolesChannel ? rolesChannel?.id : '-1',
    };
};
