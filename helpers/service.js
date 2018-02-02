'use strict';

const moment = require('moment');
const colors = require('./colors');

/*
 * @param {String} text A string which needs to be colorized
 * @param {String} alter Alternate the text with color or light. Available values:
    dim, bright, black, red, green, yellow, blue, magenta, cyan, white
 */
const formatText = (text = '', alter = 'dim') => {
    let format = {
        reset: colors.reset,
        dim: colors.dim,
        bright: colors.bright,
        black: colors.fgBlack,
        red: colors.fgRed,
        green: colors.fgGreen,
        yellow: colors.fgYellow,
        blue: colors.fgBlue,
        magenta: colors.fgMagenta,
        cyan: colors.fgCyan,
        white: colors.fgWhite
    };

    return (format[alter] || format.dim) + text + format.reset;
};

/*
 * @param {String} message Console message
 * @param {String} messageType Can be the following: 'info', 'warning', 'error', 'highlight'
 */
const log = (message, messageType = 'info') => {
    let formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    let types = {
        info: 'dim',
        warning: 'yellow',
        error: 'red',
        highlight: 'green'
    };

    if (message) {
        console.log(`${formattedDate} ${formatText(message, types[messageType])}`);
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
