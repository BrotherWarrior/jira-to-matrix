const matrix = require('../matrix');
const log = require('../utils/log.js')(module);

/**
 * @param {Object} req Request data
 * @param {Object} res Response data
 * @param {Function} next Caller next middleware
 */
module.exports = async function middleware(req, res, next) {
    let client;
    let count = 0;

    while (!client) {
        client = await matrix.connect();

        if (count >= 10) {
            next(new Error('Could not connect to Matrix'));
        }
        count += 1;
        log.info(`the connection with the Matrix: ${count}\n Web-hook: ${req.body.webhookEvent}`);
    }

    req.mclient = client; // eslint-disable-line no-param-reassign
    next();
};
