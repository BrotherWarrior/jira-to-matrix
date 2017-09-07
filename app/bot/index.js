const parseIncoming = require('../../app/bot/parse-incoming.js');
const saveIncoming = require('../../app/bot/save-incoming.js');
const stopIfUserIgnored = require('../../app/bot/stop-if-user-ignored.js');
const connectToMatrix = require('../../app/bot/connect-to-matrix.js');
const createRoom = require('../../app/bot/create-room.js').middleware;
const postIssueDescription = require('../../app/bot/post-issue-description.js');
const inviteNewMembers = require('../../app/bot/invite-new-members.js').middleware;
const postComment = require('../../app/bot/post-comment').middleware;
const postIssueUpdates = require('../../app/bot/post-issue-updates.js').middleware;
const postEpicUpdates = require('../../app/bot/post-epic-updates.js').middleware;
const postNewLinks = require('../../app/bot/post-new-links.js');
const postLinkedChanges = require('../../app/bot/post-linked-changes.js');

module.exports = {
    parseIncoming,
    saveIncoming,
    stopIfUserIgnored,
    connectToMatrix,
    createRoom,
    postIssueDescription,
    inviteNewMembers,
    postComment,
    postIssueUpdates,
    postEpicUpdates,
    postNewLinks,
    postLinkedChanges,
};
