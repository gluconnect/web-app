let url = ""; // URL for the server
async function login(e){
    e.preventDefault(); // Prevent form submission
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var errors = document.getElementById("errorMessage");

    if(username === "" || password === ""){
        errors.innerHTML = "Please enter both username and password.";
        return;
    }
    url = document.getElementById("server").value; // Get the server URL from the input field
    let res = await fetch(url+"/verify", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: username, password: password })
    });
    console.log(res); // Log the response status for debugging
    // If response is 200, log in is successful
    if(res.status === 200){
        errors.innerHTML = ""; // Clear error message
        window.parent.postMessage({ email: username, pass: password, name: await res.text(), server: url}, "*"); // Send message to parent frame
    } else {
        errors.innerHTML = "Invalid username or password. Please try again.";
    }
}
window.onmessage = function(event) {
    if(event.data && event.data.error){
        document.getElementById("errorMessage").innerHTML = event.data.error; // Display error message
    }
}
// Add event listener to the form submission
document.getElementById("loginForm").addEventListener("submit", login);