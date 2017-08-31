/* eslint-disable camelcase */
const Ramda = require('ramda');
const {filePath} = require('../../utils');
const {postComment} = require('./post-comment');

const isCommentEvent = ({webhookEvent, issue_event_type_name}) => {
    const propNotIn = Ramda.complement(filePath.propIn);
    return Ramda.anyPass([
        filePath.propIn('webhookEvent', ['comment_created', 'comment_updated']),
        Ramda.allPass([
            Ramda.propEq('webhookEvent', 'jira:issue_updated'),
            propNotIn('issue_event_type_name', ['issue_commented', 'issue_comment_edited']),
        ]),
    ])({webhookEvent, issue_event_type_name} || {});
};

const shouldPostComment = ({body, mclient}) => Boolean(
    typeof body === 'object'
    && isCommentEvent(body)
    && typeof body.comment === 'object'
    && mclient
);

const middleware = async function middleware(req, rs, next) {
    if (shouldPostComment(req)) {
        await postComment(req.mclient, req.body);
    }
    next();
};

module.exports.middleware = middleware;
module.exports.forTests = {
    isCommentEvent,
};
