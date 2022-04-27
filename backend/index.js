var mysql = require('mysql');
const config = require('./config.json');
const express = require('express');
const session = require('express-session');
const path = require('path');
const port = 8080;
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
app.use(express.static(path.join(__dirname, 'static')));

app.post('/auth', function(request, response) {
    // Capture the input fields
    const patient_email = request.body.email_auth;
    const password = request.body.password_auth;
    // Ensure the input fields exists and are not empty
    if (patient_email && password) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        con.query('SELECT * FROM patients WHERE patient_email = ? AND password_hash = ?', [patient_email, password], (error, results, fields) => {
            // If there is an issue with the query, output the error
            if (error) {
                console.log(error);
                //throw error;  
            }
            console.log(results);
            // If the account exists           
            if (results.length > 0) {
                // Authenticate the user
                request.session.loggedin = true;
                console.log("loggedin = true");
                request.session.email_auth = patient_email;
                // Redirect to home page
                console.log("Current working directory: ",
                    process.cwd());
                response.redirect('/dashboard');
                console.log("Current working directory: ",
                    process.cwd());
            } else {
                response.send('Incorrect Username and/or Password!');
                console.log("incorrect Email or Password");
            }
            response.end();
        });
    } else {
        response.send('Please enter Username and Password!');
        response.end();
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