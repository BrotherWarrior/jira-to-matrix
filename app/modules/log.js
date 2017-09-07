const path = require('path');
const winston = require('winston');
const WinstonDailyRotateFile = require('winston-daily-rotate-file');
const appConfig = require('../../app/modules/config');

/**
 * Customized settings for logger module "winston".
 * @module log
 * @param {{}} module Current application module.
 * @returns {{error: Function, warn: Function, info: Function, verbose: Function, debug: Function, silly: Function}}
 *     Configured logger object.
 */
const getLogger = function getLogger(module) {
    // a label with the name of the file, which displays the message
    /** @warn May be an error on unit-tests */
    let logFilename = module.filename.replace(process.cwd(), '')
        .split(path.sep)
        .slice(-2)
        .join(path.sep);
    if (logFilename[0] !== path.sep) {
        logFilename = path.sep + logFilename;
    }
    // specifies the transport of logs depending on the settings
    const setTransports = [];
    /** @type {{type, consoleLevel, filePath, fileLevel}} */
    const {log: logConfig} = appConfig;

    // logging in console
    if (logConfig.type === 'console' || logConfig.type === 'both') {
        setTransports.push(new (winston.transports.Console)({
            timestamp: true,
            colorize: true,
            level: logConfig.consoleLevel,
            label: logFilename,
            json: false,
        }));
    }

    // logging in file
    if (logConfig.type === 'file' || logConfig.type === 'both') {
        setTransports.push(new WinstonDailyRotateFile({
            filename: logConfig.filePath,
            level: logConfig.fileLevel,
            timestamp: true,
            label: logFilename,
            json: true,
        }));
    }

    // return customized logger
    return new (winston.Logger)({
        exitOnError: false,
        transports: setTransports,
    });
};

module.exports = getLogger;

