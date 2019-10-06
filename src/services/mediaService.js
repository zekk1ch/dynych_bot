const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');
const constants = require('../constants');

const saveFile = (readStream, fileName, fileExtension = 'txt') => new Promise(async (resolve, reject) => {
    // const fileNameEscaped = `${fileName.replace(/['"&?]/g, '')}.${fileExtension}`;
    const filePath = path.join(constants.rootPath, 'temp', `${fileName.replace(/\//g, '_')}.${fileExtension}`);
    // const filePath = path.join(constants.rootPath, 'temp', `${fileName.replace(/(\s+|\/)/g, '\\$1')}.${fileExtension}`);
// console.log(`${fileName.replace(/(\s+)/g, '\\$1')}.${fileExtension}`);
    const writeStream = fs.createWriteStream(filePath, { flags: 'wx' });
    writeStream.on('error', (err) => {
        return err.code === 'EEXIST' ? resolve(filePath) : reject(err);
    });
    writeStream.on('finish', () => {
        resolve(filePath);
    });

    readStream.pipe(writeStream);
});

const fetchImage = async (url, fileName) => {
    try {
        const response = await fetch(url);

        return await saveFile(response.body, fileName || url.split('/').pop());
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to fetch image from ${url}`);
    }
};

const fetchMedia = async (url, mediaType) => {
    const info = await ytdl.getInfo(url);
    const duration = Number(info.length_seconds);
    let data = {
        filePath: null,
        fileUrl: null,
        metadata: {
            title: info.title,
            duration,
            category: info.media.category || '',
            track: info.media.song || '',
            artist: info.media.artist || 'dynych_bot',
        },
    };

    let targetFormat, bestFormat;

    for (let format of info.formats) {
        if (!format.audioEncoding || mediaType === 'audio' && format.encoding || mediaType === 'video' && !format.encoding) {
            continue;
        }

        const bitrate = format.audioBitrate * 1e3 + (~~(mediaType === 'video') && Number(format.bitrate.replace(/^[0-9.]+-/, '')) * 1e6);
        if (duration * bitrate < 4e8) {
            targetFormat = format;
            break;
        }

        if (!bestFormat) {
            bestFormat = format;
        }
    }

    if (targetFormat) {
        const file = await ytdl(url, { format: targetFormat });
        data.filePath = await saveFile(file, data.metadata.title, targetFormat.type.slice(6).split(';')[0]);

        if (mediaType === 'video' && bestFormat) {
            data.fileUrl = bestFormat.url;
        }
    } else if (bestFormat) {
        data.fileUrl = bestFormat.url;
    } else {
        throw new Error(`Requested media type "${mediaType}" is not supported`);
    }

    return data;
};

module.exports = {
    fetchImage,
    fetchMedia,
};
