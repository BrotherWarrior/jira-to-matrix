/* eslint-disable import/newline-after-import */
const rest = require('./rest.js');
const filePath = require('./file-path.js');
const checkNodeVersion = require('./check-node-version');

module.exports = {
    filePath,
    checkNodeVersion,
    fetchJSON: rest.fetchJSON,
    paramsToQueryString: rest.paramsToQueryString,
};
