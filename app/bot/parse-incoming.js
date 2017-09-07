/* eslint no-unreachable: 0 */

const {get: getInObj} = require('lodash');
const jira = require('../../jira');
const log = require('../../app/modules/log.js')(module);


module.exports = function parse(req, res, next) {
    log.silly('parseIncoming called', req.body);

    if (!Object.keys(req.body).length) {
        log.debug('Request has empty body', req.body);
        throw new Error('Request has empty body');
    }

    const json = JSON.stringify(req.body);
    const issue = getInObj(req.body, 'issue.key') || jira.issue.extractID(json);

    const user = getInObj(req.body, 'user.name') || getInObj(req.body, 'comment.author.name');

    const key = [
        req.body.timestamp,
        (req.body.webhookEvent || '').replace(':', '-'),
        user,
        issue,
        'queued',
    ]
        .map(value => value || 'null')
        .join('|');

    log.silly(`Parsed incoming: ${key}`);

    req.jiraKey = key;
    req.bodyString = json;
    next();
};
