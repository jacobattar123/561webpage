const config = require('./config.json');
const mysql = require('mysql2');
const e = require('express');
const con = mysql.createConnection(config);
const mathutil = require('./mathutil');

function getAppointmentsByUser(patientId) {
    const query1 = `
        SELECT appointments.*
        FROM patients, appointments
        WHERE patients.patient_email = ? AND patients.id = appointments.patient_id 
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

function getPatientsAll() {
    const query = `
        SELECT *
        FROM patients
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




async function addAppointment(patientId, startDate, endDate, notes = null, reason = null) {
    // 1. Check who is making the appointment
    // AKA get patient_id for given patient_email
    // 2. Check if requested time is open (SELECT)
    // If open. add to db and send back success (INSERT)
    // If closed. send back error.

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
                return reject(err);
            } else {
                return resolve(rows);
            }
        });
    }).catch(err => console.log(err));

    return new Promise((resolve, reject) => {
        if (bookedAppointments.length > 0) {
            return reject("May not schedule an appoint for an unavailable time slot");
        } else {
            con.query(query2, [patientId, startDate, endDate, notes, reason], (err, rows) => {
                console.log("rows returned: ", rows);
                if (err) {
                    return reject(err);
                } else {
                    return resolve("Appointment Scheduled")
                }
            });
        }
    });
}

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

module.exports = {
    con,
    getAppointmentsByUser,
    getAppointmentsAll,
    getPatientsAll,
    checkCredentials,
    addAppointment,
    deleteAppointment,
    addPatient,
    deletePatient,
    addToken,
    verifyToken,
    isAdmin,
    verifyAppointment,
}