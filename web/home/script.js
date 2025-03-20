var data;
function addToReadings(reading) {
    rd = [new Date(reading.time), reading.meal, reading.value, reading.measure_method, reading.comment];
    let tr = document.createElement("tr");
    if(reading.value>=data.threshold && data.threshold>=0){
        tr.className = "highreading";
    }
    for(let i of rd){
        let td = document.createElement("td");
        td.innerHTML = i;
        tr.appendChild(td);
    }
    document.getElementById("readings").appendChild(tr);
}
function setThreshold(){
    //create a form
}
function loadData() {
    document.getElementById("username").innerHTML = data.name;
    if(data.threshold<0){
        document.getElementById("thresholdinfo").innerHTML = "You do not currently have a set threshold.";
        document.getElementById("threshold").innerHTML = "";
    }else{
        document.getElementById("thresholdinfo").innerHTML = "Your current threshold:";
        document.getElementById("threshold").innerHTML = data.threshold;
    }
    document.getElementById("readingcount").innerHTML = data.readings.length;
    for(let reading of data.readings) {
        addToReadings(reading);
    }
}
window.onmessage = function(event) {
    if (event.data && Object.hasOwn(event.data, 'creds')) {
        data = event.data;
        loadData();
    }
}