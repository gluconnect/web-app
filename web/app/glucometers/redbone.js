import { BleClient } from '@capacitor-community/bluetooth-le';

const GLUCONNECT_SERVICE = "00001808-0000-1000-8000-00805f9b34fb";
const GET_READING_CHAR = "00002a18-0000-1000-8000-00805f9b34fb"
const NUM_READING_CHAR = "00002a34-0000-1000-8000-00805f9b34fb"

//returns the device selected by user from list of devices scan
export async function searchDevices() {
    await BleClient.initialize({
        androidNeverForLocation: true
    });
      
    const dev = await BleClient.requestDevice({
        services: [GLUCONNECT_SERVICE],
        namePrefix: "Gluconnect",
    });

    return dev;
}
export async function attemptConnect(device){
    let deviceId = device.deviceId; // get the device id from the glucometer object
    // connect to the device
    await BleClient.connect(deviceId, (deviceId) => onDisconnect(deviceId));
    glucometer.setStatus("Connected"); // set the status to connected
    console.log('connected to device', deviceId);

    alert(await getNumReadings(glucometer));
}
export async function disconnectGlucometer(devid) {
    let dev = setGlucometerStatus(devid, "Disconnected"); // set the status to disconnected
    if (dev) {
        await BleClient.disconnect(dev.id); // disconnect the device
        console.log('disconnected from device', dev.deviceId);
    }
}
export async function getNumReadings(device){
    let deviceId = device.deviceId; // get the device id from the glucometer object
    // get services from the device
    await BleClient.getServices(deviceId).then((x) => {
        console.log("services", x);
    })
    //actually read the data from the device
    const result = await BleClient.read(deviceId, GLUCONNECT_SERVICE, NUM_READING_CHAR);
    return result.getBigUint64(0, true);
}
export async function getReadings(device, numReadings){
    let deviceId = device.deviceId; // get the device id from the glucometer object
    // get services from the device
    await BleClient.getServices(deviceId).then((x) => {
        console.log("services", x);
    })
    //loop from 0 to numReadings. For each one, set the get reading char to the value of i and wait for the value. add the value to readings and continue
    let readings = [];
    for(let i = 0; i < numReadings; i++){
        await BleClient.write(deviceId, GLUCONNECT_SERVICE, NUM_READING_CHAR, new Uint8Array([i])); // set the get reading char to the value of i
        const result = await BleClient.read(deviceId, GLUCONNECT_SERVICE, GET_READING_CHAR);
        let reading = result.getBigUint64(0, true); // get the reading from the device
        readings.push(reading); // add the reading to the list of readings
    }
    return readings; // return the list of readings
}