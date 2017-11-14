var fs = require('fs');

var env = process.env.GTHX_ENV || 'dev';

// Use the file from inside the container by default
var configFile = './config-' + env + '.json';

// But if one exists from outside the container,
// use that instead
if (fs.existsSync('./external/config-' + env + '.json')) {
    configFile = './external/config-' + env + '.json';
}

console.log('Loading config file from ' + configFile);

// If require is done again, it loads from the cache instead
// of from the file. Switch to fs.readFile() if we need to
// read again
var settings = require(configFile);

module.exports = { settings, env}
