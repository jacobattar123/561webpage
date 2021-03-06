var mysql = require('mysql2');
const config = require('./config.json');
const express = require('express');
const session = require('express-session');
const path = require('path');
const port = 4040;
const process = require('process');
const db = require('./dbutil');
const mathutil = require('./mathutil');
const cors = require('cors');



//Configuring CORS w/ Dynamic Origin
//First thing in the index file is that i check 
const whitelist = ["http://localhost:8080"];
const corsConfig = cors({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        } else if (whitelist.indexOf(origin) === -1) {
            let message = "This origin is not allowed";
            return callback(message, false);
        } else {
            return callback(null, true);
        }
    }
});

console.log("starting backend server");

const app = express();
app.use(corsConfig);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//postman syntax 
/*{

  "email":  "ja@email.com",
   "password": "password"
    
}*/

//************ Unauthenticated

//post login info to backend to verify email and password to login
app.post('/login', (req, res) => {
    // Capture the input fields
    const patient_email = req.body.email;
    const password = req.body.password;
    console.log(req.body)
    if (patient_email && password) {


        db.checkCredentials(patient_email, mathutil.generateHash(password)).then(data => {
            //at this point data is returned, but has old access token.
            //generate access token
            const token = mathutil.generateToken();
            db.addToken(data.id, token).then(result => {
                //reupdate the accesstoken
                data.access_token = token;
                //return data
                res.json(data);
            });
        }).catch(err => {
            res.status(401).json(err);
        });
    } else {
        res.status(401).json("No username enter");
    }
});

//
app.get('/login', (req, res) => {
    console.log(req.originalUrl)
    const passport = JSON.parse(req.headers.passport);
    if (!passport) {
        res.status(400).json("Not authenticated.");
        return;
    }
    db.verifyToken(passport.id, passport.access_token).then(data => {
        res.json("Already logged in.");
    }).catch(err => res.status(400).json("Not authenticated."))
});


//creating a new patient (registration)
app.post('/patients', (req, res) => {
    const newPatient = {...req.body };
    db.addPatient(newPatient).then(data => {
        res.json({
            message: "New user created."
        });
    }).catch(err => {
        console.log(err);
        res.status(401).json({
            message: "Unable to register user."
        });
    });
});
//************

app.all('*', (req, res, next) => {
    const passport = JSON.parse(req.headers.passport);
    if (!passport) {
        res.json("Not authenticated.");
        return;
    }
    db.verifyToken(passport.id, passport.access_token).then(data => {
        next();
    }).catch(err => res.json("Not authenticated."));
});


app.delete('/appointments/:appointmentId', async(req, res) => {
    const passport = JSON.parse(req.headers.passport);
    if (await db.isAdmin(passport.id)) {
        db.deleteAppointment(req.params.appointmentId).then(data => {
            res.json({
                message: `Successfully deleted appointment #${req.params.appointmentId}`
            });
        });
    } else {
        db.verifyAppointment(passport.id, req.params.appointmentId).then(data => {
            return db.deleteAppointment(req.params.appointmentId);
        }).then(data => {
            res.json({
                message: `Successfully deleted appointment #${req.params.appointmentId}`
            });
        }).catch(err => {
            console.log(err);
            res.status(400).json({ error: err });
        });
    }
});

app.delete('/admin/appointments/:patientId', async(req, res) => {
    const passport = JSON.parse(req.headers.passport);
    if (await db.isAdmin(passport.id)) {
        db.deleteAllAppointment(req.params.patientId).then(data => {
            res.json({
                message: `Successfully deleted patient appointments #${req.params.appointmentId}`
            });
        });
    } else {
        res.json("must be admin to delete all appointments");
    }
});

//get appointments for one particular patient
app.get('/appointments/:patientId', async(req, res) => {
    const passport = JSON.parse(req.headers.passport);
    if (await db.isAdmin(passport.id)) {
        db.getAppointmentsByUser(req.params.patientId).then(rows => {
            res.json(rows);
        }).catch(err => {
            res.status(401).json(err);
        });
    } else {
        if (passport.id == req.params.patientId) {
            db.getAppointmentsByUser(passport.id).then(rows => {
                res.json(rows);
            }).catch(err => {
                res.status(401).json(err);
            });
        } else {
            res.json("User trying to access another users data");
        }

    }
});



// add new appointment
app.post('/appointments', (req, res) => {
    // From the browser body
    const passport = JSON.parse(req.headers.passport);
    const start_date = req.body.start_date;
    const end_date = req.body.end_date;
    const notes = req.body.notes;
    const reason = req.body.reason;
    db.addAppointment(passport.id, start_date, end_date, notes, reason).then(data => {
        res.json(data);
    }).catch(err => {
        res.status(401).json(err);
    });
});


//get all appointments
app.get('/admin/appointments', async(req, res) => {
    const passport = JSON.parse(req.headers.passport);
    if (await db.isAdmin(passport.id)) {
        db.getAppointmentsAll().then(rows => {
            res.json(rows);
        }).catch(err => {
            res.status(401).json(err);
        });
    } else {
        res.status(401).json("Not authorized");
    }
});

//get all patients 
app.get('/admin/patients', async(req, res) => {
    const passport = JSON.parse(req.headers.passport);
    console.log(passport);
    if (await db.isAdmin(passport.id)) {
        db.getPatientsAll().then(rows => {
            res.json(rows);
        }).catch(err => {
            res.status(401).json(err);
        });
    } else {
        res.status(401).json("Not authorized");
    }
});

//get a particular patient
app.get('/admin/patient/:patientId', async(req, res) => {
    const passport = JSON.parse(req.headers.passport);
    console.log(passport);
    if (await db.isAdmin(passport.id)) {
        console.log("inside is admin check");
        db.getPatient(req.params.patientId).then(rows => {
            console.log("after function returns, rows:");
            console.log(rows);
            res.json(rows);
        }).catch(err => {
            res.status(401).json(err);
        });
    } else {
        res.status(401).json("Not authorized");
    }
});

//get patient info displaying on login
app.get('/patients/patient/:patientId', async(req, res) => {
    const passport = JSON.parse(req.headers.passport);
    console.log(passport);
    if (passport.id == req.params.patientId) {
        db.getPatientInfo(passport.id).then(rows => {
            res.json(rows);
        }).catch(err => {
            res.status(401).json(err);
        });
    } else {
        res.json("User trying to access another users data");
    }
});

//delete patient
app.delete('/admin/patients/:patientId', async(req, res) => {
    const passport = JSON.parse(req.headers.passport);
    if (await db.isAdmin(passport.id)) {
        db.deletePatient(req.params.patientId).then(data => {
            res.json({
                message: `Successfully deleted patient #${req.params.patientId}`
            });
        }).catch(err => {
            res.status(401).json(err);
        });
    } else {
        res.json("User is not admin, cannot delete patient.");
    }
});

app.put('/admin/appointment/notes', async(req, res) => {
    const passport = JSON.parse(req.headers.passport);
    if (await db.isAdmin(passport.id)) {
        db.addNote(req.body.note, req.body.appId).then(data => {
            res.json("Note added");
        }).catch(err => {
            res.status(401).json(err);
        });
    } else {
        res.json("User is not admin, cannot add note to patient.")
    }
})


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