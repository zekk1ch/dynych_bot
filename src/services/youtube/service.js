const core = require('ytdl-core');

const isValidUrl = (url) => core.validateURL(url);

const getDownloadUrl = async (url, audioOnly = false) => {
    const info = await core.getInfo(url);
    const formats = core.filterFormats(info.formats, audioOnly ? 'audioonly' : 'video');
    return {
        fileUrl: formats[1].url,
        metadata: {
            title: info.title,
            track: info.media.song,
            artist: info.media.artist,
            duration: info.length_seconds,
        },
    };
};

module.exports = {
    isValidUrl,
    getDownloadUrl,
};
