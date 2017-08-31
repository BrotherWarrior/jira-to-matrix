const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const conf = require('./config');
const bot = require('./bot');
const matrix = require('./matrix');
const log = require('./utils/log.js')(module);
const {checkNodeVersion} = require('./utils');

if (!checkNodeVersion()) {
    process.exit(1);
}

process.on('uncaughtException', err => {
    if (err.errno === 'EADDRINUSE') {
        log.error(`Port ${conf.port} is in use!\n${err}`);
    } else {
        log.error(`Uncaught exception!\n${err}`);
    }
    process.exit(1);
});

const app = express();

app.use(bodyParser.json({strict: false}));

app.post('/', bot.createApp(express));

// version, to verify deployment
app.get('/', (req, res) => {
    res.end(`Version ${conf.version}`);
});
// end any request for it not to hang
app.use((req, res) => {
    res.end();
});

const server = http.createServer(app);
server.listen(conf.port, () => {
    log.info(`Server is listening on port ${conf.port}`);
});

const onExit = async function onExit() {
    await matrix.disconnect();
    if (server.listening) {
        server.close(() => {
            process.exit(1);
        });
        return;
    }
    process.exit(1);
};

process.on('exit', onExit);
process.on('SIGINT', onExit);
process.on('uncaughtException', onExit);
