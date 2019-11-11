const env = require('../env');
const constants = require('../src/constants');
const app = require('../src/app');

app.listen(env.PORT, function () {
    const port = this.address().port;

    if (env.MODE === constants.MODE_PRODUCTION) {
        console.log(`Server is running on port ${port}`);
    } else {
        console.log(`Server is running at http://localhost:${port}`);
    }
});
