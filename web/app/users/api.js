async function addViewer(email){ // add viewer
    let res = await fetch(server.url+"/connect_user",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, uemail: email })
    });
    if(res.status === 200){
        data.viewers.push(await res.json()); // Add the new viewer to the list
        updateData(); // Update the data on the page
    }else if(res.status === 401){
        error("Session Expired"); // Redirect to login if session expired
        go("login"); // Redirect to login if session expired
    }else{
        error("Failed to add viewer"); // Notify the frame of the error
    }
}
async function removeViewer(email){ // remove viewer
    let res = await fetch(server.url+"/disconnect_user",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, uemail: email })
    });
    if(res.status === 200){
        data.viewers = data.viewers.filter(viewer => viewer.email !== email); // Remove the viewer from the list
        updateData(); // Update the data on the page
    }else if(res.status === 401){
        error("Session Expired"); // Redirect to login if session expired
        go("login"); // Redirect to login if session expired
    }else{
        error("Failed to remove viewer"); // Notify the frame of the error
    }
}
async function removePatient(email){ // remove patient
    let res = await fetch(server.url+"/disconnect_patient",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, uemail: email })
    });
    if(res.status === 200){
        data.patients = data.patients.filter(patient => patient.email !== email); // Remove the patient from the list
        updateData(); // Update the data on the page
    }else if(res.status === 401){
        error("Session Expired"); // Redirect to login if session expired
        go("login"); // Redirect to login if session expired
    }else{
        error("Failed to remove patient"); // Notify the frame of the error
    }
}
async function start(){
    await getData();
    loadData();
}
start();