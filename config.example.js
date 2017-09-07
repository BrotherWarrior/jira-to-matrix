/* eslint camelcase: 0 */
module.exports = Object.freeze({
    // where to listen JIRA webhooks
    port: 4100,
    // a language bot talks to users in
    lang: 'en',
    jira: {
        url: 'https://jira.example.org',
        user: 'bot',
        password: 'key',
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
            // Not to post to closed issues (3 - id of status category "Done")
            ignoreDestStatusCat: [3],
        },
    },
    // useful for testing, add a test user into production config
    usersToIgnore: ['jira_test'],
    testMode: {
        on: true,
        users: ['ivan', 'masha'],
    },
    redis: {
        host: '127.0.0.1',
        port: 6379,
        prefix: 'jira-hooks:',
        // seconds (30 days here)
        ttl: 60 * 60 * 24 * 30,
    },
    // time-to-matter, how long to re-try digesting jira hooks
    ttm_minutes: 60,
    matrix: {
        domain: 'matrix.example.org',
        // short name, before colon, without @
        user: 'bot',
        password: 'key',
        // new token request interval (10 minutes here)
        tokenTTL: 10 * 60,
        // seconds
        syncTimeoutSec: 20,
    },
    log: {
        type: 'console',
        filePath: 'logs/jira_bot',
        fileLevel: 'silly',
        consoleLevel: 'silly',
    },
});
