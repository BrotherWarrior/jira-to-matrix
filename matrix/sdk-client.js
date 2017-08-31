let log;
const sdk = require('matrix-js-sdk');

const has = function objHasProperty(obj, property) {
    return Object.prototype.hasOwnProperty.call(obj, property);
};

// const baseUrl = 'https://matrix.bingo-boom.ru';
// sdk.createClient(baseUrl)
//     .loginWithPassword('matrix','rksG7e68tX')
//     .then(result => {
//         console.log(result);
//     })
//     .catch(error => {
//         console.log(error);
//     });

// await-to helper
// based on https://github.com/scopsy/await-to-js
// function to(promise) {
//     return promise
//         .then(data => [null, data])
//         .catch(err => [err]);
// }

const getAccessToken = async function getAccessToken({baseUrl, userId, password}) {
    try {
        const matrixClient = sdk.createClient(baseUrl);
        const matrixAuthResult = await matrixClient.loginWithPassword(userId, password);

        if (has(matrixAuthResult, 'access_token') && matrixAuthResult.access_token) {
            return matrixAuthResult.access_token;
        }

        return null;
    } catch (error) {
        log.error('getAccessToken', error);
        throw error;
    }
};

const createClient = async function createClient({baseUrl, userId, password}) {
    const token = await getAccessToken({baseUrl, userId, password});
    if (!token) {
        return;
    }
    const newClient = sdk.createClient({
        baseUrl,
        accessToken: token,
        userId,
    });
    log.info('Started connect to Matrix');
    return newClient;
};

const addToNow = function addToNow(ms) {
    return new Date(Number(new Date()) + ms);
};

const initConnectionStore = function initConnectionStore({tokenTTL}) {
    const initialState = () => ({
        // could be actual client or Promise
        client: null,
        expires: null,
    });

    const state = initialState();

    const getState = function getState() {
        return state;
    };

    const setState = function setState(newState) {
        Object.assign(state, newState);
    };

    const clearState = function clearState() {
        setState(initialState());
    };

    const getClient = function getClient() {
        const {client} = getState();
        return client;
    };

    const setNewClient = function setNewClient(client) {
        const expires = addToNow(tokenTTL * 1000);
        setState({client, expires});
    };

    const clientExpired = function clientExpired() {
        const {expires} = getState();
        return expires
            && (new Date()) > expires;
    };

    return {getClient, setNewClient, clientExpired, clearState};
};

const initConnector = function initConnector(config) {
    const store = initConnectionStore(config);

    const connect = async function connect() {
        const client = store.getClient();
        if (client && !store.clientExpired()) {
            return client;
        }
        if (store.clientExpired()) {
            await disconnect(); // eslint-disable-line no-use-before-define
        }
        store.setNewClient(createClient(config));
        return store.getClient();
    };

    const disconnect = async function disconnect() {
        // Client can be a promise yet
        const client = await store.getClient();
        if (client) {
            await client.stopClient();
            log.warn('Disconnected from Matrix');
            store.clearState();
        }
    };

    return {connect, disconnect};
};

module.exports = function init(config, pLogger = console) {
    log = pLogger;
    const connector = initConnector(config);

    const wellConnected = function wellConnected(syncState) {
        return ['PREPARED', 'SYNCING'].includes(syncState);
    };

    const connect = async function connect() {
        const client = await connector.connect();
        if (!client) {
            return;
        }
        if (wellConnected(client.getSyncState())) {
            return client;
        }

        const executor = resolve => {
            const onTimeout = () => {
                log.error('Error: Timeout awaiting matrix client prepared');
                resolve();
            };
            const timeout = setTimeout(onTimeout, config.syncTimeoutSec * 1000);

            const onSync = function onSync(state) {
                if (wellConnected(state)) {
                    clearTimeout(timeout);
                    log.info('Client properly synched with Matrix');
                    resolve(client);
                } else {
                    client.once('sync', onSync);
                }
            };

            client.once('sync', onSync);
        };
        if (!client.clientRunning) {
            client.startClient();
        }
        return new Promise(executor);
    };

    return {
        connect,
        disconnect: connector.disconnect,
    };
};
