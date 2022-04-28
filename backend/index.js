var mysql = require('mysql2');
const config = require('./config.json');
const express = require('express');
const session = require('express-session');
const path = require('path');
const port = 4040;
const process = require('process');
const db = require('./dbutil');



console.log("starting backend server");

var con = mysql.createConnection(config);


const app = express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('*', (req, res, next) => {
    console.log(req.body);
    next();
});

app.post('/login', async(req, res) => {
    // Capture the input fields
    const patient_email = req.body.email;
    const password = req.body.password;

    if (patient_email && password) {
        db.checkCredentials(patient_email, password).then(data => {
            res.json(data);
        }).catch(err => {
            res.status(401).json(err);
        });
    } else {
        res.status(401).json("Invalid userId or password.");
    }


});

app.get('/appointments/:userId', (req, res) => {
    db.getAppointmentsByUser(req.params.userId).then(rows => {
        res.json(rows);
    }).catch(err => {
        res.status(401).json(err);
    });
});

app.get('/appointments', (req, res) => {
    const authorized = true; // check if authorized
    if (authorized) {
        db.getAppointmentsAll().then(rows => {
            res.json(rows);
        }).catch(err => {
            res.status(401).json(err);
        });
    } else {
        res.status(401).json("Not authorized");
    }
});

app.get('/dashboard', function(request, response) {
    // If the user is loggedin
    if (request.session.loggedin) {
        // Output username
        response.sendFile(path.join(__dirname, '../dashboard.html'));
        response.send('Welcome back, ' + request.session.email_auth + '!');
    } else {
        // Not logged in
        response.send('Please login to view this page!');
    }
    response.end();
});

app.listen(port);


/*
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    //Insert a record in the "customers" table:
    var sql = "INSERT INTO patients (patient_fname, patient_lname, patient_address, patient_phone_number, password_hash, patient_email) VALUES ('Jacob', 'Attar', 'Highway 37', '619-434-4534', 'dog', 'patient_email@gmail.com')";
    con.query(sql, function(err, result) {
        if (err) throw err;
        console.log("1 record inserted");
    });
});

*/