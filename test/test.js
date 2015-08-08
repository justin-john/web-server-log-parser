var assert = require('assert');
/**
 * Require Calculate Module with arguments "server log file path" and "variable to check test is
 * running or not and suppress the console prints"
 *
 * @param {String} FilePath
 * @param {Boolean} Variable
 * return {Object}
 *
 **/
var data = require('../calculate')(__dirname + '/test.log', true);

assert.ok(data);
assert.equal(data.countPendingMsg.count, 3);
assert.equal(data.countPendingMsg.dyno, 'web.12');

assert.equal(data.postUser.count, 3);
assert.equal(data.postUser.dyno, 'web.6');


