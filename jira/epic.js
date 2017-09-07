const appConfig = require('../app/modules/config');
const {auth} = require('./common');
const {fetchJSON, paramsToQueryString} = require('../utils');

const issuesIn = async function issuesIn(epicKey) {
    const searchField = appConfig.features.epicUpdates.fieldAlias;
    const params = [
        {jql: `"${searchField}"=${epicKey}`},
        {fields: '""'},
        {maxResults: 500},
    ];
    const obj = await fetchJSON(
        `${appConfig.jira.url}/rest/api/2/search/${paramsToQueryString(params)}`,
        auth()
    );
    if (!(obj instanceof Object)) {
        return;
    }
    return obj.issues || [];
};

module.exports = {issuesIn};
