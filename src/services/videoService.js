const youtubeService = require('./youtubeService');

const fetchVideo = () => youtubeService.fetchVideo(url);

module.exports = {
    fetchVideo,
};
