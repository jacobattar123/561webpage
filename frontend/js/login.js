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
            window.location.href = "dashboard.html";
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
            if (res.ok) {
                return res.json()
            } else {
                return null;
            }
        })
        .then(data => {
            if (!data) {
                alert("Invalid username or password");
                return;
            } else {
                localStorage.setItem('passport', JSON.stringify({
                    id: data.id,
                    access_token: data.access_token,
                }));
                window.location.href = "dashboard.html"
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