const Ramda = require('ramda');
const lodash = require('lodash');
const conf = require('../config');
const {auth} = require('./common');
const {fetchJSON, paramsToQueryString} = require('../utils');

/**
 * @param {string} issueKey ???
 * @returns {string} ???
 */
const ref = function ref(issueKey) {
    return `${conf.jira.url}/browse/${issueKey}`;
};

/**
 * @param {string} json ???
 * @returns {*} ???
 */
const extractID = function extractID(json) {
    const matches = /\/issue\/(\d+)\//.exec(json);
    if (!matches) {
        return;
    }
    return matches[1];
};

/**
 * @param {Object} issue ???
 * @returns {Promise} ???
 */
const collectParticipants = async function collectParticipants(issue) {
    const result = [
        lodash.get(issue, 'fields.creator.name'),
        lodash.get(issue, 'fields.reporter.name'),
        lodash.get(issue, 'fields.assignee.name'),
    ];

    const url = lodash.get(issue, 'fields.watches.self');
    if (url) {
        const body = await fetchJSON(url, auth());
        if (body && body.watchers instanceof Array) {
            const watchers = body.watchers.map(one => one.name);
            result.push(...watchers);
        }
    }
    return lodash.uniq(result.filter(one => !!one));
};

/**
 * @param {*} id ???
 * @param {Object[]} params ???
 * @returns {Promise.<*>} ???
 */
const get = async function get(id, params) {
    const issue = await fetchJSON(
        `${conf.jira.url}/rest/api/2/issue/${id}${paramsToQueryString(params)}`,
        auth()
    );
    return issue;
};

/**
 * @param {String} issueID ???
 * @returns {Promise} ???
 */
const getFormatted = async function getFormatted(issueID) {
    const params = [{expand: 'renderedFields'}];
    const result = await get(issueID, params);
    return result;
};

/**
 * @param {String} issueID ???
 * @param {String[]} fields ???
 * @returns {Promise.<*>} ???
 */
const renderedValues = async function renderedValues(issueID, fields) {
    const issue = await getFormatted(issueID);
    if (!issue) {
        return;
    }
    return Ramda.pipe(
        Ramda.pick(fields),
        Ramda.filter(value => !!value)
    )(issue.renderedFields);
};

module.exports = {
    ref,
    extractID,
    collectParticipants,
    get,
    getFormatted,
    renderedValues,
};
