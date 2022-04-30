const config = require('./config.json');
const mysql = require('mysql2');
const e = require('express');
const con = mysql.createConnection(config);

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




function addAppointment(patientId, startDate, endDate) {
    // 1. Check who is making the appointment
    // AKA get patient_id for given patient_email
    // 2. Check if requested time is open (SELECT)
    // If open. add to db and send back success (INSERT)
    // If closed. send back error.

    const query1 = `SELECT * 
                    FROM appointments
                    WHERE start_date BETWEEN ? AND ?,
                        OR end_date BETWEEN ? AND ?
                `;

    const query2 = `
        INSERT INTO appointments (patient_id, start_date, end_date, notes, reason)
        VALUES (?, ?, ?, NULL, NULL)
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
            con.query(query2, [patientId, startDate, endDate], (err, res) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve("Appointment Scheduled")
                }
            });
        }
    });
}


/*

function cancelAppointment(patientId, datetime) {
    const query = `DELETE 
                   FROM appointments 
                   WHERE patient_id = ? AND appointment_date_time = ?
                   `;
    con.query(query, [patientId, datetime], (err, r) =>)


}*/

module.exports = {
    con,
    getAppointmentsByUser,
    getAppointmentsAll,
    checkCredentials,
    addAppointment,
}