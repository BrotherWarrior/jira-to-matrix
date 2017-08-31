const Ramda = require('ramda');
const {postChangesToLinks: conf} = require('../config').features;
const {shouldPostChanges} = require('./post-issue-updates');
const {postStatusChanged, getNewStatus} = require('./post-epic-updates');

const handleLink = async function handleLink(hook, link, mclient) {
    const destIssue = Ramda.either(
        Ramda.prop('outwardIssue'),
        Ramda.prop('inwardIssue')
    )(link);
    if (!destIssue) {
        return;
    }
    const destStatusCat = Ramda.path(['fields', 'status', 'statusCategory', 'id'], destIssue);
    if (conf.ignoreDestStatusCat.includes(destStatusCat)) {
        return;
    }
    const roomID = await mclient.getRoomId(destIssue.key);
    if (!roomID) {
        return;
    }
    postStatusChanged(roomID, hook, mclient);
};

const sendStatusChanges = async function sendStatusChanges({mclient, body: hook}) {
    const links = Ramda.path(['issue', 'fields', 'issuelinks'])(hook);
    const status = getNewStatus(hook);

    if (!links ||
        typeof status !== 'string') {
        return;
    }

    for (const link of links) {
        await handleLink(hook, link, mclient);
    }
};

module.exports = async function middleware(req, res, next) {
    if (shouldPostChanges(req)) {
        await sendStatusChanges(req);
    }
    next();
};
