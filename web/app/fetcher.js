var data = {
};
var spectate = {
};
var glucometers = [
];
maxReadings = 16;
var shouldHaveSession = false; // sets to true when the user logs in, and false when the user logs out. Also sets to true if server requests credentials
var server = {
}

function updateWarningCount(){
    if(data.warnings.length>0){
        document.getElementById("warningCount").parentElement.style.display = "block"; // Show the warning if there are any
        document.getElementById("warningCount").innerHTML = data.warnings.length; // Set the warning count
    }else{
        document.getElementById("warningCount").parentElement.style.display = "none"; // Hide the warning if there are no warnings
    }
}
function startCheckGlucometers(){
    // if(checkGlucometersInterval === null){ // If the interval is not set
    //     checkGlucometersInterval = setInterval(() => { // Set the interval to check for glucometers
    //         for(let i=0; i<glucometers.length; i++){
    //             glucometers[i].getReadings(); // Check the status of each glucometer
    //         }
    //     }, checkGlucometersCooldown); // Set the cooldown to 5 seconds
    // }
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
    if(!server.url)server.url = localStorage.getItem("server"); // Get the server URL from session storage
    if(!server.url)server.url = ""; // Set the server URL to empty string if not available
    if(d){
        data = JSON.parse(d); // Parse the data from JSON
    }else{
        await loadEverything(); // Load everything if data is not available in session storage
    }
    try{updateWarningCount();}catch(e){console.log(e)} // Update the warning count on the page but idk if navbar exists on the page
    return data; // Return the data object
}
function setData(){
    sessionStorage.setItem("data", JSON.stringify(data)); // Set the data in session storage
    localStorage.setItem("server", server.url); // Set the server URL in session storage
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
function getGlucometers(){
    let d = localStorage.getItem("glucometers"); // Get the glucometers data from session storage
    if(d){
        glucometers = JSON.parse(d); // Parse the data from JSON
    }else{
        glucometers = []; // Set to empty array if not available
    }
    return glucometers; // Return the glucometers object
}
function setGlucometers(){
    localStorage.setItem("glucometers", JSON.stringify(glucometers)); // Set the glucometers data in session storage
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
    try{let res = fetch(server.url+"/logout",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email })
    });}catch(w){}

    go("login");
}
async function newSyncedReading(reading){ // add new reading
    if(data.readings.some(x => reading.time === x.time)){ // Check if the reading already exists in the database
        return;
    }
    const bod = JSON.stringify({ email: data.creds.email, password: data.creds.pass, reading: reading })
    console.log("SENDING READING TO SERVER:", bod)
    let res = await fetch(server.url+"/add_reading", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: bod,
    });
    if(res.status === 200){
        data.readings.unshift(reading); // Add the new reading to the front of the list
        setData();
        if(loadData){ // If the loadData function is available, call it to update the data on the page
            loadData(); // Update the data on the page
        }
    }else if(res.status === 401){
        error("Session Expired"); // Notify the frame of the error
        go("login"); // Redirect to login if session expired
    }else{
        error("Failed to add reading"); // Notify the frame of the error
    }
}
function notifyFetchedReadings(n, targ, max = targ){
    if(n==-1){//glucometer not connected
        if(max==0)document.getElementById("fetchReadingsNotification").innerHTML = "Connecting to glucometer...";
        else{
            document.getElementById("fetchReadingsNotification").innerHTML = "Failed to connect to Glucometer...";
            setTimeout(()=>document.getElementById("fetchReadingsNotification").innerHTML = "", 3000);
        }
    }else if(n===0&&max<0){//glucometer connected
        document.getElementById("fetchReadingsNotification").innerHTML = "Glucometer connected!";
    }else if(max===0){//no readings to fetch
        document.getElementById("fetchReadingsNotification").innerHTML = "Glucometer connected!<br>No readings to fetch!";
        setTimeout(()=>document.getElementById("fetchReadingsNotification").innerHTML = "", 3000);
    }else if(n === targ){//continue fetching or done fetching
        document.getElementById("fetchReadingsNotification").innerHTML = "Glucometer connected!<br>Fetching "+n+" readings of "+max+"!";
    }else{
        document.getElementById("fetchReadingsNotification").innerHTML = "Glucometer connected!<br>Fetched "+n+" readings of "+max+"!";
        setTimeout(()=>document.getElementById("fetchReadingsNotification").innerHTML = "", 3000);
    }
}
async function connectAndGetReadings(){
    if(document.getElementById("redboneImport") === null){ // Check if the script is already loaded
        let elem = document.createElement("script")
        elem.src = "../glucometers/dist/bundle.js"; // Load the glucometer script
        elem.id = "redboneImport";
        document.head.appendChild(elem); // Append the script to the head
        //wait for element load
        await new Promise((resolve) => {
            elem.onload = () => resolve(); // Resolve the promise when the script is loaded
        });
    }
    notifyFetchedReadings(-1, 0); // Notify that the glucometer is not connected
    try{
        let dev = await searchDevices(); // Search for devices
        if (dev) {
            await attemptConnect(dev);
            notifyFetchedReadings(0, -1); // Notify that the glucometer is connected
            let max_num_readings = await getNumReadings(dev); // Get the number of readings
            num_readings = Math.min(Number(max_num_readings), maxReadings)
            notifyFetchedReadings(0, num_readings, max_num_readings); // Notify that the glucometer is connected and the number of readings available
            console.log("Number of Readings: ", num_readings)
            const readingsData = await getReadings(dev, num_readings); // Get the readings from the device
            console.log(readingsData); // Log the readings to the console
            for(let i = 0; i < readingsData.length; i++){
                let reading = readingsData[i]; // Get the reading from the device
                await newSyncedReading(reading); // Add the new reading to the database
                notifyFetchedReadings(i+1, num_readings, max_num_readings); // Notify that the reading has been added
            }
        }
    }catch(e){}
    notifyFetchedReadings(-1,-1);
}