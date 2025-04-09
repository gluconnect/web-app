async function setThreshold(threshold){ // set threshold
    let res = await fetch(server.url+"/change_threshold",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, threshold: threshold })
    });
    if(res.status === 200){
        if(data.threshold>threshold){ // Show option to update warnings if threshold is decreased
            showUpdateWarnings();
        }
        data.threshold = threshold;
        updateData(); // Update the data in session storage
    }else if(res.status === 401){
        error("Session Expired"); // Notify the frame of the error
        go("login"); // Redirect to login if session expired
    }else{
        error("Failed to set threshold"); // Notify the frame of the error
    }
}
async function newReading(reading){ // add new reading
    let res = await fetch(server.url+"/add_reading",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, reading: reading })
    });
    if(res.status === 200){
        data.readings.unshift(reading); // Add the new reading to the front of the list
        updateData(); // Update the data in session storage
    }else if(res.status === 401){
        error("Session Expired"); // Notify the frame of the error
        go("login"); // Redirect to login if session expired
    }else{
        error("Failed to add reading"); // Notify the frame of the error
    }
}
async function clearReadings(){ // clear readings
    let res = await fetch(server.url+"/clear_readings",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass })
    });
    if(res.status === 200){
        data.readings = []; // Clear the readings in the data object
        updateData(); // Update the data in session storage
    }else if(res.status === 401){
        error("Session Expired"); // Notify the frame of the error
        go("login"); // Redirect to login if session expired
    }else{
        error("Failed to clear readings"); // Notify the frame of the error
    }
}
async function updateWarnings(){ // warn users new
    let res = await fetch(server.url+"/update_warnings",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass })
    });
    if(res.status === 200){
        success("Warnings updated"); // Notify the frame of the success
    }else if(res.status === 401){
        error("Session Expired"); // Notify the frame of the error
        go("login"); // Redirect to login if session expired
    }else{
        error("Failed to update warnings"); // Notify the frame of the error
        showUpdateWarnings(); // Show option to update warnings again
    }
}
async function start(){
    await getData();
    await loadData();
}
start();