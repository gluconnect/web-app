import { BleClient } from '@capacitor-community/bluetooth-le';

const GLUCONNECT_SERVICE = "00001808-0000-1000-8000-00805f9b34fb";
const GET_READING_CHAR = "00002a18-0000-1000-8000-00805f9b34fb"
const NUM_READING_CHAR = "00002a34-0000-1000-8000-00805f9b34fb"

async function attemptConnect(glucometer){
    let deviceId = glucometer.id; // get the device id from the glucometer object
    // connect to the device
    await BleClient.connect(deviceId, (deviceId) => onDisconnect(deviceId));
    glucometer.setStatus("Connected"); // set the status to connected
    console.log('connected to device', dev.deviceId);
}
async function disconnectGlucometer(devid) {
    let dev = setGlucometerStatus(devid, "Disconnected"); // set the status to disconnected
    if (dev) {
        await BleClient.disconnect(dev.id); // disconnect the device
        console.log('disconnected from device', dev.deviceId);
    }
}
async function getReadingsFromGlucometer(glucometer){
    let deviceId = glucometer.id; // get the device id from the glucometer object
    // get services from the device
    await BleClient.getServices(deviceId).then((x) => {
        console.log("services", x);
    })
    //actually read the data from the device
    const result = await BleClient.read(deviceId, GLUCONNECT_SERVICE, NUM_READING_CHAR);
    const decoded = result.getBigUint64(0, true);
    console.log("DECODED READINGS:", decoded)
}