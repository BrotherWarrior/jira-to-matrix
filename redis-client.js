const redis = require('redis');
const bluebird = require('bluebird');
const conf = require('./config');
const log = require('./utils/log.js')(module);

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const createClient = function createClient(config) {
    let result;
    try {
        result = redis.createClient(config);
        // @todo set events for error disconnect and other
    } catch (error) {
        log.error(`Error while creating redis client ${error}`);
        process.exit(1);
    }
    return result;
};

const client = createClient(conf.redis);

client.on('error', err => {
    log.error(`Redis error:\n${err}`);
    if (/\bECONNREFUSED\b/.test(err.message || '')) {
        process.exit(1);
    }
});

module.exports = client;
