const Ramda = require('ramda');
const to = require('await-to-js').default;
const marked = require('marked');
const log = require('../../app/modules/log.js')(module);
const {translate} = require('../../locales/index');
const redis = require('../../redis-client');
const jira = require('../../jira/index');
const {filePath} = require('../../utils/index');
const {epicUpdates: epicConf} = require('../modules/config/index').features;

const epicRedisKey = epicID => `epic|${epicID}`;

const isInEpic = async function isInEpic(epicID, issueID) {
    const [err, saved] = await to(
        redis.sismemberAsync(epicRedisKey(epicID), issueID)
    );
    if (err) {
        log.error(`Error while querying redis:\n${err.message}`);
        return;
    }
    return saved;
};

const saveToEpic = async function saveToEpic(epicID, issueID) {
    const [err] = await to(
        redis.saddAsync(epicRedisKey(epicID), issueID)
    );
    if (err) {
        log.error(`Redis error while adding issue to epic :\n${err.message}`);
    }
};

const sendMessageNewIssue = async function sendMessageNewIssue(mclient, epic, newIssue) {
    const values = filePath.paths([
        'epic.fields.summary',
        'issue.key',
        'issue.fields.summary',
    ], {epic, issue: newIssue});
    values['epic.ref'] = jira.issue.ref(epic.key);
    values['issue.ref'] = jira.issue.ref(newIssue.key);
    const success = await mclient.sendHtmlMessage(
        epic.roomID,
        translate('newIssueInEpic'),
        marked(translate('issueAddedToEpic', values))
    );
    return success;
};

const postNewIssue = async function postNewIssue(epic, issue, mclient) {
    const saved = await isInEpic(epic.id, issue.id);
    if (saved) {
        return;
    }
    const success = await sendMessageNewIssue(mclient, epic, issue);
    if (success) {
        log.info(`Notified epic ${epic.key} room about issue ${issue.key} added to epic "${epic.fields.summary}"`);
        await saveToEpic(epic.id, issue.id);
    }
};

const getNewStatus = Ramda.pipe(
    Ramda.pathOr([], ['changelog', 'items']),
    Ramda.filter(Ramda.propEq('field', 'status')),
    Ramda.head,
    Ramda.propOr(null, 'toString')
);

const postStatusChanged = async function postStatusChanged(roomID, hook, mclient) {
    const status = getNewStatus(hook);
    if (typeof status !== 'string') {
        return;
    }
    const values = filePath.paths([
        'user.name',
        'issue.key',
        'issue.fields.summary',
    ], hook);
    values['issue.ref'] = jira.issue.ref(hook.issue.key);
    values.status = status;
    await mclient.sendHtmlMessage(
        roomID,
        translate('statusHasChanged', values),
        marked(translate('statusHasChangedMessage', values, values['user.name']))
    );
};

const postEpicUpdates = async function postEpicUpdates({mclient, body: hook}) {
    const {issue} = hook;
    const epicKey = Ramda.path(['fields', epicConf.field], issue);
    if (!epicKey) {
        return;
    }
    const epic = await jira.issue.get(epicKey);
    if (!epic) {
        return;
    }
    const roomID = await mclient.getRoomId(epicKey);
    if (!roomID) {
        return;
    }
    const epicPlus = Ramda.assoc('roomID', roomID, epic);

    if (epicConf.newIssuesInEpic === 'on') {
        await postNewIssue(epicPlus, issue, mclient);
    }
    if (epicConf.issuesStatusChanged === 'on') {
        await postStatusChanged(roomID, hook, mclient);
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
        await postEpicUpdates(req);
    }
    next();
};

module.exports = {
    middleware,
    postStatusChanged,
    getNewStatus,
};
