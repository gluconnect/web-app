var data;
function logout() {
    // Send a message to the parent frame to log out
    window.parent.postMessage("logout", "*");
}
function loadData() {
    document.getElementById("currentName").innerHTML = data.name;
    document.getElementById("currentEmail").innerHTML = data.creds.email;
}
function changeName(){
    document.getElementById("nameInput").style.display = "block"; // Show the name input field
    document.getElementById("newName").value = data.name; // Set the current name as the value
}
function changeEmail(){
    document.getElementById("emailInput").style.display = "block"; // Show the email input field
    document.getElementById("newEmail").value = data.creds.email; // Set the current email as the value
}
function changePassword(){
    document.getElementById("passwordInput").style.display = "block"; // Show the password input field
    document.getElementById("newPassword").value = ""; // Clear the password input field
}
function deleteAccount(){
    document.getElementById("deleteConfirmation").style.display = "block"; // Show the delete account confirmation
}
function cancelName(){
    document.getElementById("nameInput").style.display = "none"; // Hide the name input field
}
function cancelEmail(){
    document.getElementById("emailInput").style.display = "none"; // Hide the email input field
}
function cancelPassword(){
    document.getElementById("passwordInput").style.display = "none"; // Hide the password input field
}
function cancelDelete(){
    document.getElementById("deleteConfirmation").style.display = "none"; // Hide the delete account confirmation
}
function submitName(){
    let newName = document.getElementById("newName").value;
    if(newName !== data.name && newName !== ""){
        window.parent.postMessage({changeName: newName}, "*"); // Send the new name to the parent frame
    }
    cancelName(); // Hide the name input field
}
function submitEmail(){
    let newEmail = document.getElementById("newEmail").value;
    if(newEmail !== data.creds.email && newEmail !== ""){
        window.parent.postMessage({changeEmail: newEmail}, "*"); // Send the new email to the parent frame
    }
    cancelEmail(); // Hide the email input field
}
function submitPassword(){
    let newPassword = document.getElementById("newPassword").value;
    // Check if the new password is different from the current one and not empty
    if(newPassword !== data.creds.pass && newPassword !== "" && newPassword.length >= 8){
        // Send the new password to the parent frame
    }else if(newPassword.length < 8){
        document.getElementById("errorMessage").innerHTML = "Password must be at least 8 characters long."; // Display error message
        return; // Exit the function if the password is too short
    }else{
        document.getElementById("errorMessage").innerHTML = "Password is unchanged or empty."; // Display error message
        return; // Exit the function if the password is unchanged or empty
    }
    //confirm new password
    if(newPassword !== document.getElementById("confirmPassword").value){
        document.getElementById("errorMessage").innerHTML = "Passwords do not match."; // Display error message
        return; // Exit the function if the passwords do not match
    }
    //confirm old password
    if(data.creds.pass !== document.getElementById("currentPassword").value){
        document.getElementById("errorMessage").innerHTML = "Current password is incorrect"; // Display error message
        return; // Exit the function if the old password is incorrect
    }
    // If all checks pass, send the new password to the parent frame
    window.parent.postMessage({changePassword: newPassword}, "*"); // Send the new password to the parent frame
    cancelPassword(); // Hide the password input field
}
function confirmDelete(){
    let confirmDelete = document.getElementById("deletePassword").value;
    if(confirmDelete === data.creds.pass){
        window.parent.postMessage("deleteAccount", "*"); // Send the delete account message to the parent frame
    }else{
        document.getElementById("errorMessage").innerHTML = "Password is incorrect"; // Display error message
        return; // Exit the function if the password is incorrect
    }
    cancelDelete(); // Hide the delete account confirmation
}
window.onmessage = function(event) {
    if (event.data && Object.hasOwn(event.data, 'creds')) {
        data = event.data;
        loadData();
    }else if(event.data && event.data.error){
        document.getElementById("errorMessage").innerHTML = event.data.error; // Display error message
        document.getElementById("successMessage").innerHTML = "";
    }else if(event.data && event.data.success){
        document.getElementById("successMessage").innerHTML = event.data.success; // Display success message
        document.getElementById("errorMessage").innerHTML = "";
    }
}