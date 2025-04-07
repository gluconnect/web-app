import { BleClient } from '@capacitor-community/bluetooth-le';

const GLUCONNECT_SERVICE = "00001808-0000-1000-8000-00805f9b34fb";
const GET_READING_CHAR = "00002a18-0000-1000-8000-00805f9b34fb"
const NUM_READING_CHAR = "00002a34-0000-1000-8000-00805f9b34fb"

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
async function addGlucometer() {
    console.log("started scan")
    try {
      await BleClient.initialize({
          androidNeverForLocation: true
      });
  
    const dev = await BleClient.requestDevice({
        services: [GLUCONNECT_SERVICE],
        namePrefix: "Gluconnect",
    });

    await BleClient.connect(dev.deviceId, (deviceId) => onDisconnect(deviceId));
    console.log('connected to device', dev.deviceId);
  
    await BleClient.getServices(dev.deviceId).then((x) => {
        console.log("services", x);
    })

    const result = await BleClient.read(dev.deviceId, GLUCONNECT_SERVICE, NUM_READING_CHAR);
    alert("readings:", result);
  
  
    setTimeout(async () => {
        await BleClient.disconnect(dev.deviceId);
    }, 5000);
    } catch (error) {
      console.log(error);
    }
}