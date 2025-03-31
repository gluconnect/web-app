var data = {
};
var spectate = {
};
let frame = document.getElementById("contentFrame");
function go(page){
    frame.src = page+"/"+page+".html";
    if(page==="login"||page==="register"||page==="spectate"){ // Check if the page is login or register
        document.getElementById("nav").style.display = "none"; // Hide the navigation bar on the login page
    }else{
        document.getElementById("nav").style.display = "flex"; // Show the navigation bar on other pages
    }
}
async function loadEverything(){
    data.threshold = await (await fetch("/get_threshold",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass })
    })).text();
    data.readings = await (await fetch("/get_readings",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass })
    })).json();
    data.readings = data.readings.reverse(); // Reverse the readings to show the most recent first
    data.viewers = await (await fetch("/get_viewers",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass })
    })).json();
    data.patients = await (await fetch("/get_patients",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass })
    })).json();
    //Note: patents and viewers are each an array of objects {name, email}
}
async function loadSpectate(){
    spectate.threshold = parseFloat(await (await fetch("/spectate_threshold",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, uemail: spectate.email })
    })).text());
    spectate.readings = await (await fetch("/spectate_readings",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, uemail: spectate.email })
    })).json();
    let lastRead = await (await fetch("/spectate_last_read",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, uemail: spectate.email })
    })).text();
    if(lastRead!==""){
        spectate.lastRead = lastRead; // Set the last read time if available
    }
    spectate.readings = spectate.readings.reverse(); // Reverse the readings to show the most recent first
}
window.onmessage = async function(event) {
    if (Object.hasOwn(event.data, 'email')){ // login
        data.creds = event.data;
        data.name = event.data.name;
        await loadEverything();
        go("home");
        frame.onload = ()=>{frame.contentWindow.postMessage(data, "*");}
    }else if(event.data==='logout'){ // logout
        data = {};
        go("login");
    }else if(Object.hasOwn(event.data, 'setThreshold')){ // set threshold
        let res = await fetch("/change_threshold",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, threshold: event.data.setThreshold })
        });
        if(res.status === 200){
            data.threshold = event.data.setThreshold;
            frame.contentWindow.postMessage(data, "*");
        }else if(res.status === 401){
            go("login"); // Redirect to login if session expired
            frame.contentWindow.postMessage({error: "Session Expired"}, "*");
        }else{
            frame.contentWindow.postMessage({error: "Failed to set threshold"}, "*"); // Notify the frame of the error
        }
    }else if(Object.hasOwn(event.data, 'newReading')){ // add new reading
        let res = await fetch("/add_reading",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, reading: event.data.newReading })
        });
        if(res.status === 200){
            data.readings.unshift(event.data.newReading); // Add the new reading to the front of the list
            frame.contentWindow.postMessage(data, "*");
        }else if(res.status === 401){
            go("login"); // Redirect to login if session expired
            frame.contentWindow.postMessage({error: "Session Expired"}, "*");
        }else{
            frame.contentWindow.postMessage({error: "Failed to add reading"}, "*"); // Notify the frame of the error
        }
    }else if(event.data === "updateWarnings"){ // warn users new
        let res = await fetch("/update_warnings",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: data.creds.email, password: data.creds.pass })
        });
        if(res.status === 200){
            frame.contentWindow.postMessage({success: "Warnings updated successfully"}, "*"); // Notify the frame of the success
        }else if(res.status === 401){
            go("login"); // Redirect to login if session expired
            frame.contentWindow.postMessage({error: "Session Expired"}, "*");
        }else{
            frame.contentWindow.postMessage({error: "Failed to update warnings"}, "*"); // Notify the frame of the error
        }
    }else if(event.data === "deleteAccount"){ // delete account
        let res = await fetch("/delete",{
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
            frame.contentWindow.postMessage({error: "Failed to delete account"}, "*"); // Notify the frame of the error
        }
    }else if(Object.hasOwn(event.data, "changeName")){
        data.name = event.data.changeName;
        let res = await fetch("/change_name",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, newname: data.name })
        });
        if(res.status !== 200){
            frame.contentWindow.postMessage({error: "Failed to change name"}, "*"); // Notify the frame of the error
        }else if(res.status === 401){
            go("login"); // Redirect to login if session expired
            frame.contentWindow.postMessage({error: "Session Expired"}, "*");
        }else{
            data.name = event.data.changeName; // Update the name in the data object
            frame.contentWindow.postMessage(data, "*"); // Notify the frame of the change
            frame.contentWindow.postMessage({success: "Name changed successfully"}, "*"); // Notify the frame of the success
        }
    }else if(Object.hasOwn(event.data, "changeEmail")){
        data.creds.email = event.data.changeEmail;
        let res = await fetch("/change_email",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, newemail: data.creds.email })
        });
        if(res.status !== 200){
            frame.contentWindow.postMessage({error: "Failed to change email"}, "*"); // Notify the frame of the error
        }else if(res.status === 401){
            go("login"); // Redirect to login if session expired
            frame.contentWindow.postMessage({error: "Session Expired"}, "*");
        }else{
            data.creds.email = event.data.changeEmail; // Update the email in the data object
            frame.contentWindow.postMessage(data, "*"); // Notify the frame of the change
            frame.contentWindow.postMessage({success: "Email changed successfully"}, "*"); // Notify the frame of the success
        }
    }else if(Object.hasOwn(event.data, "changePassword")){
        let res = await fetch("/change_password",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, newpassword: event.data.changePassword })
        });
        if(res.status !== 200){
            frame.contentWindow.postMessage({error: "Failed to change password"}, "*"); // Notify the frame of the error
        }else if(res.status === 401){
            go("login"); // Redirect to login if session expired
            frame.contentWindow.postMessage({error: "Session Expired"}, "*");
        }else{
            data.creds.pass = event.data.changePassword; // Update the password in the data object
            frame.contentWindow.postMessage(data, "*"); // Notify the frame of the change
            frame.contentWindow.postMessage({success: "Password changed successfully"}, "*"); // Notify the frame of the success
        }
    }else if(Object.hasOwn(event.data, "addViewer")){ // add viewer
        let res = await fetch("/connect_user",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, uemail: event.data.addViewer })
        });
        if(res.status === 200){
            data.viewers.push(await res.json()); // Add the new viewer to the list
            frame.contentWindow.postMessage(data, "*");
        }else if(res.status === 401){
            go("login"); // Redirect to login if session expired
            frame.contentWindow.postMessage({error: "Session Expired"}, "*");
        }else{
            frame.contentWindow.postMessage({error: "Failed to add viewer"}, "*"); // Notify the frame of the error
        }
    }else if(Object.hasOwn(event.data, "removeViewer")){ // remove viewer
        let res = await fetch("/disconnect_user",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, uemail: event.data.removeViewer })
        });
        if(res.status === 200){
            data.viewers = data.viewers.filter(viewer => viewer.email !== event.data.removeViewer); // Remove the viewer from the list
            frame.contentWindow.postMessage(data, "*");
        }else if(res.status === 401){
            go("login"); // Redirect to login if session expired
            frame.contentWindow.postMessage({error: "Session Expired"}, "*");
        }else{
            frame.contentWindow.postMessage({error: "Failed to remove viewer"}, "*"); // Notify the frame of the error
        }
    }else if(Object.hasOwn(event.data, "removePatient")){ // remove patient
        let res = await fetch("/disconnect_patient",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, uemail: event.data.removePatient })
        });
        if(res.status === 200){
            data.patients = data.patients.filter(patient => patient.email !== event.data.removePatient); // Remove the patient from the list
            frame.contentWindow.postMessage(data, "*");
        }else if(res.status === 401){
            go("login"); // Redirect to login if session expired
            frame.contentWindow.postMessage({error: "Session Expired"}, "*");
        }else{
            frame.contentWindow.postMessage({error: "Failed to remove patient"}, "*"); // Notify the frame of the error
        }
    }else if(Object.hasOwn(event.data, "spectate")){
        spectate.email = event.data.spectate;
        spectate.name = event.data.spectateName;
        await loadSpectate();
        go("spectate");
        frame.onload = ()=>{frame.contentWindow.postMessage(spectate, "*");}
    }else if(event.data === "stopSpectating"){ // stop spectating
        spectate = {};
        go("users");
        frame.onload = ()=>{frame.contentWindow.postMessage(data, "*");} // Notify the frame of the change
    }else if(event.data === "setLastRead"){ // delete spectate
        let time = (new Date()).toISOString();
        let res = await fetch("/set_patient_last_read",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, uemail: spectate.email, lastRead: time }) // Set the last read to the current time
        });
        if(res.status !== 200){
            frame.contentWindow.postMessage({error: "Failed to set last read"}, "*"); // Notify the frame of the error
        }else if(res.status === 401){
            go("login"); // Redirect to login if session expired
            frame.contentWindow.postMessage({error: "Session Expired"}, "*");
        }else{
            frame.contentWindow.postMessage({success: "Last read set successfully"}, "*"); // Notify the frame of the success
            spectate.lastRead = time; // Set the last read to the current time even if it fails
            frame.contentWindow.postMessage(spectate, "*");
        }
    }
}
go("login"); // Start with the login page