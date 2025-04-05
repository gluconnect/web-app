let url = ""; // URL for the server
var errors = document.getElementById("errorMessage");
async function login(e){
    e.preventDefault(); // Prevent form submission
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    if(username === "" || password === ""){
        errors.innerHTML = "Please enter both username and password.";
        return;
    }
    url = document.getElementById("server").value; // Get the server URL from the input field
    login(username, password, url);
}
function error(message){
    errors.innerHTML = message; // Display error message
}
// Add event listener to the form submission
document.getElementById("loginForm").addEventListener("submit", login);