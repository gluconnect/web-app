async function login(e){
    e.preventDefault(); // Prevent form submission
    var name = document.getElementById("name").value; // Get the name value
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var confirm = document.getElementById("confirmPassword").value; // Get the confirm password value
    var errors = document.getElementById("errorMessage");

    if(username === "" || password === "" || name==""){
        errors.innerHTML = "Please enter email, name and password.";
        return;
    }
    if(name.length < 2 || name.length > 35 || password.length < 8 || password.length>50){ // Check if username and password are at least 5 characters long
        errors.innerHTML = "Name must be between 2 and 35 characters long<br>Password must be between 8 and 50 characters long.";
        return;
    }
    if(password !== confirm){ // Check if password and confirm password match
        errors.innerHTML = "Passwords do not match.";
        return;
    }
    let res = await fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: username, password: password, name: name }) // Send the data to the server
    });
    // If response is 200, register is successful
    if(res.status === 200){
        document.getElementById("login").click(); // Trigger the login button to go to login page
    } else {
        errors.innerHTML = "Sorry, this email is already registered. Please try another one."; // Display error message
    }
}
window.onmessage = function(event) {
    if(event.data && event.data.error){
        document.getElementById("errorMessage").innerHTML = event.data.error; // Display error message
    }
}
// Add event listener to the form submission
document.getElementById("loginForm").addEventListener("submit", login);