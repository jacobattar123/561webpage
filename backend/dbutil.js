const config = require('./config.json');
const mysql = require('mysql2');
const con = mysql.createConnection(config);

function getAppointmentsByUser(patientId) {
    const query = `
        SELECT appointments.*
        FROM patients, appointments
        WHERE patients.patient_email = ? AND patients.id = appointments.patient_id 
    `;
    return new Promise((resolve, reject) => {
        con.query(query, [patientId], (err, rows) => {
            if (err) {
                return reject(err);
            } else {
                if (rows && rows.length) {
                    return resolve(rows);
                } else reject(null);
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
                } else reject(null);
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
                reject("Invalid userId or password.");
            } else {
                if (rows && rows.length > 0) {
                    resolve(rows[0]);
                }
            }
            reject("Invalid userId or password.");
        });
    });
}

module.exports = {
    con,
    getAppointmentsByUser,
    getAppointmentsAll,
    checkCredentials,
}