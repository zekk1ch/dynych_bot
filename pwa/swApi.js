let actionTypes;
const handleApiInstall = async () => {
    try {
        const response = await fetch('/actionTypes.json');
        if (!response.ok) {
            throw new Error(`Server responded with a "${response.status}" status`);
        }

        actionTypes = await response.json();
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to fetch /actionTypes.json necessary for service worker API – ${err.message}`);
    }
};
const handleApiMessage = async (client, data) => {
    let response;

    switch (data.action) {
        case actionTypes.GET_NOTES:
            response = {
                ok: true,
                data: [{id:'1',text:'Sample Note'}], // TODO
            };
            break;
        default:
            response = {
                ok: false,
                error: {
                    message: `Unknown action – "${data.action}"`,
                },
            };
    }

    client.postMessage(response);
};

self.addEventListener('install', (e) => {
    e.waitUntil(handleApiInstall());
});
self.addEventListener('message', (e) => {
    e.waitUntil(handleApiMessage(e.ports[0], e.data));
});
