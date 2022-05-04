// Check if user is logged in:
fetch(`${api_path}/login`, {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'passport': localStorage.getItem('passport')
        },
    }).then(res => {
        if (res.ok) {
            //"passport" : "id" , "access-token", "is_admin"
            const passport = JSON.parse(window.localStorage.getItem('passport'));
            if (passport.is_admin) {
                window.location.href = "dashboard_admin.html";
            } else window.location.href = "dashboard.html";
        }
    })
    .catch(err => {
        console.log("my error: ", err);
    });


const container = document.querySelector(".container"),
    pwShowHide = document.querySelectorAll(".showHidePw"),
    pwFields = document.querySelectorAll(".password"),
    signUp = document.querySelector(".signup-link"),
    login = document.querySelector(".login-link");

//   js code to show/hide password and change icon
pwShowHide.forEach(eyeIcon => {
    eyeIcon.addEventListener("click", () => {
        pwFields.forEach(pwField => {
            if (pwField.type === "password") {
                pwField.type = "text";

                pwShowHide.forEach(icon => {
                    icon.classList.replace("uil-eye-slash", "uil-eye");
                })
            } else {
                pwField.type = "password";

                pwShowHide.forEach(icon => {
                    icon.classList.replace("uil-eye", "uil-eye-slash");
                })
            }
        })
    })
})

// js code to appear signup and login form
signUp.addEventListener("click", () => {
    container.classList.add("active");
});
login.addEventListener("click", () => {
    container.classList.remove("active");
});

//get the user email and password that they are using to sign in
function handleLogin() {
    const formData = new FormData(document.getElementById('loginForm'));
    const body = {};
    formData.forEach((val, key) => {
        body[key] = val;
    });
    fetch(`${api_path}/login`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        }).then(res => {
            if (res.ok) //not 400 status error. (res is the result from the fetch above)
            {
                return res.json()
            } else {
                return null;
            }
        })
        //passport gets added to the local storage / headers
        .then(data => {
            if (!data) {
                alert("Invalid username or password");
                return;
            } else {

                localStorage.setItem('passport', JSON.stringify({
                    id: data.id,
                    access_token: data.access_token,
                    is_admin: data.is_admin
                }));
                //now the user has been verified so change the user view to the dashboard.
                if (data.is_admin) {
                    window.location.href = "dashboard_admin.html";
                    return;
                } else {
                    window.location.href = "dashboard.html";
                }


            }
        });
}

function handleRegistration() {
    const formData = new FormData(document.getElementById('registrationForm'));
    const body = {};
    formData.forEach((val, key) => {
        body[key] = val;
    });
    console.log(body);
    fetch(`${api_path}/patients`, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    }).then(res => {
        if (res.ok) {
            alert("User has been registered. Please go back to login.");
            return;
        } else {
            alert("Unable to register user.");
            return;
        }
    });
}




















/*
localStorage.set('passport', 'mypassport');

let table;
table += "<tbody>"
[].forEach((val, index) => {
    table += '<tr>';
    table += `<td>${}</td>`
})

element.innerHtml = table; */