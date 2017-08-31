const Ramda = require('ramda');
const fetch = require('node-fetch');
const to = require('await-to-js').default;
const log = require('../utils/log.js')(module);

/**
 * @param {String} url URL to JIRA API
 * @param {String} basicAuth Authorization parameters for API
 * @returns {Promise} ???
 */
const fetchJSON = async function fetchJSON(url, basicAuth) {
    const options = {
        headers: {Authorization: basicAuth},
        timeout: 5000,
    };
    const [err, response] = await to(fetch(url, options));
    if (err) {
        log.error(`Error while getting ${url}:\n${err}`);
        return;
    }

    log.info(response._convert().toString());
    try {
        log.info(JSON.parse(response._convert().toString()));
    } catch (err) {
        log.error(err.message);
    }
    const [parseErr, object] = await to(response.json());
    if (parseErr) {
        log.error(`Error while parsing JSON from ${url}:\n${parseErr}`);
        return;
    }
    return object;
};

/**
 * @param {Object[]} params ???
 * @returns {*} ???
 */
const paramsToQueryString = function paramsToQueryString(params) {
    const toStrings = Ramda.map(Ramda.pipe(
        Ramda.mapObjIndexed((value, key) => `${key}=${value}`),
        Ramda.values
    ));
    return Ramda.ifElse(
        Ramda.isEmpty,
        Ramda.always(''),
        Ramda.pipe(toStrings, Ramda.join('&'), Ramda.concat('?'))
    )(params || []);
};

module.exports = {
    fetchJSON,
    paramsToQueryString,
};
