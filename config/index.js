const Ramda = require('ramda');
// const path = require('path');
const validate = require('./validate-config.js');

// const ROOT_DIR = process.cwd();

let confgigFilepath = '../../config.js';
if (process.env.NODE_ENV) {
    confgigFilepath = `../../config.${process.env.NODE_ENV}.js`;
}
const configData = require(confgigFilepath);

/**
 * @returns {*} ???
 */
// const getConfig = function getConfig() {
//     /** ??? */
//     class Arg {
//         /**
//          * @param {*} key ???
//          * @param {*} alias ???
//          * @param {*} descr ???
//          * @param {*} usage ???
//          * @param {*} example ???
//          */
//         constructor(key, alias, descr, usage, example) {
//             this.fields = {key, alias, descr, usage, example};
//         }
//
//         /**
//          * @returns {string} ???
//          */
//         usage() {
//             const {key, usage} = this.fields;
//             return `-${key} ${usage}`;
//         }
//
//         /**
//          * @returns {string} ???
//          */
//         example() {
//             const {key, example} = this.fields;
//             return `-${key} ${example}`;
//         }
//     }
//     const args = [
//         new Arg(
//             'c',
//             'conf',
//             'absolute or relative to service.js path to config file',
//             '"path_to_config"',
//             '"./config.js"'
//         ),
//     ];
//
//     let argv = require('yargs') // eslint-disable-line global-require
//         .usage(`Usage: node . ${args.map(arg => arg.usage()).join(' ')}`)
//         .example(`node . ${args.map(arg => arg.example()).join(' ')}`)
//         .demandOption(args.map(arg => arg.fields.key))
//         .help('h')
//         .alias('h', 'help');
//
//     argv = args.reduce((result, arg) => {
//         const {key, alias, descr} = arg.fields;
//         return result.describe(key, descr).alias(key, alias);
//     }, argv).argv;
//
//     // eslint-disable-next-line import/no-dynamic-require, global-require
//     return require(path.join(ROOT_DIR, argv.conf));
// }

// const getTestConfig = function getTestConfig() {
//     // eslint-disable-next-line import/no-dynamic-require, global-require
//     return require('../../config.example');
// };

const composeConfig = function composeConfig(config) {
    // const removeTrailingSlash = R.replace(/\/$/, '');
    // const config = R.pipe(
    //     getConfigFn,
    //     filePath.replacePathWith(['jira', 'url'], removeTrailingSlash)
    // )();
    if (!validate(config)) {
        process.exit(1);
    }

    const matrix = Ramda.merge(config.matrix, {
        baseUrl: `https://${config.matrix.domain}`,
        userId: `@${config.matrix.user}:${config.matrix.domain}`,
    });

    const version = '2017-06-27';

    config.features.epicUpdates.on = () => (
        config.features.epicUpdates.newIssuesInEpic === 'on'
        || config.features.epicUpdates.issuesStatusChanged === 'on'
    );

    return Ramda.mergeAll([config, {matrix}, {version}]);
};

// const config = process.env.NODE_ENV === 'test' ?
//     composeConfig(getTestConfig) :
//     composeConfig(getConfig);

// @todo Need total freeze
const config = composeConfig(configData);

module.exports = config;
