const lodash = require('lodash');
const jira = require('../jira');
const log = require('../utils/log.js')(module);

module.exports = function parse(req, res, next) {
    if (typeof req.body !== 'object' || lodash.isEmpty(req.body)) {
        return;
    }

    const json = JSON.stringify(req.body, null, 2);
    const issue = lodash.get(req.body, 'issue.key') || jira.issue.extractID(json);

    const user =
    lodash.get(req.body, 'user.name') || lodash.get(req.body, 'comment.author.name');

    const key = [
        req.body.timestamp,
        (req.body.webhookEvent || '').replace(':', '-'),
        user,
        issue,
        'queued',
    ]
        .map(value => value || 'null')
        .join('|');

    log.fyi(`Incoming: ${key}`);

    req.jiraKey = key;
    req.formattedJSON = json;
    next();
};
