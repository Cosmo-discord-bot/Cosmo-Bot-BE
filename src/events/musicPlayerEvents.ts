import { useMainPlayer } from 'discord-player';
import { Server } from 'socket.io';
import { BaseEmbed } from '../helper/embeds';
import { logger } from '../logger/pino';

export const musicPlayerEvents = (io: Server) => {
    const player = useMainPlayer();

    player.events.on('playerStart', (queue, track) => {
        if (!track.requestedBy) track.requestedBy = queue.player.client.user;

        io.emit('trackChange', track);

        const embed = BaseEmbed()
            .setAuthor({ name: 'Now playing' })
            .setTitle(track.title)
            .setURL(track.url)
            .setThumbnail(track.thumbnail)
            .setFooter({
                text: `Played by: ${track.requestedBy?.tag}`,
                iconURL: track.requestedBy?.displayAvatarURL(),
            });

        return queue.metadata.channel.send({ embeds: [embed] });
    });

    player.events.on('audioTrackAdd', (queue, track) => {
        io.emit('queueUpdate', queue.tracks);
        logger.info(`Track added to queue: ${queue.tracks.at(0)?.title}`);
    });

    // player.events.on('emptyQueue', (queue) => {
    //     io.emit('queueEmpty', { guildId: queue.guild.id });
    // });
    //
    // player.events.on('disconnect', (queue) => {
    //     io.emit('disconnect', { guildId: queue.guild.id });
    // });
};
