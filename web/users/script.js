let data = {};
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
function removeViewer(email) {
    window.parent.postMessage({ removeViewer: email }, "*"); // Send message to parent to remove viewer
}
function removePatient(email) {
    window.parent.postMessage({ removePatient: email }, "*"); // Send message to parent to remove patient
}
function appendViewer(viewer) {
    // create a new viewer element
    let viewerElement = document.createElement("li");
    viewerElement.innerHTML = `
        <span style="font-weight: bold;">${viewer.name} <span style="font-weight: normal;">(${viewer.email})</span></span>
        <button class="remove" onclick="removeViewer('${viewer.email}')">Remove</button>
    `;
    viewerElement.style.display = "flex";
    viewerElement.style.justifyContent = "space-between";
    viewerElement.style.alignItems = "center";
    viewerElement.style.flexDirection = "row";
    viewerElement.style.width = "100%";
    document.getElementById("viewerList").appendChild(viewerElement);
}
function addViewer() {
    // create form to add a new viewer
    let form = document.createElement("form");
    form.innerHTML = `
        <input type="text" id="viewerEmail" placeholder="Viewer Email" required>
        <button type="submit">Add Viewer</button><button type="button" class="cancel" onclick="this.parentElement.remove()">Cancel</button>
    `;
    form.onsubmit = async (e) => {
        e.preventDefault();
        let email = document.getElementById("viewerEmail").value;
        window.parent.postMessage({ addViewer: email }, "*"); // Send message to parent to add viewer
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
    /*data.patients.forEach(viewer => {
        addPatient(viewer);
    });*/
}
window.onmessage = function(event) {
    if (event.data && Object.hasOwn(event.data, 'creds')) {
        data = event.data;
        loadData();
    }else if(event.data && event.data.error){
        document.getElementById("errorMessage").innerHTML = event.data.error; // Display error message
    }
}