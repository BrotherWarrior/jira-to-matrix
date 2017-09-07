/** Utilities for application */
class AppUtilities {
    /**
     * @param {object} obj Object fo check property
     * @param {string} keyName Property name
     * @returns {*} TRUE if property exist< or FALSE
     */
    has(obj, keyName) {
        return Object.prototype.hasOwnProperty.call(obj, keyName);
    }

    /**
     * @param {*} value Checked value
     * @returns {Boolean} TRUE if value is object, or FALSE
     */
    isObject(value) {
        return value !== null && (value.constructor === Object || value instanceof Object);
    }

    /**
     * @param {*} value Checked value
     * @returns {Boolean} TRUE if value is float number, or FALSE
     */
    isFloat(value) {
        return Number(value) === value && value % 1 !== 0;
    }

    /**
     * @param {*} value Value for transform
     * @returns {boolean} Boolean from value
     */
    toBoolean(value) {
        return Boolean(value);
    }

    /**
     * @param {*} value Value for transform
     * @returns {Number|Null} Correct number, or NULL
     */
    toInteger(value) {
        const int = parseInt(value, 10);
        return Number.isNaN(int) ? null : int;
    }

    /**
     * @param {*} value Value for transform
     * @returns {Number|Null} Correct float number, or NULL
     */
    toFloat(value) {
        const float = parseFloat(value);
        return Number.isNaN(float) ? null : float;
    }

    /**
     * @param {*} value Value for transform
     * @returns {Number|Null} Correct rounded number, or NULL
     */
    toRoundInt(value) {
        const round = parseFloat(value);
        return Number.isNaN(round) ? null : Math.round(round);
    }

    /**
     * @param {*} value Value for transform
     * @returns {Date|Null} Correct date, or NULL
     */
    toDate(value) {
        const parsedDate = Date.parse(value);
        return parsedDate ? new Date(parsedDate) : null;
    }

    /**
     * @param {*} value Value for transform
     * @returns {Object|Null} Not empty object, or NULL
     */
    toObject(value) {
        const self = this;
        return (self.isObject(value) && Object.keys(value).length) ? value : null;
    }

    /**
     * @param {*} value Value for transform
     * @returns {Array|Null} Not empty array, or NULL
     */
    toArray(value) {
        return (Array.isArray(value) && value.length) ? value : null;
    }

    /**
     * @param {*} value Value for transform
     * @returns {String|Null} Not empty string, or NULL
     */
    toString(value) {
        return String(value).trim() || null;
    }

    /**
     * Transform to simple types using the type name
     * @param {*} value Source value
     * @param {String} type Type name for transform
     * @returns {*} Correct and not empty value, or string from value
     */
    typification(value, type) {
        const self = this;

        switch (type) {
            case 'boolean': {
                return self.toBoolean(value);
            }
            case 'integer': {
                return self.toInteger(value);
            }
            case 'float': {
                return self.toFloat(value);
            }
            case 'round': {
                return self.toRoundInt(value);
            }
            case 'date': {
                return self.toDate(value);
            }
            case 'object': {
                return self.toObject(value);
            }
            case 'array': {
                return self.toArray(value);
            }
            default: {
                return self.toString(value);
            }
        }
    }

    /**
     * @param {Number} min Minimum value for random number generation
     * @param {Number} max Maximum value for random number generation
     * @returns {Number} Random generated number
     */
    randomInt(min = 1, max = 10) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * @param {String} string String for modification
     * @returns {String} String with first letter in lowercase
     */
    firstLetterToLowerCase(string) {
        return string[0].toLowerCase() + string.substr(1);
    }
}

module.exports = new AppUtilities();
