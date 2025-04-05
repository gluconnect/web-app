async function deleteAccount(){ // delete account
    let res = await fetch(server.url+"/delete",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass })
    });
    if(res.status === 200){
        data = {};
        go("login"); // Redirect to login after deletion
    }else{
        error("Failed to delete account"); // Notify the frame of the error
    }
}
async function changeName(name){
    let res = await fetch(server.url+"/change_name",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, newname: name })
    });
    if(res.status == 200){
        data.name = name; // Update the name in the data object
        updateData();
    }else if(res.status === 401){
        error("Session Expired"); // Notify the frame of the error
        go("login"); // Redirect to login if session expired
    }else{
        error("Failed to change name"); // Notify the frame of the error
    }
}
async function changeEmail(email){
    let res = await fetch(server.url+"/change_email",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, newemail: email })
    });
    if(res.status == 200){
        data.creds.email = email; // Update the email in the data object
        updateData();
        success("Email changed successfully"); // Notify the frame of the success
    }else if(res.status === 401){
        error("Session Expired"); // Notify the frame of the error
        go("login"); // Redirect to login if session expired
    }else{
        error("Failed to change email"); // Notify the frame of the error
    }
}
async function changePassword(password){
    let res = await fetch(server.url+"/change_password",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, newpassword: password })
    });
    if(res.status == 200){
        data.creds.pass = password; // Update the password in the data object
        updateData();
        success("Password changed successfully"); // Notify the frame of the success
    }else if(res.status === 401){
        error("Session Expired"); // Notify the frame of the error
        go("login"); // Redirect to login if session expired
    }else{
        error("Failed to change password"); // Notify the frame of the error
    }
}
async function start(){
    await getData();
    await loadData();
}
start();