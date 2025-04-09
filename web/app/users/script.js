function initializeToggles(){
    // Initialize the toggles for viewers and patients
    document.getElementById("viewers").style.display = "flex"; // Hide viewers by default
    document.getElementById("patients").style.display = "flex"; // Hide patients by default
    document.getElementById("collapseViewers").style.display = "none"; // Show collapse button for viewers
    document.getElementById("collapsePatients").style.display = "none"; // Show collapse button for patients
}
function toggleViewers() {
    let viewers = document.getElementById("viewers");
    let show = document.getElementById("collapseViewers");
    if (viewers.style.display === "none") {
        viewers.style.display = "flex";
        show.style.display = "none";
    } else {
        viewers.style.display = "none";
        show.style.display = "block";
    }
}
function togglePatients() {
    let patients = document.getElementById("patients");
    let show = document.getElementById("collapsePatients");
    if (patients.style.display === "none") {
        patients.style.display = "flex";
        show.style.display = "none";
    } else {
        patients.style.display = "none";
        show.style.display = "block";
    }
}
/*function spectate(email, name) {
    window.parent.postMessage({ spectate: email, spectateName: name }, "*"); // Send message to parent to spectate the patient
}
function removeViewer(email) {
    
}
function removePatient(email) {
    window.parent.postMessage({ removePatient: email }, "*"); // Send message to parent to remove patient
}*/
function appendViewer(viewer) {
    // create a new viewer element
    let viewerElement = document.createElement("li");
    viewerElement.innerHTML = `
        <span style="font-weight: bold;">${viewer.name} <span style="font-weight: normal;">(${viewer.email})</span></span>
        <div>
            <button onclick="settings('${viewer.email}')">Settings</button>
            <button class="remove" onclick="removeViewer('${viewer.email}')">Remove</button>
        </div>
    `; // TODO: Implement settings(allow viewer to change threshold, custom threshold, warning notification methods, etc.)
    viewerElement.style.display = "flex";
    viewerElement.style.justifyContent = "space-between";
    viewerElement.style.alignItems = "center";
    viewerElement.style.flexDirection = "row";
    viewerElement.style.width = "100%";
    document.getElementById("viewerList").appendChild(viewerElement);
}
function appendPatient(patient) {
    let warning = data.warnings.find(w => w.email === patient.email); // Find the warning for the patient if it exists
    // create a new patient element
    let patientElement = document.createElement("li");
    let potentialWarnMsg = ""; // Initialize potential warning message
    if(warning){
        potentialWarnMsg = `<div class="warning"><span>`+warning.warnings+` warning(s)!</span><br><span>`+warning.reading.value+` at `+(new Date(warning.reading.time)).toLocaleString()+`</span></div>`;
    }
    patientElement.innerHTML = `
        <span style="font-weight: bold;">${patient.name} <span style="font-weight: normal;">(${patient.email})</span></span>
        `+potentialWarnMsg+`
        <div>
            <button onclick="spectatePatient('${patient.email}','${patient.name}')">View</button>
            <button class="remove" onclick="removePatient('${patient.email}')">Remove</button>
        </div>
    `;
    patientElement.style.display = "flex";
    patientElement.style.justifyContent = "space-between";
    patientElement.style.alignItems = "center";
    patientElement.style.flexDirection = "row";
    patientElement.style.width = "100%";
    document.getElementById("patientList").appendChild(patientElement);
}
// Function to add a new viewer
// This function creates a form to add a new viewer and appends it to the viewer list
function addViewerForm() {
    if(document.getElementById("addViewerForm")){
        return;
    }
    // create form to add a new viewer
    let form = document.createElement("form");
    form.innerHTML = `
        <input type="text" id="viewerEmail" placeholder="Viewer Email" required>
        <button type="submit">Add Viewer</button><button type="button" class="cancel" onclick="this.parentElement.remove()">Cancel</button>
    `;
    form.classList.add("microform");
    form.style.maxWidth = "100%"; // Set max width to 100%
    form.id = "addViewerForm"; // Set the form ID
    form.onsubmit = async (e) => {
        e.preventDefault();
        let email = document.getElementById("viewerEmail").value;
        addViewer(email); // Call the function to add the viewer
        form.remove(); // Remove the form after submission
    }
    document.getElementById("viewers").appendChild(form);
}
function loadData() {
    document.getElementById("currentViewerCount").innerHTML = data.viewers.length;
    if(data.viewers.length === 0){
        document.getElementById("viewerInstructions").display = "block"; // Show instructions if no viewers
    }else{
        document.getElementById("viewerInstructions").display = "none"; // Hide instructions if there are viewers
    }
    document.getElementById("currentPatientCount").innerHTML = data.patients.length;
    if(data.patients.length === 0){
        document.getElementById("patientInstructions").display = "block"; // Show instructions if no patients
    }else{
        document.getElementById("patientInstructions").display = "none"; // Hide instructions if there are patients
    }
    //hide instructions for each if not empty, show otherwise
    if(data.viewers.length > 0){
        document.getElementById("viewerInstructions").style.display = "none";
    }else{
        document.getElementById("viewerInstructions").style.display = "block";
    }
    if(data.patients.length > 0){
        document.getElementById("patientInstructions").style.display = "none";
    }else{
        document.getElementById("patientInstructions").style.display = "block";
    }
    // Initialize toggles for viewers and patients
    initializeToggles();
    //Collapse one if empty but not the other
    if(data.viewers.length === 0 && data.patients.length > 0){
        toggleViewers();
    }else if(data.patients.length === 0 && data.viewers.length > 0){
        togglePatients();
    }
    // Add viewers
    document.getElementById("viewerList").innerHTML = ""; // Clear the list before adding viewers
    data.viewers.forEach(viewer => {
        appendViewer(viewer);
    });
    // Add patients
    document.getElementById("patientList").innerHTML = ""; // Clear the list before adding patients
    data.patients.forEach(viewer => {
        appendPatient(viewer);
    });
}
function updateData(){
    loadData();
    setData();
}
function error(msg){
    document.getElementById("errorMessage").innerHTML = msg; // Display error message
}
function success(msg){
    //document.getElementById("successMessage").innerHTML = msg; // Display success message
}