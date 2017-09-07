const ZSchema = require('z-schema');
const zSchemaError = require('mobitel-zschema-readable-error');
const appUtil = require('./app-util.js');

/** JSON schema workflow */
class JsonSchema {
    /** Class constructor */
    constructor() {
        this._CLASS = this.constructor.name.toString();

        try {
            this.validator = new ZSchema({
                noEmptyArrays: true,
                noEmptyStrings: true,
                noTypeless: true,
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * @param {Object} json JSON data for validation
     * @param {String} schema JSON-schema for validation
     * @returns {Promise} Resolve with validated data, reject with error
     */
    validate(json, schema) {
        const self = this;

        return new Promise((resolve, reject) => {
            if (!appUtil.isObject(schema)) {
                reject(`Incorrect JSON schema for validation`);
            }

            if (!appUtil.isObject(json)) {
                reject(`Incorrect JSON data for validation`);
            }

            self.validator.validate(json, schema, error => {
                if (error) {
                    const errorText = zSchemaError(error);
                    return reject(errorText);
                }

                resolve(json);
            });
        });
    }

    /**
     * @param {Object} json JSON data for validation
     * @param {String} schema JSON-schema for validation
     * @returns {{success: boolean, error: (string|null)}} Object with validation result
     */
    validateSync(json, schema) {
        const self = this;

        if (!appUtil.isObject(schema)) {
            return {
                success: false,
                error: `Incorrect JSON schema for validation`,
            };
        }

        if (!appUtil.isObject(json)) {
            return {
                success: false,
                error: `Incorrect JSON data for validation`,
            };
        }

        if (!self.validator.validate(json, schema)) {
            const errors = self.validator.getLastErrors();
            const errorText = zSchemaError(errors);
            return {
                success: false,
                error: errorText,
            };
        }

        return {
            success: true,
            error: null,
        };
    }
}

module.exports = new JsonSchema();
