const to = require('await-to-js').default;
const redis = require('../../redis-client');
const appConfig = require('../../app/modules/config');
const log = require('../../app/modules/log.js')(module);

module.exports = async function save(req, res, next) {
    if (!req.jiraKey) {
        return;
    }
    const [err] = await to(
        redis.setAsync(req.jiraKey, req.bodyString, 'EX', appConfig.redis.ttl)
    );
    if (err) {
        log.error(`Error while saving to redis:\n${err.message}`);
    }
    next();
};
