const appConfig = require('../app/modules/config');
const {auth} = require('./common');
const {fetchJSON} = require('../utils');

const get = async function get(id) {
    const link = await fetchJSON(
        `${appConfig.jira.url}/rest/api/2/issueLink/${id}`,
        auth()
    );
    return link;
};

module.exports = {get};
