const Ramda = require('ramda');
const semver = require('semver');
const log = require('../utils/log.js')(module);
const {engines} = require('../package.json');

module.exports = function checkNodeVersion() {
    const version = Ramda.is(Object, engines) ? engines.node : null;
    if (!version) {
        log.error('cannot find required Node version in package.json');
        return false;
    }
    if (!semver.satisfies(process.version, version)) {
        log.error(`Required node version ${version} not satisfied with current version ${process.version}.`);
        return false;
    }
    return true;
};
