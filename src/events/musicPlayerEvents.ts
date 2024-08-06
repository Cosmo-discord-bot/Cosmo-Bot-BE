// musicPlayerEvents.ts (Backend)

import { GuildQueue, Track, useMainPlayer } from 'discord-player';
import { Server, Socket } from 'socket.io';
import { BaseEmbed } from '../helper/embeds';
import { logger } from '../logger/pino';

export const musicPlayerEvents = (io: Server) => {
    const player = useMainPlayer();

    player.events.on('playerStart', (queue, track) => {
        if (!track.requestedBy) track.requestedBy = queue.player.client.user;

        const embed = BaseEmbed()
            .setAuthor({ name: 'Now playing' })
            .setTitle(track.title)
            .setURL(track.url)
            .setThumbnail(track.thumbnail)
            .setFooter({
                text: `Played by: ${track.requestedBy?.tag}`,
                iconURL: track.requestedBy?.displayAvatarURL(),
            });

        io.emit('nowPlayingUpdate', { guildId: queue.guild.id, track });
        emitQueueUpdate(queue);
        return queue.metadata.channel.send({ embeds: [embed] });
    });

    player.events.on('audioTrackAdd', (queue: GuildQueue, track) => {
        emitQueueUpdate(queue);
        logger.info(`Track added to queue: ${track.title}`);
    });

    player.events.on('emptyQueue', (queue) => {
        io.emit('queueEmpty', { guildId: queue.guild.id });
    });

    player.events.on('audioTracksAdd', (queue: GuildQueue, tracks) => {
        emitQueueUpdate(queue);
        logger.info(`${tracks.length} tracks added to queue`);
    });

    player.events.on('playerSkip', (queue: GuildQueue, track) => {
        io.emit('trackSkipped', { guildId: queue.guild.id, track });
        emitQueueUpdate(queue);
    });

    io.on('connection', (socket: Socket) => {
        logger.info('Client connected to music socket');

        socket.on('playPause', (guildId: string) => handlePlayPause(guildId, io));
        socket.on('nextTrack', (guildId: string) => handleNextTrack(guildId, io));
        socket.on('seekTo', (guildId: string, time: number) => handleSeekTo(guildId, time, io));
        socket.on('setVolume', (guildId: string, volume: number) => handleSetVolume(guildId, volume, io));
        socket.on('removeFromQueue', (data: { guildId: string; trackId: string }) => handleRemoveFromQueue(data, io));
        socket.on('moveToFirst', (data: { guildId: string; trackId: string }) => handleMoveToFirst(data, io));
        socket.on('updateQueueOrder', (data: { guildId: string; track: string; index: number }) => handleUpdateQueueOrder(data, io));

        socket.on('disconnect', () => {
            logger.info('Client disconnected from music socket');
        });
    });

    setInterval(() => {
        player.queues.cache.forEach((queue) => {
            if (queue.isPlaying()) {
                const currentTime = queue.node.getTimestamp()?.current.value ?? 0;
                io.emit('progressUpdate', { guildId: queue.guild.id, progress: currentTime });
            }
        });
    }, 1000);

    const emitQueueUpdate = (queue: GuildQueue) => {
        io.emit('queueUpdate', {
            guildId: queue.guild.id,
            queue: queue.tracks.toArray(),
            currentTrack: queue.currentTrack,
        });
    };

    const handlePlayPause = async (guildId: string, io: Server) => {
        try {
            const queue = player.queues.get(guildId);
            if (!queue) {
                logger.warn(`No queue found for guild ${guildId}`);
                return;
            }
            logger.info('Play/Pause command received');

            if (queue.node.isPaused()) {
                await queue.node.resume();
                io.emit('playStateUpdate', { guildId, isPlaying: true });
            } else {
                await queue.node.pause();
                io.emit('playStateUpdate', { guildId, isPlaying: false });
            }
        } catch (error) {
            logger.error('Error handling play/pause:', error);
        }
    };

    const handleNextTrack = async (guildId: string, io: Server) => {
        try {
            const queue = player.queues.get(guildId);
            if (!queue) {
                logger.warn(`No queue found for guild ${guildId}`);
                return;
            }
            logger.info('Next track command received');

            await queue.node.skip();
            io.emit('queueUpdate', { guildId, queue: queue.tracks.toArray() });
        } catch (error) {
            logger.error('Error skipping track:', error);
        }
    };

    const handleSeekTo = async (guildId: string, time: number, io: Server) => {
        try {
            const queue = player.queues.get(guildId);
            if (!queue) {
                logger.warn(`No queue found for guild ${guildId}`);
                return;
            }
            logger.info('Seek command received');

            await queue.node.seek(time);
            io.emit('progressUpdate', { guildId, progress: time });
        } catch (error) {
            logger.error('Error seeking:', error);
        }
    };

    const handleSetVolume = async (guildId: string, volume: number, io: Server) => {
        try {
            const queue = player.queues.get(guildId);
            if (!queue) {
                logger.warn(`No queue found for guild ${guildId}`);
                return;
            }
            logger.info('Set volume command received');

            queue.node.setVolume(volume);
            io.emit('volumeUpdate', { guildId, volume });
        } catch (error) {
            logger.error('Error setting volume:', error);
        }
    };

    const handleRemoveFromQueue = async (data: { guildId: string; trackId: string }, io: Server) => {
        try {
            const { guildId, trackId } = data;
            const queue = player.queues.get(guildId);
            if (!queue) {
                logger.warn(`No queue found for guild ${guildId}`);
                return;
            }
            logger.info('Remove from queue command received');

            const track: Track | undefined = queue.tracks.find((t) => t.id === trackId);
            if (!track) {
                logger.warn(`Track ${trackId} not found in queue`);
                return;
            }

            queue.node.remove(track);
            io.emit('queueUpdate', { guildId, queue: queue.tracks.toArray() });
        } catch (error) {
            logger.error('Error removing track from queue:', error);
        }
    };

    const handleMoveToFirst = async (data: { guildId: string; trackId: string }, io: Server) => {
        try {
            const { guildId, trackId } = data;
            const queue = player.queues.get(guildId);
            if (!queue) {
                logger.warn(`No queue found for guild ${guildId}`);
                return;
            }
            logger.info('Move to first command received');

            const track: Track | undefined = queue.tracks.find((t) => t.id === trackId);
            if (!track) {
                logger.warn(`Track ${trackId} not found in queue`);
                return;
            }

            queue.node.move(track, 0);
            io.emit('queueUpdate', { guildId, queue: queue.tracks.toArray() });
        } catch (error) {
            logger.error('Error moving track to first:', error);
        }
    };

    const handleUpdateQueueOrder = async (data: { guildId: string; track: string; index: number }, io: Server) => {
        try {
            const { guildId, track, index } = data;
            const queue = player.queues.get(guildId);
            if (!queue) {
                logger.warn(`No queue found for guild ${guildId}`);
                return;
            }
            queue.node.move(track, index);
            io.emit('queueUpdate', { guildId, queue: queue.tracks.toArray() });
        } catch (error) {
            logger.error('Error updating queue order:', error);
        }
    };
};
