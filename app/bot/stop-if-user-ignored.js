const appConfig = require('../../app/modules/config');
const {webHookUser} = require('../../jira');

const shouldIgnore = (body, conf) => {
    const username = webHookUser(body);
    return {
        username,
        ignore: username && (
            conf.usersToIgnore.includes(username) ||
            (conf.testMode.on && !conf.testMode.users.includes(username))
        ),
    };
};

module.exports = function middleware(req, res, next) {
    const {ignore, username} = shouldIgnore(req.body, appConfig);
    if (ignore) {
        res.end(`User "${username}" ignored according to config`);
        return;
    }
    next();
};
