var express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
var app = express()
var jwt = require('jwt-simple')
var auth = require('./auth.js')
var mysql = require('mysql')

app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('hello world')
})

app.get('/factoids/:search', (req, res) => {
    console.log('Factoid search for ' + req.params.search)
    
    auth.db.query("SELECT item, value, nick FROM factoids WHERE item LIKE ?", [req.params.search], function (err, result, fields) {
        if (err) throw err;

        res.send(result)
    })
})

app.use('/auth', auth.router)
app.listen(3000);
