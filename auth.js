var bcrypt = require('bcrypt-nodejs')
var jwt = require('jwt-simple')
var express = require('express')
var router = express.Router()
var mysql = require('mysql')

var db=mysql.createConnection({
    host: "localhost",
    user: "gthxng",
    password: "I<3Angular!",
    database: "gthxNg"
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
                    createSendToken(res, userData.username)
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

    db.query("SELECT password FROM users WHERE username = ?", [loginData.username], function (err, result, fields) {
        if (err) throw err;
    
        if (result[0] != null){
            console.log('Found user with password: ' + result[0].password)

            bcrypt.compare(loginData.pwd, result[0].password, (err, isMatch) => {
                if (isMatch) {
                    createSendToken(res, loginData.username)
                    return
                }

                return res.status(401).send({ message: 'Email or Password invalid' })
            })
        }
    })
})

function createSendToken(res, username) {
    console.log('Creating and sending a token')
    var payload = { sub: username }

    var token = jwt.encode(payload, '123')

    res.status(200).send({ token })
}

var auth = {
    router,
    db,
    checkAuthenticated: (req, res, next) => {
        if (!req.header('authorization'))
            return res.status(401).send({ message: 'Unauthorized. Missing Auth Header' })

        var token = req.header('authorization').split(' ')[1]

        var payload = jwt.decode(token, '123')

        if (!payload)
            return res.status(401).send({ message: 'Unauthorized. Auth Header Invalid' })

        req.userId = payload.sub

        next()
    }
}
module.exports = auth