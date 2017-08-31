const lodash = require('lodash');
const Ramda = require('ramda');
const htmlToString = require('html-to-text').fromString;
const jira = require('../../jira');
const {translate} = require('../../locales');
const log = require('../../utils/log.js')(module);

const isCommentHook = Ramda.contains(Ramda.__, ['comment_created', 'comment_updated']);

/**
 * @param {*} issue ???
 * @param {*} comment ???
 * @returns {*} ???
 */
const pickRendered = function pickRendered(issue, comment) {
    const comments = lodash.get(issue, 'renderedFields.comment.comments');

    if (!(comments instanceof Array)) {
        return comment.body;
    }

    return (
        Ramda.prop(
            'body',
            Ramda.find(Ramda.propEq('id', comment.id), comments)
        ) || comment.body
    );
};

const headerText = function headerText({comment, webhookEvent}) {
    const fullName = Ramda.path(['author', 'displayName'], comment);
    const event = isCommentHook(webhookEvent) ?
        webhookEvent :
        'comment_created';
    return `${fullName} ${translate(event, null, fullName)}`;
};

const postComment = async function postComment(client, body) {
    log.info(`Enter in function create comment for hook {${body.webhookEvent}}`);
    const issueID = jira.issue.extractID(JSON.stringify(body));
    const issue = await jira.issue.getFormatted(issueID);
    if (!issue) {
        return;
    }
    const room = await client.getRoomByAlias(issue.key);
    log.info(`Room for comment ${issue.key}: ${!!room} \n`);
    if (!room) {
        return;
    }
    const message = `${headerText(body)}: <br>${pickRendered(issue, body.comment)}`;
    const success = await client.sendHtmlMessage(room.roomId, htmlToString(message), message);
    if (success) {
        log.info(`Posted comment to ${issue.key} from ${lodash.get(body, 'comment.author.name')}\n`);
    }
};

module.exports = {postComment};
