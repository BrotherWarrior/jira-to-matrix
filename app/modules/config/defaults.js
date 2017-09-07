module.exports = {
    port: 4100,
    lang: 'en',
    jira: {
        url: '',
        user: '',
        password: '',
    },
    features: {
        createRoom: true,
        inviteNewMembers: true,
        postComments: true,
        postIssueUpdates: true,
        epicUpdates: {
            newIssuesInEpic: 'on',
            issuesStatusChanged: 'on',
            field: 'customfield_10006',
            fieldAlias: 'Epic Link',
        },
        newLinks: true,
        postChangesToLinks: {
            on: true,
            ignoreDestStatusCat: [3],
        },
    },
    usersToIgnore: [],
    testMode: {
        on: true,
        users: [''],
    },
    redis: {
        host: '127.0.0.1',
        port: 6379,
        prefix: '',
        // seconds
        ttl: 60 * 60 * 24 * 30,
    },
    ttm_minutes: 60, // eslint-disable-line camelcase
    matrix: {
        domain: '',
        user: '',
        password: '',
        // new token request interval, seconds
        tokenTTL: 60 * 10,
        // seconds
        syncTimeoutSec: 10,
    },
    log: {
        type: 'console',
        filePath: 'logs/jira_bot',
        fileLevel: 'silly',
        consoleLevel: 'silly',
    },
};
