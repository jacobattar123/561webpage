const config = require('./config.json');
const mysql = require('mysql2');
const e = require('express');
const con = mysql.createConnection(config);
const mathutil = require('./mathutil');


//get all appointments for a particular user
function getAppointmentsByUser(patientId) {
    console.log(patientId);
    const query1 = `
        SELECT *
        FROM appointments
        WHERE patient_id = ? 
    `;
    return new Promise((resolve, reject) => {
        con.query(query1, [patientId], (err, rows) => {
            if (err) {
                return reject(err);
            } else {
                if (rows && rows.length) {
                    return resolve(rows);
                } else return reject(null);
            }
        });
    });
}



//get all appointments
function getAppointmentsAll() {
    const query = `
        SELECT * 
        FROM appointments
    `;
    return new Promise((resolve, reject) => {

        con.query(query, (err, rows) => {
            if (err) {

                return reject(err);
            } else {
                if (rows && rows.length) {

                    return resolve(rows);
                } else return reject(null);
            }
        });
    });
}


//get all patients
function getPatientsAll() {
    const query = `
        SELECT id, patient_lname, patient_fname, patient_address, patient_phone_number, patient_insurance_provider, patient_email
        FROM patients
    `;
    return new Promise((resolve, reject) => {
        console.log("Before query to database for patients");
        con.query(query, (err, rows) => {
            if (err) {
                console.log(err);
                return reject(err);
            } else {
                if (rows && rows.length) {
                    return resolve(rows);
                } else return reject(null);
            }
        });
    });
}

//get a particular patient
function getPatient(patientId) {
    console.log("before getPatient query");
    const query = `
                SELECT *
                FROM patients 
                WHERE id = ?
                `;

    return new Promise((resolve, reject) => {
        console.log(query);
        console.log(patientId);
        con.query(query, [patientId], (err, rows) => {
            if (err) {
                console.log("inside getPatient error");
                console.log(err);
                return reject(err);
            } else {
                console.log("inside else");
                console.log(rows);
                if (rows) {
                    console.log("logging patient info:");
                    return resolve(rows[0]);
                } else return reject(null);
            }
        })
    })

}

//check login credentials
function checkCredentials(userId, password) {
    const query = `
        SELECT * FROM patients
        WHERE patient_email = ? AND password_hash = ?
        `;
    return new Promise((resolve, reject) => {
        con.query(query, [userId, password], (err, rows) => {
            if (err) {
                return reject("Invalid userId or password."); //catch any error
            } else {
                if (rows && rows.length > 0) {
                    return resolve(rows[0]);
                } else return reject("Invalid userId or password."); //user does not exist
            }

        });
    });
}



//add an appointment
async function addAppointment(patientId, startDate, endDate, notes = null, reason = null) {

    const query1 = `SELECT * 
                    FROM appointments
                    WHERE start_date BETWEEN ? AND ?
                        OR end_date BETWEEN ? AND ?
                `;

    const query2 = `
        INSERT INTO appointments (patient_id, start_date, end_date, notes, reason)
        VALUES (?, ?, ?, ?, ?)
        `;
    const bookedAppointments = await new Promise((resolve, reject) => {
        con.query(query1, [startDate, endDate, startDate, endDate], (err, rows) => {
            if (err) {
                console.log("Add Appointment Error:", err);
                return reject(err);
            } else {
                console.log("first query done");
                return resolve(rows);
            }
        });
    }).catch(err => console.log(err));

    return new Promise((resolve, reject) => {
        if (bookedAppointments.length > 0) {
            console.log("May not schedule an appoint for an unavailable time slot");
            return reject("May not schedule an appoint for an unavailable time slot");
        } else {
            console.log("second query");
            con.query(query2, [patientId, startDate, endDate, notes, reason], (err, rows) => {
                console.log("rows returned: ", rows);
                if (err) {
                    console.log("error")
                    console.log(err);
                    return reject(err);
                } else {
                    return resolve("Appointment Scheduled")
                }
            });
        }
    });
}


//delete appointment
function deleteAppointment(id) {
    const query = `DELETE 
                   FROM appointments 
                   WHERE id = ?
                   `;
    return new Promise((resolve, reject) => {
        con.query(query, [id], (err, res) => {
            return resolve(res);
        });
    });
}


//add a patient
function addPatient(newPatient) {
    const {
        patient_fname,
        patient_lname,
        patient_address,
        patient_phone_number,
        patient_insurance_provider,
        password,
        patient_email
    } = newPatient;
    const query = `
        INSERT INTO patients (patient_fname, patient_lname, patient_address, patient_phone_number, patient_insurance_provider, password_hash, patient_email)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
        con.query(query, [
            patient_fname,
            patient_lname,
            patient_address,
            patient_phone_number,
            patient_insurance_provider,
            mathutil.generateHash(password),
            patient_email
        ], (err, res) => {
            if (err) {
                return reject();
            }
            return resolve(res);
        });
    });
}


//delete patient
function deletePatient(id) {
    const query = `DELETE 
                   FROM patients 
                   WHERE id = ?
                   `;
    return new Promise((resolve, reject) => {
        con.query(query, [id], (err, res) => {
            return resolve(res);
        });
    });
}


//add token
function addToken(id, token) {
    const query = `
        UPDATE patients
        SET access_token = ?
        WHERE id = ?
    `;
    return new Promise((resolve, reject) => {
        con.query(query, [token, id], (err, res) => {
            if (err) {
                return reject();
            }
            //what does this res return?
            return resolve(res);
        })
    });
}

function verifyToken(id, token) {
    const query = `
        SELECT *
        FROM patients
        WHERE id = ? AND access_token = ?
    `;
    return new Promise((resolve, reject) => {
        con.query(query, [id, token], (err, rows) => {
            if (err || rows.length == 0) {
                return reject();
            }
            return resolve(rows);
        });
    });
}

function isAdmin(patientId) {
    const query = `
        SELECT *
        FROM patients
        WHERE id = ? AND is_admin=1
    `;
    return new Promise((resolve, reject) => {
        con.query(query, [patientId], (err, rows) => {
            if (err) {
                return reject(err);
            } else if (rows.length == 0) {
                return resolve(false);
            } else {
                return resolve(true);
            }
        });
    });
}

function verifyAppointment(patientId, appointmentId) {
    const query = `
        SELECT *
        FROM appointments
        WHERE id = ? AND patient_id = ?
    `;
    return new Promise((resolve, reject) => {
        con.query(query, [appointmentId, patientId], (err, rows) => {
            if (err || rows.length == 0) {
                return reject("Invalid appointment id.");
            }
            return resolve(rows[0]);
        });
    });
}


function addNote(note, appId) {
    const query = `
        UPDATE appointments
        SET notes = ?
        WHERE id = ? 
    `;

    return new Promise((resolve, reject) => {
        con.query(query, [note, appId], (err, rows) => {
            if (err) {
                console.log("update notes error:", err);
                return reject(err);
            } else {
                console.log("update notes success: ", rows);
                return resolve(rows[0]);
            }
        })
    })
}

module.exports = {
    con,
    getAppointmentsByUser,
    getAppointmentsAll,
    getPatientsAll,
    getPatient,
    checkCredentials,
    addAppointment,
    deleteAppointment,
    addPatient,
    deletePatient,
    addToken,
    verifyToken,
    isAdmin,
    verifyAppointment,
    addNote
}