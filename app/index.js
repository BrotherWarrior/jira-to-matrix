const express = require('express');
const bodyParser = require('body-parser');
const {version: appVersion, features} = require('../app/modules/config');
const log = require('../app/modules/log.js')(module);
const bot = require('../app/bot');
const matrix = require('../app/matrix');

let middlewares = [
    bot.parseIncoming,
    bot.saveIncoming,
    bot.stopIfUserIgnored,
    bot.connectToMatrix,
];

if (features.createRoom) {
    middlewares = [...middlewares, bot.createRoom, bot.postIssueDescription];
}

if (features.inviteNewMembers) {
    middlewares = [...middlewares, bot.inviteNewMembers];
}

if (features.postIssueUpdates) {
    middlewares = [...middlewares, bot.postIssueUpdates];
}

if (features.postComments) {
    middlewares = [...middlewares, bot.postComment];
}

if (features.epicUpdates.newIssuesInEpic === 'on' || features.epicUpdates.issuesStatusChanged === 'on') {
    middlewares = [...middlewares, bot.postEpicUpdates];
}

if (features.newLinks) {
    middlewares = [...middlewares, bot.postNewLinks];
}

if (features.postChangesToLinks.on) {
    middlewares = [...middlewares, bot.postLinkedChanges];
}

const app = express();
app.use(bodyParser.json({strict: false}));

app.post('/', middlewares);

// version, to verify deployment
app.get('/', (req, res) => {
    res.end(`Version ${appVersion}`);
});

// version, to verify deployment
app.all('/', (req, res) => {
    res.status(405).send('Method Not Allowed');
});

// end any request for it not to hang
app.use((req, res) => {
    log.warn('Unhandled interception middleware');
    res.status(404).send('Request not handled');
});

app.use((error, req, res) => {
    log.error('Error interception middleware:', error);
    res.status(500).send('Error on server');
});

app.matrix = matrix;

module.exports = app;
