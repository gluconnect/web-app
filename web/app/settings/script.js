function loadData() {
    document.getElementById("currentName").innerHTML = data.name;
    document.getElementById("currentEmail").innerHTML = data.creds.email;
}
function changeNameForm(){
    document.getElementById("nameInput").style.display = "block"; // Show the name input field
    document.getElementById("newName").value = data.name; // Set the current name as the value
}
function changeEmailForm(){
    document.getElementById("emailInput").style.display = "block"; // Show the email input field
    document.getElementById("newEmail").value = data.creds.email; // Set the current email as the value
}
function changePasswordForm(){
    document.getElementById("passwordInput").style.display = "block"; // Show the password input field
    document.getElementById("newPassword").value = ""; // Clear the password input field
}
function deleteAccountForm(){
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
        changeName(newName);
    }
    cancelName(); // Hide the name input field
}
function submitEmail(){
    let newEmail = document.getElementById("newEmail").value;
    if(newEmail !== data.creds.email && newEmail !== ""){
        changeEmail(newEmail); // Send the new email to the parent frame
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
    changePassword(newPassword); // Send the new password to the parent frame
    cancelPassword(); // Hide the password input field
}
function confirmDelete(){
    let confirmDelete = document.getElementById("deletePassword").value;
    if(confirmDelete === data.creds.pass){
        deleteAccount(); // Send the delete account request to the parent frame
    }else{
        document.getElementById("errorMessage").innerHTML = "Password is incorrect"; // Display error message
        return; // Exit the function if the password is incorrect
    }
    cancelDelete(); // Hide the delete account confirmation
}
function updateData(){
    loadData();
    setData();
}
function error(msg){
    document.getElementById("errorMessage").innerHTML = msg; // Display error message
}
function success(msg){
    document.getElementById("successMessage").innerHTML = msg; // Display success message
}