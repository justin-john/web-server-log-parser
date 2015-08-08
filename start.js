console.log('\nStarting server log file data parsing.... ');

/**
 * Require Calculate Module with arguments "server log file path" and "variable to check test is
 * running or not and suppress the console prints"
 *
 * @param {String} FilePath
 * @param {Boolean} Variable
 * return {Object}
 *
 **/

require('./calculate')('sample.log');

console.log('Finished server log file data parsing. \n');