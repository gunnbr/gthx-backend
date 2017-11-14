var bcrypt = require('bcrypt-nodejs')
var jwt = require('jwt-simple')
var express = require('express')
var router = express.Router()
var mysql = require('mysql')
var config = require('./config.js')

var db=mysql.createConnection({
    host: config.settings.dbHost,
    user: config.settings.dbUser,
    password: config.settings.dbPassword,
    database: config.settings.dbDatabase
});

db.connect(function(err) {
    if (err) {
        console.log('Failed to connect to the DB: ' + err);
    } else {
    console.log("Connected to the database");
    }
});

router.post('/register', (req, res) => {
    var userData = req.body

    console.log('Attempting to register new user: ' + userData.username)

    db.query("SELECT username FROM users WHERE username = ?", [userData.username], function (err, result, fields) {
        if (err) throw err;
    
        if (result[0] != null){
            console.log('User already exists: ' + result)
            return res.status(409).send({ message: 'User already exists' })            
        }

        console.log('User does not already exist. Creating...')
        
        bcrypt.hash(userData.password, null, null, (err, hash) => {
            if(err) throw err;
    
            userData.password = hash

            console.log('Password hashed to: ' + userData.password)
            
            var sql = "INSERT INTO users (realname, username, email, password, creationdate) VALUES (?,?,?,?,NOW())";
            db.query(sql, 
                [userData.realname, userData.username, userData.email, userData.password],
                function (err, result, fields) {
                    if (err) {
                        console.log('Error creating user: ' + err)
                        throw err;
                    }
                    console.log('Result: ' + result);
                    console.log('Fields: ' + fields);
                    console.log('User created successfully')
                    var permissions = {
                        canEditFactoids: 0,
                        canCreateUsers: 0,
                        canLockFactoids: 0
                    }

                    createSendToken(res, userData.username, permissions)
                });
            })
    })
})

router.post('/login', async (req, res) => {
    console.log('Login request for ' + JSON.stringify(req.body))
    var loginData = req.body
    if (!loginData.username || !loginData.pwd){
        return res.status(400).send({ message: 'Missing login data' })
    }

    console.log('Login attempted for user ' + loginData.username)

    db.query("SELECT password,canEditFactoids,canLockFactoids,canCreateUsers FROM users WHERE username = ?", [loginData.username], function (err, result, fields) {
        if (err) throw err;

        var userData = result[0];

        if (userData != null){
            console.log('Found user with password: ' + userData.password)
            console.log(JSON.stringify(userData))

            bcrypt.compare(loginData.pwd, userData.password, (err, isMatch) => {
                if (isMatch) {
                    var permissions = {
                        canEditFactoids: userData.canEditFactoids,
                        canCreateUsers: userData.canCreateUsers,
                        canLockFactoids: userData.canLockFactoids
                    }
                    createSendToken(res, loginData.username, permissions)
                    return
                }

                return res.status(401).send({ message: 'Email or Password invalid' })
            })
        }
    })
})

function createSendToken(res, username, permissions) {
    console.log('Creating and sending a token')
    var payload = { sub: username }

    var token = jwt.encode(payload, config.settings.jwtKey)
    res.status(200).send({ token: token, permissions })
}

var auth = {
    router,
    db,
    checkAuthenticated: (req, res, next) => {
        if (!req.header('authorization'))
            return res.status(401).send({ message: 'Unauthorized. Missing Auth Header' })

        var token = req.header('authorization').split(' ')[1]

        var payload = jwt.decode(token, config.settings.jwtKey)

        if (!payload)
            return res.status(401).send({ message: 'Unauthorized. Auth Header Invalid' })

        req.userId = payload.sub

        next()
    }
}
module.exports = auth