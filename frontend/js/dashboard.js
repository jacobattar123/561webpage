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

fetch(`${api_path}/appointments`, {
        headers: { // next two lines 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'passport': localStorage.getItem('passport'),
        },
    })
    .then(res => res.json())
    .then(data => {
        const deta = {...data };
        today = new Date();
        today.setHours(0, 0, 0, 0);
        let newArray = [];

        for (let i = 0; i < data.length; i++) {
            let appointment = new Date(deta[i].start_date);
            appointment.setHours(0, 0, 0, 0);
            if (today > appointment) {
                newArray.push(deta[i]);
            }
        }
        let sorted = data.sort((a, b) => (new Date(a.start_date) < new Date(b.start_date) ? 1 : -1));
        loadAppointmentsPast(newArray);
    }).catch(err => {
        console.log("my error: ", err);
    });

fetch(`${api_path}/appointments`, {
        headers: { // next two lines 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'passport': localStorage.getItem('passport'),
        },
    })
    .then(res => res.json())
    .then(data => {
        const deta = {...data };

        //console.log("start date: ", deta[0].start_date);
        today = new Date();
        today.setHours(0, 0, 0, 0);
        let newArray = [];

        for (let i = 0; i < data.length; i++) {
            console.log(deta[i].start_date);
            let appointment = new Date(deta[i].start_date);
            appointment.setHours(0, 0, 0, 0);
            if (today <= appointment) {
                newArray.push(deta[i]);
            }
        }


        loadAppointmentsUpcoming(newArray);
    }).catch(err => {
        console.log("my error: ", err);
    });



function loadAppointmentsUpcoming(data) {
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
        `<input type="button" value="Cancel" onclick="cancelAppointment({{id}})">` +
        "</td>" +
        "</tr>" +
        "{{/data}}"
    let output = Mustache.render(template, source);
    document.getElementById("appointments").innerHTML = output;
}

function loadAppointmentsPast(data) {
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
        "</tr>" +
        "{{/data}}"
    let output = Mustache.render(template, source);
    document.getElementById("appointments_past").innerHTML = output;
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
        alert("Appointment Has Been Cancelled.");
    }).catch(err => {
        alert(err);
        console.log("my error: ", err);
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

function scheduleAppointment() {
    console.log("scheduleAppointment");
    let date = document.getElementById("appointmentTime").value;
    let reason = document.getElementById("reason").value;

    let SD = new Date(date);
    let ED = new Date(date);

    today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate = new Date(date);
    date = new Date(date);
    checkDate = new Date(date);
    checkHours = new Date(date);

    if (date.getMinutes() > 0) {
        alert("Appointment Must Start At The Begining of the hour \nPlease set minutes to 0.");
    } else if (today >= checkDate.setHours(0, 0, 0, 0)) {
        alert("Appointment must not be set for today or past date.")
    } else if (checkDate.getDay() == 6 || checkDate.getDay() == 0) {
        alert("Cannot Schedule Appointment for a Weekend Date! \nHours Are: Mon-Fri 8am-5pm\nThank You.");
    } else if (checkHours.getHours() >= 17 || checkHours.getHours() < 8) {
        if (checkHours.getHours() >= 17) {
            alert("Cannot Schedule Appointment After 5pm.");
        } else if (checkHours.getHours() < 8) {
            alert("Cannot Schedule Appointment Before 8am.");
        } else {
            alert("no error");
        }

    } else {


        ED = ED.setTime(ED.getTime() + 1 * 60 * 60 * 1000);
        ED = new Date(ED);
        console.log("JS START DATE:", SD);
        SD.setTime(SD.getTime() + -7 * 60 * 60 * 1000);
        console.log("JS START DATE - 7:", SD);
        SD = SD.toISOString().slice(0, 19).replace('T', ' ');
        console.log("MS START DATE: ", SD);

        console.log("JS END DATE:", ED);
        ED.setTime(ED.getTime() + -7 * 60 * 60 * 1000);
        console.log("JS END DATE - 7:", ED);
        ED = ED.toISOString().slice(0, 19).replace('T', ' ');
        console.log("MS END DATE: ", ED);

        console.log(reason);

        const body = {
            'start_date': SD,
            'end_date': ED,
            'notes': 'N/A',
            'reason': reason
        };

        fetch(`${api_path}/appointments`, {
            method: "POST",
            headers: { // next two lines 
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'passport': localStorage.getItem('passport')
            },
            body: JSON.stringify(body)
        }).then(data => {
            location.reload();
            alert("The following has been scheduled", JSON.stringify(data));
        }).catch(err => {
            console.log("My error: ", err);
        });
    }

}