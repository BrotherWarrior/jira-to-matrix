const conf = require('../config');
const log = require('../utils/log.js')(module);
const {connect, disconnect} = require('./sdk-client')(conf.matrix, log);
const apiClient = require('./api-client')(connect);
const helpers = require('./helpers');

module.exports = {
    helpers,
    disconnect,
    connect: apiClient,
};
