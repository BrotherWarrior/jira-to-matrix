/* eslint-disable import/newline-after-import */
const rest = require('./rest.js');
const filePath = require('./file-path.js');

module.exports = {
    filePath,
    fetchJSON: rest.fetchJSON,
    paramsToQueryString: rest.paramsToQueryString,
};
