const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg');
const constants = require('../constants');
const util = require('./utilService');

const saveFile = (fileName, readStream, metadata, overwrite = false) => new Promise(async (resolve, reject) => {
    const fileNameEscaped = fileName.replace(/ +/g, '_').replace(/['"&?]/g, '');
    const filePath = path.join(constants.rootPath, 'temp', fileNameEscaped);
    const tempFilePath = path.join(constants.rootPath, 'temp', `__${fileNameEscaped}`);

    try {
        await util.fileStats(filePath);
        if (!overwrite) {
            return resolve(filePath);
        }
    } catch (err) {
        if (err.code !== 'ENOENT') {
            return reject(err);
        }
    }

    const writeStream = fs.createWriteStream(metadata ? tempFilePath : filePath, { flags: 'w' });
    writeStream.on('error', (err) => reject(err));
    writeStream.on('finish', async () => {
        if (metadata) {
            try {
                const ff = await new ffmpeg(tempFilePath);
                const metadataString = util.convertMetadataToString(metadata);
                ff.addCommand('-metadata', metadataString);
                await ff.save(filePath);

                try {
                    await util.deleteFile(tempFilePath);
                } catch (err) {
                    console.error(new Error(`Failed to delete temp file – ${tempFilePath}`));
                    console.error(err);
                }

                resolve(filePath);
            } catch (err) {
                reject(err);
            }
        }

        resolve(filePath);
    });

    readStream.pipe(writeStream);
});

const splitFile = (filePath) => new Promise(async (resolve, reject) => {
    const srcMpeg = await new ffmpeg(filePath);
    const srcMetadata = util.parseMetadataMpeg(srcMpeg.metadata);

    try {
        const stats = await util.fileStats(filePath);
        if (stats.size < constants.maxBytes) {
            return resolve([{
                path: filePath,
                metadata: srcMetadata,
            }]);
        }
    } catch (err) {
        let returnError = err;
        if (err.code === 'ENOENT') {
            returnError = new Error(`File at path "${filePath}" doesn't exist`);
        }
        return reject(returnError);
    }

    const chunks = [];
    const readStream = fs.createReadStream(filePath, { highWaterMark: constants.maxBytes });
    readStream.on('error', (err) => reject(err));

    let chunkName = filePath.split('/').pop(), chunkIndex = -1;
    readStream.on('data', async (chunk) => {
        chunkIndex++;
        chunkName = util.incrementFileName(chunkName);
        const chunkPath = path.join(constants.rootPath, 'temp', chunkName);
        const tempChunkPath = path.join(constants.rootPath, 'temp', `__${chunkName}`);

        const writeStream = fs.createWriteStream(tempChunkPath, { flags: 'w' });
        writeStream.on('error', (err) => reject(err));
        writeStream.write(chunk);
        writeStream.end();

        chunks.push({
            path: chunkPath,
            tempPath: tempChunkPath,
            metadata: {
                ...srcMetadata,
                title: `${srcMetadata.title} (part ${chunkIndex + 1})`,
                track: srcMetadata.track ? `${srcMetadata.track} (part ${chunkIndex + 1})` : srcMetadata.track,
            },
        });
    });

    readStream.on('end', async () => {
        const promises = chunks
            .map((chunk) => async () => {
                const ff = await new ffmpeg(chunk.tempPath);
                const metadataString = util.convertMetadataToString(chunk.metadata);
                ff.addCommand('-metadata', metadataString);
                await ff.save(chunk.path);

                try {
                    await util.deleteFile(chunk.tempPath);
                } catch (err) {
                    console.error(new Error(`Failed to delete temp chunk file – ${chunk.tempPath}`));
                    console.error(err);
                }
            })
            .map((fn) => fn());

        try {
            await Promise.all(promises);

            resolve(chunks);
        } catch (err) {
            reject(err);
        }
    });
});

const fetchImage = async (url, fileName) => {
    try {
        const response = await fetch(url);

        return await saveFile(fileName || url.split('/').pop(), response.body);
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to fetch image from ${url}`);
    }
};

const fetchVideo = async (url, format = 'mp4') => {
    if (!ytdl.validateURL(url)) {
        throw new Error(`Invalid video URL – ${url}`);
    }

    try {
        const [info, file] = await Promise.all([
            ytdl.getBasicInfo(url),
            ytdl(url, { format }),
        ]);
        const metadata = util.parseMetadataYoutube(info);

        return await saveFile(`${metadata.title}.${format}`, file, metadata);
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to fetch video from ${url}`);
    }
};

const fetchThumbnail = async (url) => {
    const info = await ytdl.getBasicInfo(url);
    return await fetchImage(info.player_response.videoDetails.thumbnail.thumbnails[2].url);
};

module.exports = {
    splitFile,
    fetchImage,
    fetchVideo,
    fetchThumbnail,
};
