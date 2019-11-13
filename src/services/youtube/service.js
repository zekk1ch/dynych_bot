const core = require('ytdl-core');
const util = require('./util');

const isValidUrl = (url) => core.validateURL(url);

const getDownloadFile = async (url, audioOnly = false) => {
    const options = {
        filter: audioOnly ? 'audioonly' : 'video',
        quality: audioOnly ? 'highestaudio' : 'highestvideo',
    };

    const info = await core.getInfo(url);

    const formats = info.formats.filter((format) => format.container !== 'webm');
    const targetFormat = core.chooseFormat(formats, options);
    if (targetFormat instanceof Error) {
        throw targetFormat;
    }

    const { fileStream, fileSize } = await util.fetchFile(targetFormat.url);

    return {
        fileUrl: targetFormat.url,
        fileStream,
        fileSize,
        fileName: `${info.title}.${targetFormat.container}`,
        metadata: {
            originalUrl: url,
            title: info.title,
            track: info.media.song,
            artist: info.media.artist,
            duration: info.length_seconds,
        },
    };
};

module.exports = {
    isValidUrl,
    getDownloadFile,
};
