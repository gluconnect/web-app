function appendGlucometer(glucometer) {
    // create a new viewer element
    let viewerElement = document.createElement("li");
    viewerElement.innerHTML = `
        <span style="font-weight: bold;">${glucometer.name}</span>
        <span style="font-weight: bold; color: ${glucometer.status === "Connected" ? "green" : "red"};">${glucometer.status}</span>
        <div>
            <button>Settings</button>
            <button class="remove" onclick="removeGlucometer('${glucometer.id}')">Remove</button>
        </div>
    `; // TODO: Implement settings(allow viewer to change threshold, custom threshold, warning notification methods, etc.)
    viewerElement.style.display = "flex";
    viewerElement.style.justifyContent = "space-between";
    viewerElement.style.alignItems = "center";
    viewerElement.style.flexDirection = "row";
    viewerElement.style.width = "100%";
    document.getElementById("glucometerList").appendChild(viewerElement);
}
function addGlucometer() {
    // TODO
}