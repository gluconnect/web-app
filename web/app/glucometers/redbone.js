import { BleClient } from '@capacitor-community/bluetooth-le';

const GLUCONNECT_SERVICE = "00001808-0000-1000-8000-00805f9b34fb";
const GET_READING_CHAR = "00002a18-0000-1000-8000-00805f9b34fb"
const NUM_READING_CHAR = "00002a34-0000-1000-8000-00805f9b34fb"

//returns the device selected by user from list of devices scan
window.searchDevices = async function() {
    await BleClient.initialize({
        androidNeverForLocation: true
    });
      
    const dev = await BleClient.requestDevice({
        services: [GLUCONNECT_SERVICE],
        namePrefix: "Gluconnect",
    });

    return dev;
}
window.attemptConnect = async function(device){
    const deviceId = device.deviceId; // get the device id from the glucometer object
    // connect to the device
    await BleClient.connect(deviceId, (deviceId) => onDisconnect(deviceId));
    console.log('connected to device', deviceId);
}
window.getNumReadings = async function(device){
    let deviceId = device.deviceId; // get the device id from the glucometer object
    //actually read the data from the device
    const result = await BleClient.read(deviceId, GLUCONNECT_SERVICE, NUM_READING_CHAR);
    return result.getBigUint64(0, true);
}
window.getReadings = async function(device, numReadings){
    let deviceId = device.deviceId; // get the device id from the glucometer object
    //loop from 0 to numReadings. For each one, set the get reading char to the value of i and wait for the value. add the value to readings and continue
    let readings = [];
    for(let i = 0; i < numReadings; i++){
        await BleClient.write(deviceId, GLUCONNECT_SERVICE, GET_READING_CHAR, new Uint8Array([i])); // set the get reading char to the value of i
        const result = await BleClient.read(deviceId, GLUCONNECT_SERVICE, GET_READING_CHAR);
        const decoder = new TextDecoder('utf-8'); // Specify the encoding
        const reading = JSON.parse(decoder.decode(result)); // get the reading from the device
        console.log("Obtained Reading:", reading)
        readings.push(reading); // add the reading to the list of readings
    }

    return readings; // return the list of readings
}