const common = require('./common');
const issue = require('./issue');
const epic = require('./epic');
const link = require('./link');

module.exports = Object.assign(
    common,
    {issue},
    {epic},
    {link}
);
