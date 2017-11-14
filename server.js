var express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
var app = express()
var jwt = require('jwt-simple')
var auth = require('./auth.js')
var mysql = require('mysql')
var log4js = require('log4js')
var config = require('./config.js')

log4js.configure({
    appenders: { log: { type: 'file', filename: __dirname + '/external/gthx-server.log' },
                 out: { type: 'stdout' }},
    categories: { default: { appenders: ['log', 'out'], level: 'debug' } }
});

var logger = log4js.getLogger();

logger.info('GThx server version 0.1 running in environment: ' + config.env);

if (config.settings.logLevel){
    logger.info('Setting log level to ' + config.settings.logLevel);
    logger.level = config.settings.logLevel;
}

app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('hello world')
})

app.get('/factoids/:search', (req, res) => {
    logger.info('Factoid search for ' + req.params.search)
    
    auth.db.query("SELECT item, value, nick FROM factoids WHERE item LIKE ?", [req.params.search], function (err, result, fields) {
        if (err) throw err;

        res.send(result)
    })
})

app.use('/auth', auth.router)

var port = 3000
logger.info(`Server listening on port ${port}`)
app.listen(port);
