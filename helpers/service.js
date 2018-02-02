'use strict';

const timestamp = require('time-stamp');
const c = require('cli-color');

/*
 * @param {String} message Console message
 * @param {String} messageType Can be the following: 'info', 'warning', 'error', 'highlight'
 */
const log = (message, messageType = 'info') => {
    let formattedDate = timestamp('YYYY-MM-DD HH:mm:ss');
    let types = {
        info: 'white',
        warning: 'yellow',
        error: 'red',
        highlight: 'cyan'
    };

    if (message) {
        console.log([
            c.blackBright(formattedDate),
            c[types[messageType]](message)
        ].join(' '));
    }
};

/*
 * @param {String} message Error message
 * @param {Number} code Error code
 */
const exitWithError = (message, code) => {
    if (message) {
        console.error(message);
    }
    process.exit(code || 1);
};

module.exports = {
    log: log,
    exitWithError: exitWithError
};
