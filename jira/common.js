const Ramda = require('ramda');
const {filePath} = require('../utils');
const appConfig = require('../app/modules/config');

/**
 * @returns {string} ???
 */
const auth = function auth() {
    const {user, password} = appConfig.jira;
    const encoded = new Buffer(`${user}:${password}`).toString('base64');
    return `Basic ${encoded}`;
};

/**
 * @param {Object} hook ???
 * @returns {*} ???
 */
const webHookUser = function webHookUser(hook) {
    const paths = [
        ['comment', 'author', 'name'],
        ['user', 'name'],
    ];
    return Ramda.pipe(
        Ramda.map(Ramda.path(Ramda.__, hook)),
        Ramda.find(filePath.nonEmptyString)
    )(paths);
};

const getChangelogField = Ramda.curry(
    (fieldName, hook) =>
        Ramda.ifElse(
            Ramda.is(Object),
            Ramda.pipe(
                Ramda.pathOr([], ['changelog', 'items']),
                Ramda.find(Ramda.propEq('field', fieldName))
            ),
            Ramda.always(null)
        )(hook)
);

module.exports = {
    auth,
    webHookUser,
    getChangelogField,
};
