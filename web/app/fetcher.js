

var data = {
};
var spectate = {
};
var server = {
    url: "http://localhost:8008" // Server URL
}
function updateWarningCount(){
    if(data.warnings.length>0){
        document.getElementById("warningCount").parentElement.style.display = "block"; // Show the warning if there are any
        document.getElementById("warningCount").innerHTML = data.warnings.length; // Set the warning count
    }else{
        document.getElementById("warningCount").parentElement.style.display = "none"; // Hide the warning if there are no warnings
    }
}
async function loadEverything(){
    data.threshold = await (await fetch(server.url+"/get_threshold",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass })
    })).text();
    data.readings = await (await fetch(server.url+"/get_readings",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass })
    })).json();
    data.readings = data.readings.reverse(); // Reverse the readings to show the most recent first
    data.viewers = await (await fetch(server.url+"/get_viewers",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass })
    })).json();
    data.patients = await (await fetch(server.url+"/get_patients",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass })
    })).json();
    data.warnings = await (await fetch(server.url+"/get_warnings",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass })
    })).json();
    // updateWarningCount(); // Update the warning count on the page
    //Note: patents and viewers are each an array of objects {name, email}
}
async function loadSpectate(){
    spectate.threshold = parseFloat(await (await fetch(server.url+"/spectate_threshold",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, uemail: spectate.email })
    })).text());
    spectate.readings = await (await fetch(server.url+"/spectate_readings",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, uemail: spectate.email })
    })).json();
    let lastRead = await (await fetch(server.url+"/spectate_last_read",{
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
async function getData(){
    let d = sessionStorage.getItem("data"); // Get the data from session storage
    if(d){
        data = JSON.parse(d); // Parse the data from JSON
    }else{
        await loadEverything(); // Load everything if data is not available in session storage
    }
    try{updateWarningCount();}catch(e){} // Update the warning count on the page but idk if navbar exists on the page
    return data; // Return the data object
}
function setData(){
    sessionStorage.setItem("data", JSON.stringify(data)); // Set the data in session storage
}
async function getSpectateData(){
    let d = sessionStorage.getItem("spectate"); // Get the spectate data from session storage
    if(d){
        spectate = JSON.parse(d); // Parse the data from JSON
    }else{
        await loadSpectate(); // Load everything if data is not available in session storage
    }
    return spectate; // Return the spectate object
}
function setSpectateData(){
    sessionStorage.setItem("spectate", JSON.stringify(spectate)); // Set the spectate data in session storage
}
async function setCreds(crds){
    data.creds = crds; // Set the credentials in the data object
    data.name = crds.name; // Set the name in the data object
    server.url = crds.server; // Set the server URL in the data object
    sessionStorage.removeItem("data");
    await getData();
    setData(); // Set the data in session storage
}
async function spectatePatient(email, name){
    spectate.email = email; // Set the email of the patient to spectate
    spectate.name = name; // Set the name of the patient to spectate
    sessionStorage.removeItem("spectate"); // Remove the spectate data from session storage
    await loadSpectate(); // Load the spectate data
    setSpectateData(); // Set the spectate data in session storage
    go("spectate");
}
function logout(){
    sessionStorage.clear();
    go("login");
}