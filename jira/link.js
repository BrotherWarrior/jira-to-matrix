const config = require('../config');
const {auth} = require('./common');
const {fetchJSON} = require('../utils');

const get = async function get(id) {
    const link = await fetchJSON(
        `${config.jira.url}/rest/api/2/issueLink/${id}`,
        auth()
    );
    return link;
};

module.exports = {get};
