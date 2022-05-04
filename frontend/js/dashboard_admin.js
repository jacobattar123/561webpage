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
        headers: { // next two lines 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'passport': localStorage.getItem('passport'),
        },
    })
    .then(res => res.json())
    .then(data => {
        const deta = {...data };
        console.log(data);
        console.log(deta);

        //console.log("start date: ", deta[0].start_date);
        today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log("today: \n", today);

        for (let i = 0; i < data.length; i++) {
            let appointment = new Date(deta[i].start_date);
            appointment.setHours(0, 0, 0, 0);
            if (today < appointment) {
                console.log("Upcoming Appointment ", i, ": ", deta[i].start_date);
            }
        }

        let sorted = data.sort((a, b) => (new Date(a.start_date) > new Date(b.start_date) ? 1 : -1));
        console.log(sorted);


        loadAppointments(data);
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

function cancelAppointment(id) {
    // make call to back end to cancel appointment
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