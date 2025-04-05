function stopSpectating(){ // stop spectating
    go("users");
}
async function setLastRead(){ // set the last read time
    let time = (new Date()).toISOString();
    let res = await fetch(server.url+"/set_patient_last_read",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, uemail: spectate.email, lastRead: time }) // Set the last read to the current time
    });
    if(res.status == 200){
        spectate.lastRead = time; // Set the last read to the current time even if it fails
        data.warnings = data.warnings.filter(warning => warning.email !== spectate.email || new Date(spectate.lastRead)<new Date(warning.reading.time)); // Remove the warnings for the patient
        updateWarningCount(); // Update the warning count on the page
        updateData(); // Update the data on the page
    }else if(res.status === 401){
        error("Session Expired"); // Redirect to login if session expired
        go("login"); // Redirect to login if session expired
    }else{
        error("Failed to set last read time"); // Notify the frame of the error
    }
}
async function start(){
    await getData();
    await getSpectateData();
    loadData();
}
start();