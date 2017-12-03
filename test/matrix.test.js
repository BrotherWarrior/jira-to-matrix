const config = require('../src/config/');
const fakeConfig = require('./fixtures/config');
const init = require('../src/matrix/sdk-client');
const appMatrix = require('../src/matrix');
const assert = require('assert');
const logger = require('debug')('test matrix');
const matrixApi = require('../src/matrix/');

describe('Matrix api', async function() {
    this.timeout(15000);
    let client;

    it('test matrix true config connect from sdk-client', async () => {
        const {connect, disconnect} = await init(config.matrix);
        client = await connect();
        logger('client.getSyncState', client.getSyncState());
        assert.ok(client.clientRunning);
        await disconnect();
        logger('client.getSyncState', client.getSyncState());
        assert.ifError(client.clientRunning);
    });
    
    it('test matrix fake config connect from sdk-client', async () => {
        try {
            const {connect} = await init(fakeConfig.matrix);
        } catch (err) {
            const funcErr = () => {
                throw err
            };
            assert.throws(funcErr, /No baseUrl/);
        }
    });
    
    it('test matrix connect with fake password from sdk-client', async () => {
        try {
            const {matrix} = config;
            const matrixWithFakePassword = {...matrix, password: 'fake'};
            const connect = await init(matrixWithFakePassword);
        } catch (err) {
            const funcErr = () => {
                throw err
            };
            assert.throws(funcErr, /Invalid password/);
        }
    });

    it('test matrixApi', async () => {
        const {connect, disconnect, helpers} = matrixApi;
        // const initconf = await init(config.matrix);
        // logger('connect', connect);
        // logger('init', initconf);
        const expected = ['createRoom', 'getRoomId', 'getRoomByAlias', 'getRoomMembers', 'invite', 'sendHtmlMessage', 'createAlias', 'setRoomName', 'setRoomTopic'];
        const api = await connect();
        const result = Object.values(api).map(func => func.name)
        assert.ok(expected, result);
        // (await disconnect())();
        // assert.ifError(client.clientRunning);
        logger('helpers', helpers);
    });

    
    await afterEach(async () => {
        if (client) {
            await client.stopClient();
        }
    });

    // after(() => process.exit(1));
});