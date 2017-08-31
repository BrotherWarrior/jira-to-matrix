const Polyglot = require('node-polyglot');
const conf = require('../config');

const lang = require(`./${conf.lang}.js`);

const polyglot = new Polyglot({
    phrases: lang.dict,
    locale: conf.lang,
});

module.exports.translate = function translate(key, values, ...args) {
    const newValues = lang.tValues ? lang.tValues(values, ...args) : values;
    return polyglot.t(key, newValues);
};
