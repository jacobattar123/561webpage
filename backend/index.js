var mysql = require('mysql2');
const config = require('./config.json');
const express = require('express');
const session = require('express-session');
const path = require('path');
const port = 8888;
const process = require('process');

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

    // Ensure the input fields exists and are not empty
    if (patient_email && password) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        const query = `
        SELECT * FROM patients
        WHERE patient_email = ? AND password_hash = ?
        `;
        con.query(query, [patient_email, password], (err, rows) => {
            if (err) {
                console.log(err);
                // send error response to client
                return;
            } else {
                if (rows && rows.length > 0) {
                    console.log(rows[0]);
                    // user is valid. proceed with authentication oauth with bearer tokens
                } else {
                    res.status(401).json({
                        message: "Invalid username or password."
                    });
                }
            }
        });
    } else {
        res.status(401).json({
            message: "Invalid username or password."
        });
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