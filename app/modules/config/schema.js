const jst = require('mobitel-json-schema-template');

// Config file schema
module.exports = {
    id: 'config',
    type: 'object',
    additionalProperties: false,
    required: [
        'port',
        'lang',
        'jira',
        'features',
        'usersToIgnore',
        'testMode',
        'redis',
        'ttm_minutes',
        'matrix',
        'log',
    ],
    properties: {
        port: jst.integer().min(1).done(),
        lang: jst.string().enum(['en', 'ru']).done(),
        jira: {
            type: 'object',
            additionalProperties: false,
            required: [
                'url',
                'user',
                'password',
            ],
            properties: {
                url: jst.string().min(1).done(),
                user: jst.string().min(0).done(),
                password: jst.string().min(0).done(),
            },
        },
        features: {
            type: 'object',
            additionalProperties: false,
            required: [
                'createRoom',
                'inviteNewMembers',
                'postComments',
                'postIssueUpdates',
                'epicUpdates',
                'newLinks',
                'postChangesToLinks',
            ],
            properties: {
                createRoom: jst.boolean(),
                inviteNewMembers: jst.boolean(),
                postComments: jst.boolean(),
                postIssueUpdates: jst.boolean(),
                epicUpdates: {
                    type: 'object',
                    additionalProperties: false,
                    required: [
                        'newIssuesInEpic',
                        'issuesStatusChanged',
                        'field',
                        'fieldAlias',
                    ],
                    properties: {
                        newIssuesInEpic: jst.string().enum(['on', 'off']).done(),
                        issuesStatusChanged: jst.string().enum(['on', 'off']).done(),
                        field: jst.string().min(0).done(),
                        fieldAlias: jst.string().min(0).done(),
                    },
                },
                newLinks: jst.boolean(),
                postChangesToLinks: {
                    type: 'object',
                    additionalProperties: false,
                    required: [
                        'on',
                        'ignoreDestStatusCat',
                    ],
                    properties: {
                        on: jst.boolean(),
                        ignoreDestStatusCat: jst.array().min(0).additional(false)
                            .items(
                                jst.integer().min(0).done()
                            )
                            .done(),
                    },
                },
            },
        },
        usersToIgnore: jst.array().min(0).additional(false)
            .items(
                jst.integer().min(0).done()
            )
            .done(),
        testMode: {
            type: 'object',
            additionalProperties: false,
            required: [
                'on',
                'users',
            ],
            properties: {
                on: jst.boolean(),
                users: jst.array().min(0).additional(false)
                    .items(
                        jst.string().min(0).done()
                    )
                    .done(),
            },
        },
        redis: {
            type: 'object',
            additionalProperties: false,
            required: [
                'host',
                'port',
                'prefix',
                'ttl',
            ],
            properties: {
                host: jst.string().min(1).done(),
                port: jst.integer().min(1).done(),
                prefix: jst.string().min(0).done(),
                // seconds
                ttl: jst.integer().min(1).done(),
            },
        },
        ttm_minutes: jst.integer().min(1).done(), // eslint-disable-line camelcase
        matrix: {
            type: 'object',
            additionalProperties: false,
            required: [
                'domain',
                'user',
                'password',
                'tokenTTL',
                'syncTimeoutSec',
            ],
            properties: {
                domain: jst.string().min(1).done(),
                user: jst.string().min(1).done(),
                password: jst.string().min(0).done(),
                // new token request interval, seconds
                tokenTTL: jst.integer().min(1).done(),
                // seconds
                syncTimeoutSec: jst.integer().min(1).done(),
            },
        },
        log: {
            type: 'object',
            additionalProperties: false,
            required: [
                'type',
                'filePath',
                'fileLevel',
                'consoleLevel',
            ],
            properties: {
                type: jst.string().enum(['console', 'file', 'both']).done(),
                filePath: jst.string().min(3).done(),
                fileLevel: jst.string().enum(['error', 'warn', 'info', 'verbose', 'debug', 'silly']).done(),
                consoleLevel: jst.string().enum(['error', 'warn', 'info', 'verbose', 'debug', 'silly']).done(),
            },
        },
    },
};
