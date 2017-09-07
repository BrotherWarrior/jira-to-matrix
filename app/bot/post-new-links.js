const Ramda = require('ramda');
const to = require('await-to-js').default;
const marked = require('marked');
const log = require('../../app/modules/log.js')(module);
const redis = require('../../redis-client');
const jira = require('../../jira');
const {translate} = require('../../locales');
// const { shouldPostChanges } = require('./post-issue-updates')

const postLink = async function postLink(issue, relation, related, mclient) {
    const roomID = await mclient.getRoomId(issue.key);
    if (!roomID) {
        return;
    }
    const values = {
        relation,
        key: related.key,
        summary: Ramda.path(['fields', 'summary'], related),
        ref: jira.issue.ref(related.key),
    };
    await mclient.sendHtmlMessage(
        roomID,
        translate('newLink'),
        marked(translate('newLinkMessage', values))
    );
};

const handleLink = async function handleLink(issueLink, mclient) {
    const link = await jira.link.get(issueLink.id);
    if (!link) {
        return;
    }
    const [err, isNew] = await to(
        redis.setnxAsync(`link|${link.id}`, '1')
    );
    if (err) {
        log.error(`Redis error while SETNX new link\n${err.message}`);
        return;
    }
    if (!isNew) {
        return;
    }
    await postLink(link.inwardIssue, link.type.outward, link.outwardIssue, mclient);
    await postLink(link.outwardIssue, link.type.inward, link.inwardIssue, mclient);
};

const handleLinks = async function handleLinks({mclient, body: hook}) {
    const links = Ramda.path(['issue', 'fields', 'issuelinks'])(hook);
    if (!links) {
        return;
    }

    for (const issueLink of links) {
        await handleLink(issueLink, mclient);
    }
};

const shouldPostChanges = ({body, mclient}) => Boolean(
    typeof body === 'object'
    && (
        body.webhookEvent === 'jira:issue_updated'
        || body.webhookEvent === 'jira:issue_created'
    )
    && typeof body.changelog === 'object'
    && typeof body.issue === 'object'
    && mclient
);

const middleware = async function middleware(req, res, next) {
    if (shouldPostChanges(req)) {
        await handleLinks(req);
    }
    next();
};

module.exports = middleware;
