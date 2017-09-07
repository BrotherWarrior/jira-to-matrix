/* eslint camelcase: 0 */
const Ramda = require('ramda');
const jira = require('../../jira/index');
const {helpers} = require('../../app/matrix/index');
const log = require('../../app/modules/log.js')(module);

/**
 * @param {*} client ???
 * @param {*} issue ???
 * @returns {Promise} ???
 */
const create = async function create(client, issue) {
    if (!client) {
        return;
    }
    const participants = (await jira.issue.collectParticipants(issue)).map(
        helpers.userID
    );

    const options = {
        room_alias_name: issue.key,
        invite: participants,
        name: helpers.composeRoomName(issue),
        topic: jira.issue.ref(issue.key),
    };

    const response = await client.createRoom(options);
    if (!response) {
        return;
    }
    log.info(`Created room for ${issue.key}: ${response.room_id}`);
    return response.room_id;
};

const shouldCreateRoom = Ramda.allPass([
    Ramda.is(Object),
    Ramda.propEq('webhookEvent', 'jira:issue_created'),
    Ramda.propIs(Object, 'issue'),
]);

/**
 * @param {Object} req Request data
 * @param {Object} res Response data
 * @param {Function} next Caller next middleware
 */
const middleware = async function middleware(req, res, next) {
    if (req.body.issue) {
        log.info(`Create room for issue ${req.body.issue.key}: ${shouldCreateRoom(req.body)}\n`);
    } else {
        log.info(`Create room ${req.body.webhookEvent}: ${shouldCreateRoom(req.body)}\n`);
    }

    if (shouldCreateRoom(req.body)) {
        req.newRoomID = await create(req.mclient, req.body.issue); // eslint-disable-line no-param-reassign
    }
    next();
};

module.exports.middleware = middleware;
module.exports.forTests = {shouldCreateRoom};
