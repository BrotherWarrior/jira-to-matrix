const appConfig = require('../../app/modules/config');
const {connect, disconnect} = require('./sdk-client')(appConfig.matrix);
const apiClient = require('./api-client')(connect);
const helpers = require('./helpers');

module.exports = {
    helpers,
    disconnect,
    connect: apiClient,
};
