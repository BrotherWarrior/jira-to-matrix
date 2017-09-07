const Ramda = require('ramda');
const jira = require('../../jira/index');
const matrix = require('../../app/matrix/index');
const log = require('../../app/modules/log.js')(module);

/**
 * @param {*} client ???
 * @param {*} issue ???
 * @returns {Promise} ???
 */
const inviteNew = async function inviteNew(client, issue) {
    const participants = (await jira.issue.collectParticipants(issue)).map(
        matrix.helpers.userID
    );
    const room = await client.getRoomByAlias(issue.key);
    if (!room) {
        return;
    }
    const members = matrix.helpers.membersInvited(room.currentState.members);
    const newMembers = Ramda.difference(participants, members);
    newMembers.forEach(async userID => {
        await client.invite(room.roomId, userID);
    });
    if (newMembers.length > 0) {
        log.info(`New members invited to ${issue.key}: ${newMembers}`);
    }
    return newMembers;
};

/**
 * @param {Object} req Request data
 * @param {Object} res Response data
 * @param {Function} next Caller next middleware
 */
const middleware = async function middleware(req, res, next) {
    if (
        typeof req.body === 'object' &&
    req.body.webhookEvent === 'jira:issue_updated' &&
    typeof req.body.issue === 'object' &&
    req.mclient
    ) {
        await inviteNew(req.mclient, req.body.issue);
    }
    next();
};

module.exports.inviteNew = inviteNew;
module.exports.middleware = middleware;
