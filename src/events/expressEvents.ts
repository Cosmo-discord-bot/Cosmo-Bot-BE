import http from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import { rtr } from '../api/router';
import { CustomClient } from '../definitions/Classes/CustomClient';
import { logger } from '../logger/pino';

export const expressEvents = (client: CustomClient) => {
    /*
    Express api server initialization
    */

    const song = {
        id: '1267014180926394826',
        title: 'Farruko - Pepas (RefleXx Uptempo Hardcore Remix)',
        description: 'Farruko - Pepas (RefleXx Uptempo Hardcore Remix) by Reflexxofficial',
        author: 'Reflexxofficial',
        url: 'https://www.youtube.com/watch?v=NGN4YRWUR7g',
        thumbnail:
            'https://i.ytimg.com/vi/NGN4YRWUR7g/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCJzsUzilhahJRyYyvuAer9AaB4Lw',
        duration: '2:16',
        durationMS: 136000,
        views: 0,
        requestedBy: '241976433973395459',
    };
    const songs = [
        {
            id: '1267014180930589131',
            title: '2Facez - Zillertaler Gabbermarsch (LIVE Edit) [FREE DOWNLOAD]',
            description: '2Facez - Zillertaler Gabbermarsch (LIVE Edit) [FREE DOWNLOAD] by 2Facez',
            author: '2Facez',
            url: 'https://www.youtube.com/watch?v=ZU4j-J15CuA',
            thumbnail:
                'https://i.ytimg.com/vi/ZU4j-J15CuA/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDzMUHxWj5YuvGozbwhBGHw2B4NqQ',
            duration: '1:46',
            durationMS: 106000,
            views: 0,
            requestedBy: '241976433973395459',
            playlist: null,
        },
        {
            id: '1267014180930589132',
            title: 'High Level - Lalalalalala (Sickmode Edit) (Radio Edit)',
            description: 'High Level - Lalalalalala (Sickmode Edit) (Radio Edit) by Rawstyle Nation ',
            author: 'Rawstyle Nation ',
            url: 'https://www.youtube.com/watch?v=uVPPCbFnbaI',
            thumbnail:
                'https://i.ytimg.com/vi/uVPPCbFnbaI/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDWDin8RY08wtc0UQMwypxUoqUXRg',
            duration: '1:38',
            durationMS: 98000,
            views: 0,
            requestedBy: '241976433973395459',
            playlist: null,
        },
        {
            id: '1267014180930589133',
            title: 'SLOOF LIRPA',
            description: 'SLOOF LIRPA by GPF',
            author: 'GPF',
            url: 'https://www.youtube.com/watch?v=_6euA1x2Q2s',
            thumbnail:
                'https://i.ytimg.com/vi/_6euA1x2Q2s/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAsOHVoEgbX5IGPE33qBM_n51WZ6w',
            duration: '2:00',
            durationMS: 120000,
            views: 0,
            requestedBy: '241976433973395459',
            playlist: null,
        },
        {
            id: '1267014180930589134',
            title: 'Scooter - the Weekend (Kroefoe Uptempo Edit)',
            description: 'Scooter - the Weekend (Kroefoe Uptempo Edit) by Kroefoe Uptempo',
            author: 'Kroefoe Uptempo',
            url: 'https://www.youtube.com/watch?v=DcW-FSrOsIc',
            thumbnail:
                'https://i.ytimg.com/vi/DcW-FSrOsIc/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCJcLQGXibxGYVqqzwSLyIrYOURQQ',
            duration: '2:59',
            durationMS: 179000,
            views: 0,
            requestedBy: '241976433973395459',
            playlist: null,
        },
        {
            id: '1267014180930589135',
            title: 'E-Force - Seven (Dimitri K Edit) (Uptempo)',
            description: 'E-Force - Seven (Dimitri K Edit) (Uptempo) by Frenchcore Hardcore',
            author: 'Frenchcore Hardcore',
            url: 'https://www.youtube.com/watch?v=gpGxIZLcR6w',
            thumbnail:
                'https://i.ytimg.com/vi/gpGxIZLcR6w/hqdefault.jpg?sqp=-oaymwE2CNACELwBSFXyq4qpAygIARUAAIhCGAFwAcABBvABAfgB9AmAAtAFigIMCAAQARgkICcofzAP&rs=AOn4CLBH5A2OXUeUkYOYUAwUBue43SD6_g',
            duration: '2:36',
            durationMS: 156000,
            views: 0,
            requestedBy: '241976433973395459',
            playlist: null,
        },
        {
            id: '1267014180930589136',
            title: 'Dimitri K - AK-47 (Uptempo) (Videoclip)',
            description: 'Dimitri K - AK-47 (Uptempo) (Videoclip) by Frenchcore Hardcore',
            author: 'Frenchcore Hardcore',
            url: 'https://www.youtube.com/watch?v=BrI5ihYqLrY',
            thumbnail:
                'https://i.ytimg.com/vi/BrI5ihYqLrY/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBWiiQ5gLMNv1RsxM0mk4meZNlV8A',
            duration: '3:45',
            durationMS: 225000,
            views: 0,
            requestedBy: '241976433973395459',
            playlist: null,
        },
        {
            id: '1267014180930589137',
            title: 'Unproven - Like A Drug',
            description: 'Unproven - Like A Drug by Unproven',
            author: 'Unproven',
            url: 'https://www.youtube.com/watch?v=jw7D4amOw4o',
            thumbnail:
                'https://i.ytimg.com/vi/jw7D4amOw4o/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAJL2ify5tJjhDxs_5UZU1_YJ6tqw',
            duration: '4:01',
            durationMS: 241000,
            views: 0,
            requestedBy: '241976433973395459',
            playlist: null,
        },
        {
            id: '1267014180930589138',
            title: 'Bloodlust & Elite Enemy - Lose Control',
            description: 'Bloodlust & Elite Enemy - Lose Control by Bloodlust',
            author: 'Bloodlust',
            url: 'https://www.youtube.com/watch?v=lHRvUAJ4Sko',
            thumbnail:
                'https://i.ytimg.com/vi/lHRvUAJ4Sko/hqdefault.jpg?sqp=-oaymwE2CNACELwBSFXyq4qpAygIARUAAIhCGAFwAcABBvABAfgB_gmAAtAFigIMCAAQARhhIGEoYTAP&rs=AOn4CLDR8I9Apar6Ywqb1XdeLMtJ8WiXOw',
            duration: '2:54',
            durationMS: 174000,
            views: 0,
            requestedBy: '241976433973395459',
            playlist: null,
        },
        {
            id: '1267014180930589139',
            title: 'Manifest Destiny - Music Making MF',
            description: 'Manifest Destiny - Music Making MF by Barbaric Records',
            author: 'Barbaric Records',
            url: 'https://www.youtube.com/watch?v=2TRgBY7O38k',
            thumbnail:
                'https://i.ytimg.com/vi/2TRgBY7O38k/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBHJUlbVpROgimyRJlSzTsfdkxYvw',
            duration: '3:22',
            durationMS: 202000,
            views: 0,
            requestedBy: '241976433973395459',
            playlist: null,
        },
        {
            id: '1267014180930589140',
            title: "Mind Compressor & Yoshiko - I Can't Get It",
            description: "Mind Compressor & Yoshiko - I Can't Get It by Barbaric Records",
            author: 'Barbaric Records',
            url: 'https://www.youtube.com/watch?v=yfRIO4c0ads',
            thumbnail:
                'https://i.ytimg.com/vi/yfRIO4c0ads/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLALYxBBKGX0u6RzePyL6Uljkhw84A',
            duration: '2:57',
            durationMS: 177000,
            views: 0,
            requestedBy: '241976433973395459',
            playlist: null,
        },
        {
            id: '1267014180930589141',
            title: 'Double Headed Snake (Official Snakepit 2019 Anthem)',
            description: 'Double Headed Snake (Official Snakepit 2019 Anthem) by F. Noize - Topic',
            author: 'F. Noize - Topic',
            url: 'https://www.youtube.com/watch?v=STXu9d0LYnU',
            thumbnail:
                'https://i.ytimg.com/vi/STXu9d0LYnU/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLA32uYsSnh590oAZqK9XeHZZqtJmQ',
            duration: '3:58',
            durationMS: 238000,
            views: 0,
            requestedBy: '241976433973395459',
            playlist: null,
        },
        {
            id: '1267014180930589142',
            title: 'Dutch Disorder - Heroine (Cryogenic feat. Unlocked The Uptempo Edit)',
            description: 'Dutch Disorder - Heroine (Cryogenic feat. Unlocked The Uptempo Edit) by Offensive Rage Records',
            author: 'Offensive Rage Records',
            url: 'https://www.youtube.com/watch?v=aV9DYonc_Ko',
            thumbnail:
                'https://i.ytimg.com/vi/aV9DYonc_Ko/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDfi8PDdMxE4PyoeeSKE2kVSqZwZw',
            duration: '2:35',
            durationMS: 155000,
            views: 0,
            requestedBy: '241976433973395459',
            playlist: null,
        },
    ];

    const app = express();
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'PUT', 'POST', 'DELETE'],
        },
    });
    const port: string | 3000 = process.env.EXPRESS_PORT || 3000;

    app.use(
        cors({
            origin: process.env.CORS_ORIGIN || '*',
            methods: 'GET,PUT,POST,DELETE',
        })
    );
    app.use(express.json());
    app.use('/api/v1', rtr(client, io));

    let currentSong = song;
    let isPlaying = false;
    let currentProgress = 0;
    let progressInterval: NodeJS.Timeout | null = null;

    const updateProgress = () => {
        if (isPlaying && currentSong) {
            currentProgress += 1000; // Increase by 1 second
            if (currentProgress > currentSong.durationMS) {
                // Simulate moving to next song when current song ends
                nextTrack();
            } else {
                const progressPercentage = (currentProgress / currentSong.durationMS) * 100;
                io.emit('progressUpdate', progressPercentage);
            }
        }
    };

    const startProgressUpdate = () => {
        if (progressInterval) {
            clearInterval(progressInterval);
        }
        progressInterval = setInterval(updateProgress, 1000);
    };

    const stopProgressUpdate = () => {
        if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
    };

    const nextTrack = () => {
        currentProgress = 0;
        currentSong = songs[Math.floor(Math.random() * songs.length)];
        io.emit('nowPlayingUpdate', currentSong);
        io.emit('progressUpdate', 0);
    };

    io.on('connection', (socket) => {
        console.log('A client connected');

        socket.on('disconnect', () => {
            console.log('A client disconnected');
        });

        // socket.emit('queueUpdate', songs);
        // socket.emit('nowPlayingUpdate', currentSong);
        // socket.emit('playStateUpdate', isPlaying);
        // socket.emit('progressUpdate', (currentProgress / currentSong.durationMS) * 100);
        //
        // socket.on('playPause', () => {
        //     isPlaying = !isPlaying;
        //     io.emit('playStateUpdate', isPlaying);
        //
        //     if (isPlaying) {
        //         startProgressUpdate();
        //     } else {
        //         stopProgressUpdate();
        //     }
        // });
        //
        // socket.on('nextTrack', () => {
        //     nextTrack();
        // });
    });

    // Start progress updates
    //startProgressUpdate();

    server.listen(port, () => {
        logger.info(`API is running at http://localhost:${port}`);
    });

    return io;
};
