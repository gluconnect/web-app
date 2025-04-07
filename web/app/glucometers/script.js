import { BleClient } from '@capacitor-community/bluetooth-le';

const GLUCONNECT_SERVICE = "00001808-0000-1000-8000-00805f9b34fb";
const GET_READING_CHAR = "00002a18-0000-1000-8000-00805f9b34fb"
const NUM_READING_CHAR = "00002a34-0000-1000-8000-00805f9b34fb"

class Glucometer {
    constructor(id, name, status) {
        this.id = id; // ble device id
        this.name = name; // user given name
        this.status = status; // Connected, Disconnected, etc.
    }
    connect() {
        attemptConnect(this); // attempt to connect to the device
    }
    getReadings() {
        getReadingsFromGlucometer(this); // get the readings from the device
    }
    disconnect() {
        disconnectGlucometer(this.id); // disconnect the device
    }
    setStatus(status) {
        this.status = status; // set the status of the device
        loadData(); // reload the list
    }
}
window.appendGlucometer = function(glucometer) {
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

// Set glucometer status to disconnected
window.setGlucometerStatus = function(devid, status) {
    for (let i = 0; i < glucometers.length; i++) {
        if (glucometers[i].id === devid) {
            glucometers[i].status = status;
            loadData(); // reload the list
            return glucometers[i];
        }
    }
    return null; // device not found in the list
}
window.addGlucometer = function(devid, name, status) {
    let dev = new Glucometer(devid, name, status);
    glucometers.push(dev); // add the device to the list
    appendGlucometer(dev); // add the device to the list on the page
    dev.connect(); // connect to the device
}

//remove the glucometer from the list
window.removeGlucometer = function(devid) {
    disconnectGlucometer(devid); // disconnect the device
    for (let i = 0; i < glucometers.length; i++) {
        if (glucometers[i].id === devid) {
            glucometers.splice(i, 1); // remove the device from the list
            loadData(); // reload the list
            return;
        }
    }
}

window.onDisconnect = function(devid) {
    let dev = setGlucometerStatus(devid, "Disconnected"); // remove the device from the list
    if (dev === null) {
        console.log("Device not found in list");
        return;
    }
    alert("Glucometer disconnected: " + dev.name);
}

window.newGlucometer = async function () {
    console.log("started scan for ble devices")
    try {
        await BleClient.initialize({
            androidNeverForLocation: true
        });
  
        const dev = await BleClient.requestDevice({
            services: [GLUCONNECT_SERVICE],
            namePrefix: "Gluconnect",
        });

        addGlucometer(dev.deviceId, dev.name, "?"); // add the device to the list
    
    
        setTimeout(async () => {
            await BleClient.disconnect(dev.deviceId);
        }, 5000);
    } catch (error) {
      console.log(error);
    }
}
window.loadData = function(){
    document.getElementById("glucometerList").innerHTML = ""; // clear the list
    for (let j = 0; j < glucometers.length; j++) {
        appendGlucometer(glucometers[j]); // re-add all glucometers to the list
    }
    document.getElementById("currentGlucometerCount").innerHTML = glucometers.length; // Set the warning count
}
window.updateData = function(){
    loadData();
    setGlucometers();
}
// adding sequence - button press - newGlucometer() searches for nearby ble devices - addGlucometer() creates a new glucometer object and adds it to the list - connect() calls attemptConnect() - attemptConnect() attempts to connect to the device
// removal sequence - onDisconnect() handles disconnection of the device -