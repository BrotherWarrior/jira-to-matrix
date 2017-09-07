const Polyglot = require('node-polyglot');
const appConfig = require('../app/modules/config');

const lang = require(`./${appConfig.lang}.js`);

const polyglot = new Polyglot({
    phrases: lang.dict,
    locale: appConfig.lang,
});

module.exports.translate = function translate(key, values, ...args) {
    const newValues = lang.tValues ? lang.tValues(values, ...args) : values;
    return polyglot.t(key, newValues);
};
