// Check if user is logged in:
const isLoggedIn = true;

window.addEventListener("load", () => {
    if (!isLoggedIn) {
        window.location.href = "login.html";
    }
});