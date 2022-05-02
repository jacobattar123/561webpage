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
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'passport': localStorage.getItem('passport'),
        },
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
        let sorted = data.sort((a, b) => (new Date(a.start_date) > new Date(b.start_date) ? 1 : -1));
        console.log(sorted);
        loadAppointments(data);
    }).catch(err => {
        console.log("my error: ", err);
    });

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

function setPassport(id, access_token) {
    localStorage.setItem('passport', JSON.stringify({
        id,
        access_token,
    }));
}