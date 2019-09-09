const DB_NAME = 'notes';
const DB_VERSION = 1;
const DB_SCHEMAS = {
    NOTES: 'notes',
};
let actionTypes;
let db;
const createDatabase = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (e) => reject(new Error(e.target.error));
    request.onsuccess = (e) => {
        db = e.target.result;
        resolve();
    };
    request.onupgradeneeded = (e) => {
        const database = e.target.result;

        if (Array.prototype.includes.call(database.objectStoreNames, DB_SCHEMAS.NOTES)) {
            database.deleteObjectStore(DB_SCHEMAS.NOTES);
        }
        const notes = database.createObjectStore(DB_SCHEMAS.NOTES, { keyPath: 'id' });
        notes.createIndex('id', 'id', { unique: true });
        notes.createIndex('text', 'text');
        notes.createIndex('timestamp', 'timestamp');
    };
});
const handleApiInstall = async () => {
    try {
        const response = await fetch(`${URL_PREFIX}/actionTypes.json`);
        if (!response.ok) {
            throw new Error(`Server responded with a "${response.status}" status`);
        }

        actionTypes = await response.json();
    } catch (err) {
        throw new Error(`Failed to fetch /actionTypes.json necessary for service worker API – ${err.message}`);
    }

    try {
        await createDatabase();
    } catch (err) {
        throw new Error(`Failed to initiate a database for service worker API – ${err.message}`);
    }
};
const getNotes = () => new Promise((resolve, reject) => {
    let data;
    const transaction = db.transaction([DB_SCHEMAS.NOTES]);
    transaction.onerror = (e) => reject(new Error(e.target.error));
    transaction.oncomplete = (e) => resolve(data);

    const notes = transaction.objectStore(DB_SCHEMAS.NOTES);
    const indexedNotes = notes.index('timestamp');
    const request = indexedNotes.getAll();
    request.onsuccess = (e) => {
        data = request.result.slice().reverse();
    };
});
const saveNote = (note) => new Promise((resolve, reject) => {
    const transaction = db.transaction([DB_SCHEMAS.NOTES], 'readwrite');
    transaction.onerror = (e) => reject(new Error(e.target.error));
    transaction.oncomplete = (e) => resolve(note);

    const notes = transaction.objectStore(DB_SCHEMAS.NOTES);
    notes.add(note);
});
const deleteNote = (id) => new Promise((resolve, reject) => {
    const transaction = db.transaction([DB_SCHEMAS.NOTES], 'readwrite');
    transaction.onerror = (e) => reject(new Error(e.target.error));
    transaction.oncomplete = (e) => resolve(id);

    const notes = transaction.objectStore(DB_SCHEMAS.NOTES);
    notes.delete(id);
});
const handleApiMessage = async (client, data) => {
    let response = { ok: true };

    switch (data.action) {
        case actionTypes.GET_NOTES:
            response.data = await getNotes();
            break;
        case actionTypes.SAVE_NOTE:
            response.data = await saveNote(data.data);
            break;
        case actionTypes.DELETE_NOTE:
            response.data = await deleteNote(data.data);
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
