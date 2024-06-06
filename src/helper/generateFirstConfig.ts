import { ChannelType, Guild, GuildBasedChannel } from 'discord.js';
import { IConfig } from '../interfaces/common/IConfig';
import { logger } from '../logger/pino';

export const generateFirstConfig = async (guild: Guild): Promise<IConfig> => {
    const mainChannel: GuildBasedChannel | undefined = guild.channels.cache.find(
        channel => channel.name.toLowerCase() === 'general'
    );

    let rolesChannel: GuildBasedChannel | undefined = guild.channels.cache.find(
        channel => channel.name.toLowerCase() === 'roles'
    );

    let eventsGroup: GuildBasedChannel | undefined = guild.channels.cache.find(
        channel => channel.name.toLowerCase() === 'events'
    );

    logger.info('Generating first config for guild: ' + guild.name);

    if (!rolesChannel) {
        // Create roles channel
        rolesChannel = await guild.channels.create({
            name: 'roles',
            type: ChannelType.GuildText,
            permissionOverwrites: [],
            position: 1,
        });
    }

    logger.debug("Event's channel: " + eventsGroup);

    return {
        guildId: guild.id,
        prefix: '!',
        color: '#00FF00',
        mainChannelId: mainChannel ? mainChannel.id : '-1',
        rolesChannelId: rolesChannel ? rolesChannel.id : '-1',
        eventsGroupId: eventsGroup ? eventsGroup.id : '-1',
    } as IConfig;
};
