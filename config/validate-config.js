/* eslint no-console: off */
const Joi = require('joi');

const int = Joi.number().integer().required();
const string = Joi.string().required();
const boolean = Joi.boolean().required();
const address = [string.uri(), string.ip()];
const obj = fields => Joi.object(fields).required();
const array = itemsType => Joi.array().items(itemsType);

const schema = obj({
    port: int,
    lang: ['en', 'ru'],
    jira: obj({
        url: address,
        user: string,
        password: string,
    }),
    features: obj({
        createRoom: boolean,
        inviteNewMembers: boolean,
        postComments: boolean,
        postIssueUpdates: boolean,
        epicUpdates: obj({
            newIssuesInEpic: ['on', 'off'],
            issuesStatusChanged: ['on', 'off'],
            field: string,
            fieldAlias: string,
        }),
        newLinks: boolean,
        postChangesToLinks: obj({
            on: boolean,
            // Not to post to closed issues (3 - id of status category "Done")
            ignoreDestStatusCat: array(Joi.number().integer()),
        }),
    }),
    usersToIgnore: array(Joi.string()),
    testMode: obj({
        on: boolean,
        users: array(Joi.string()),
    }),
    redis: obj({
        host: string,
        port: int,
        prefix: string,
        ttl: int,
    }),
    ttm_minutes: int, // eslint-disable-line camelcase
    matrix: obj({
        domain: string,
        user: string,
        password: string,
        tokenTTL: int,
        syncTimeoutSec: int,
    }),
    log: obj({
        type: string,
        filePath: string,
        fileLevel: string,
        consoleLevel: string,
    }),
});

/**
 * @param {object} config Config object for validation
 * @returns {boolean} TRUE if config valid, else FALSE
 */
const validate = function validate(config) {
    const options = {
        abortEarly: false,
        convert: false,
    };
    const {error} = Joi.validate(config, schema, options);
    if (error) {
        console.error('Config is invalid:');
        error.details.forEach(detail => {
            console.error(`  - ${detail.path}: ${detail.message}`);
        });

        return false;
    }
    return true;
};

module.exports = validate;
