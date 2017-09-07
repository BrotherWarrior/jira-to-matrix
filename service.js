const http = require('http');
const appConfig = require('./app/modules/config');
const log = require('./app/modules/log.js')(module);
const app = require('./app');

const server = http.createServer(app);
server.listen(appConfig.port, () => {
    const mode = appConfig.devMode || appConfig.testMode || appConfig.prodMode;
    log.info(`Server is listening on port ${appConfig.port} on ${mode} mode`);
});

const onExit = async function onExit(error) {
    if (error && error instanceof Error) {
        let errorMessage = `Uncaught exception!`;

        if (error.errno === 'EADDRINUSE') {
            errorMessage = `Port ${appConfig.port} is in use!`;
        }

        log.error(errorMessage, error);
    }
    log.info(`On exit message or code:`, error);

    await app.matrix.disconnect();
    if (server.listening) {
        server.close(() => {
            log.info('Stop and sutdown server');
            process.exit(1);
        });
    }
    process.exit(1);
};

process.on('SIGINT', () => {
    onExit('SIGINT');
});
process.on('uncaughtException', onExit);
