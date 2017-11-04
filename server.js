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


app.use('/auth', auth.router)
app.listen(3000);
