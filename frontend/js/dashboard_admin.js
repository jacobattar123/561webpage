// Check if user is logged in:



fetch(`${api_path}/login`, {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'passport': localStorage.getItem('passport')
        },
    }).then(res => {
        if (!res.ok) {
            window.location.href = "login.html";
        }
    })
    .catch(err => {
        console.log("my error: ", err);
    });

//fetch todays appointments
fetch(`${api_path}/admin/appointments`, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'passport': localStorage.getItem('passport'),
        },
    })
    .then(res => res.json())
    .then(data => {
        const deta = {...data };
        today = new Date();
        today = today.toDateString();
        let newArray = [];
        for (let i = 0; i < data.length; i++) {
            let appointment = new Date(deta[i].start_date);
            appointment = appointment.toDateString();
            if (today == appointment) {
                newArray.push(deta[i]);
            }
        }
        loadAppointments(newArray);
    }).catch(err => {
        console.log("my error: ", err);
    });

const passport = JSON.parse(localStorage.getItem('passport'));

//fetch all patients
fetch(`${api_path}/admin/patients`, {
        headers: { // next two lines 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'passport': localStorage.getItem('passport'),
        },
    })
    .then(res => res.json())
    .then(data => {
        const deta = {...data };
        let newArray = [];
        for (let i = 0; i < data.length; i++) {
            let patient = deta[i];
            newArray.push(patient);
            console.log(newArray);
        }
        console.log(newArray);
        let sorted = newArray.sort((a, b) => (a.patient_lname > b.patient_lname) ? 1 : -1);
        loadPatients(sorted);
    }).catch(err => {
        console.log("my error: ", err);
    });


/*
    let sorted = data.sort((a, b) => (new Date(a.start_date) > new Date(b.start_date) ? 1 : -1));
    console.log(sorted);
    loadAppointments(data);

*/

//I think this can be deleted. Dont think we are using this anymore?
window.addEventListener("load", () => {
    if (!isLoggedIn) {
        window.location.href = "login.html";
    }
});

function loadAppointments(data) {
    let source = {
        data: data.map(el => {
            let output = {...el };
            output.start_date = new Date(output.start_date).toLocaleString();
            output.end_date = new Date(output.end_date).toLocaleTimeString();
            return output;
        })
    };
    let template =
        "{{#data}}" +
        "<tr>" +
        "<td>Appointment Id: {{id}}</td> " +
        "<td>{{patient_id}}</td> " +
        "<td>{{start_date}} - {{end_date}}</td> " +
        "<td>{{reason}}</td> " +
        "<td>{{notes}}</td> " +
        "<td>" +
        `<input type="button" value="Cancel" onclick="cancelAppointment({{id}})">` +
        "</td>" +
        "</tr>" +
        "{{/data}}"
    let output = Mustache.render(template, source);
    document.getElementById("appointments_today").innerHTML = output;
}


function patientLookupAppointments(data) {

    let source = {
        data: data.map(el => {
            let output = {...el };
            output.start_date = new Date(output.start_date).toLocaleString();
            output.end_date = new Date(output.end_date).toLocaleTimeString();
            return output;
        })
    };
    let template =
        "{{#data}}" +
        "<tr>" +
        "<td>{{id}}</td> " +
        "<td>{{start_date}} - {{end_date}}</td> " +
        "<td>{{reason}}</td> " +
        "<td>{{notes}}</td> " +

        "<td>" +
        "</td>" +
        `<input type="text" id="txt_note{{id}}" name="txt_note{{id}}">` +
        `<input type="button" value="Add Note" onclick="addNote({{id}}, document.getElementById('txt_note{{id}}').value)">` +
        "</tr>" +
        "</tr>" +
        "{{/data}}"
    let output = Mustache.render(template, source);
    document.getElementById("appointments_selected_patient").innerHTML = output;
}

function loadPatients(data) {
    let source = {
        data: data.map(el => {
            let output = {...el };
            return output;
        })
    };
    let template =
        "{{#data}}" +
        "<tr>" +
        "<td>" + `<input type="button" value="Select" onclick="patientLookup({{id}})">` + "</td>" +
        "<td>{{id}}</td> " +
        "<td>{{patient_fname}}</td> " +
        "<td>{{patient_lname}}</td> " +
        "<td>{{patient_address}}</td> " +
        "<td>{{patient_phone_number}}</td> " +
        "<td>{{patient_insurance_provider}}</td> " +
        "<td>{{patient_email}}</td> " +
        "<td>" +
        `<input type="button" value="Delete Patient" onclick="">` +
        "</td>" +
        "</tr>" +
        "{{/data}}"
    let output = Mustache.render(template, source);
    document.getElementById("patients").innerHTML = output;
}


//load single patient data
function loadOnePatient(data) {
    let source = {
        data: data.map(el => {
            let output = {...el };
            return output;
        })
    };
    let template =
        "{{#data}}" +
        "<tr>" +
        "<td>{{id}}</td> " +
        "<td>{{patient_fname}}</td> " +
        "<td>{{patient_lname}}</td> " +
        "<td>{{patient_address}}</td> " +
        "<td>{{patient_phone_number}}</td> " +
        "<td>{{patient_insurance_provider}}</td> " +
        "<td>{{patient_email}}</td> " +
        "<td>" +
        `<input type="button" value="Delete Patient" onclick="">` +
        "</td>" +
        "{{/data}}"
    let output = Mustache.render(template, source);
    document.getElementById("patient_selected").innerHTML = output;
}

function cancelAppointment(id) {
    console.log(`${api_path}/appointments/${id}`);
    fetch(`${api_path}/appointments/${id}`, {
        method: "DELETE",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'passport': localStorage.getItem('passport')
        }
    }).then(data => {
        location.reload();
        alert("Appointment Has Been Cancelled.");
    }).catch(err => {
        alert(err);
        console.log("my error: ", err);
    });
}


function patientLookup(patientId) {
    //let patientId = document.getElementById("txt_patient_id").value;
    console.log("getting request for patientLookup");

    //get appointments
    fetch(`${api_path}/appointments/${patientId}`, {
        method: "GET",
        headers: { // next two lines 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'passport': localStorage.getItem('passport'),
        }
    }).then(res => res.json()).then(data => {
        const deta = {...data };
        console.log("deta:", deta);
        let newArray = [];
        if (Object.keys(deta).length == 0) {
            patientLookupAppointments(newArray);
        } else {
            for (let i = 0; i < data.length; i++) {
                console.log(deta[i]);
                newArray.push(deta[i]);
                console.log(newArray);
            }
            let sorted = newArray.sort((a, b) => (new Date(a.start_date) < new Date(b.start_date) ? 1 : -1));
            patientLookupAppointments(sorted);
        }
    }).catch(err => {
        console.log("Patient Appointment Lookup Error:", err);
    })

    //get patient
    fetch(`${api_path}/admin/patient/${patientId}`, {
        headers: { // next two lines 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'passport': localStorage.getItem('passport'),
        }
    }).then(res => res.json()).then(data => {
        document.getElementById("patient_info_wrapper").style.display = "block";
        const deta = {...data };
        let newArray = [];
        newArray.push(deta);
        console.log("testing get patient appointment");
        console.log("Patient Info: ", deta);
        console.log("newArray: ", newArray);
        document.getElementById("patient_info_wrapper").style.display = "block";
        loadOnePatient(newArray);

    }).catch(err => {
        console.log("Patient Appointment Lookup Error:", err);
    });
}

function addNote(appId, note) {
    console.log(note);
    console.log(appId);

    const body = {
        'appId': appId,
        'note': note
    };

    fetch(`${api_path}/admin/appointment/notes`, {
        method: "PUT",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'passport': localStorage.getItem('passport')
        },
        body: JSON.stringify(body)
    }).then(data => {
        location.reload();
        console.log(data);
    }).catch(err => {
        console.log("Add note error: ", err);
    });
}

function logOut() {
    window.location.href = "home.html";
    localStorage.setItem('passport', {
        id: "NULL",
        access_token: "NULL",
        is_admin: "NULL"

    });
}

function setPassport(id, access_token, is_admin) {
    localStorage.setItem('passport', JSON.stringify({
        id,
        access_token,
        is_admin,
    }));
}