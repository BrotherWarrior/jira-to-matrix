/* eslint camelcase: 0 */
const Ramda = require('ramda');
const names = require('ru-names');

/* spell-checker: disable */
const dict = Object.freeze({
    comment_created: 'добавил%{f} комментарий',
    comment_updated: 'изменил%{f} комментарий',
    issue_updated: 'изменил%{f} задачу',
    issueHasChanged: 'Задача изменена',
    statusHasChanged: '%{issue.key} "%{issue.fields.summary}" теперь в статусе "%{status}"',
    statusHasChangedMessage: '%{user.name} изменил%{f} статус связанной задачи [%{issue.key} "%{issue.fields.summary}"](%{issue.ref}) на **%{status}**',
    newIssueInEpic: 'Новая задача в эпике',
    issueAddedToEpic: 'К эпику добавлена задача [%{issue.key} %{issue.fields.summary}](%{issue.ref})',
    newLink: 'Новый линк',
    newLinkMessage: 'Новая связь, эта задача **%{relation}** [%{key} "%{summary}"](%{ref})',
});
/* spell-checker: enable */

const getGenderVerbEnding = function getGenderVerbEnding(fullName) {
    const getGender = Ramda.pipe(
        Ramda.split(/\s+/),
        Ramda.map(Ramda.pipe(Ramda.trim, Ramda.toLower)),
        Ramda.reduce((result, part) => {
            const gender = names[part];
            return gender ? Ramda.reduced(gender) : null;
        }, null)
    );
    return Ramda.pipe(
        Ramda.ifElse(Ramda.is(String), getGender, Ramda.always(null)),
        Ramda.prop(Ramda.__, {m: '', f: 'а'}), // eslint-disable-line id-length
        Ramda.defaultTo('(а)')
    )(fullName);
};

const tValues = function tValues(values, personName) {
    const ending = getGenderVerbEnding(personName);
    return Ramda.assoc('f', ending, values);
};

module.exports.dict = dict;
module.exports.tValues = tValues;
