/* eslint no-console: 0 */
const fs = require('fs');
const path = require('path');
const AppUtilities = require('../../../app/modules/app-util.js');
const jsonSchema = require('../../../app/modules/json-schema.js');
const confSchema = require('./schema.js');
const packageJson = require('../../../package.json');
let appConfig = require('./defaults.js');

// set path to config file
let appConfigFile = path.join(__dirname, '../../../config.js');
if (process.env.NODE_ENV) {
    appConfigFile = path.join(__dirname, `../../../config.${process.env.NODE_ENV}.js`);
}

if (!fs.existsSync(appConfigFile)) {
    throw new Error(`No config file ${appConfigFile}`);
}

// load config
try {
    appConfig = require(appConfigFile); // eslint-disable-line global-require
} catch (error) {
    throw error;
}

// validation config JSON-data by JSON-schema
const validationResult = jsonSchema.validateSync(appConfig, confSchema);
if (!validationResult.success) {
    throw new Error(`Config: Validation error(s): ${validationResult.error}`);
}

// set service version
appConfig.version = packageJson.version || 'Unknown';

// set environment mode
appConfig.devMode = false;
appConfig.testMode = false;
appConfig.prodMode = false;
if (process.env.NODE_ENV) {
    if ((process.env.NODE_ENV).includes('prod')) {
        appConfig.devMode = false;
        appConfig.testMode = false;
        appConfig.prodMode = true;
    }
    if ((process.env.NODE_ENV).includes('test')) {
        appConfig.testMode = true;
        appConfig.prodMode = false;
    }
    if ((process.env.NODE_ENV).includes('dev')) {
        appConfig.devMode = true;
        appConfig.testMode = false;
        appConfig.prodMode = false;
    }
} else {
    appConfig.prodMode = true;
}

// lock config
for (const key in appConfig) {
    if (!AppUtilities.has(appConfig, key)) {
        continue;
    }

    if (AppUtilities.isObject(appConfig[key])) {
        appConfig[key] = Object.freeze(appConfig[key]);
    }
}
appConfig = Object.freeze(appConfig);
console.info('Config: loaded');

module.exports = appConfig;

