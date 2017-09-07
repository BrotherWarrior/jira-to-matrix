const Ramda = require('ramda');
const mconf = require('../../app/modules/config').matrix;

const membersInvited = function membersInvited(roomMembers) {
    return Ramda.pipe(
        Ramda.filter(Ramda.complement(Ramda.propEq('membership', 'leave'))),
        Ramda.values,
        Ramda.map(Ramda.prop('userId'))
    )(roomMembers);
};

const userID = function userID(shortName) {
    return `@${shortName}:${mconf.domain}`;
};

const composeRoomName = issue =>
    `${issue.key} ${Ramda.path(['fields', 'summary'], issue)}`;

module.exports = {
    membersInvited,
    userID,
    composeRoomName,
};
