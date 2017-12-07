const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const EventEmitter = require('events');

const conf = require('./config');
const {connect, disconnect} = require('./matrix');
const logger = require('debug')('app');
const getParsedAndSaveToRedis = require('../src/queue/get-parsed-and-save-to-redis.js');
const newQueueHandler = require('../src/queue/new-queue-handler.js');

const queuePush = new EventEmitter();

const connectToMatrix = () => (async () => {
    const connection = await connect();

    queuePush.emit('startQueueHandler');
    return connection;
})();

const tryRedis = () =>
    setInterval(() => queuePush.emit('startQueueHandler'), 30 * 60 * 1000);

const client = connectToMatrix();

const app = express();

app.use(bodyParser.json({
    strict: false,
    limit: '20mb',
}));

app.post('/', async (req, res, next) => {
    logger('Jira body', req.body);

    // return false if user in body is ignored
    const saveStatus = await getParsedAndSaveToRedis(req.body);

    if (saveStatus) {
        queuePush.emit('startQueueHandler');
    }

    next();
});

// version, to verify deployment
app.get('/', (req, res) => {
    res.end(`Version ${conf.version}`);
});

// end any request for it not to hang
app.use((req, res) => {
    res.end();
});

app.use((err, req, res, next) => {
    if (err) {
        logger('express error', err);
    }
    res.end();
});

const server = http.createServer(app);
server.listen(conf.port, () => {
    logger(`Server is listening on port ${conf.port}`);
});

tryRedis();

queuePush.on('startQueueHandler', async () => {
    logger('queuePush start');
    if (client) {
        await newQueueHandler(client);
    }
});

const onExit = async function onExit() {
    clearInterval(tryRedis());
    const disconnection = await disconnect();
    disconnection();
    if (server.listening) {
        server.close(() => {
            process.exit();
        });

        return;
    }
    process.exit();
};

process.on('uncaughtException', err => {
    if (err.errno === 'EADDRINUSE') {
        logger(`Port ${conf.port} is in use!\n${err}`);
    } else {
        logger(`Uncaught exception!\n${err}`);
    }
    process.exit(1);
});

process.on('exit', onExit);
process.on('SIGINT', onExit);
process.on('uncaughtException', onExit);