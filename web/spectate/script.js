var spectate;
function addToReadings(reading) {
    rd = [new Date(reading.time), reading.meal, reading.value, reading.measure_method, reading.comment];
    let tr = document.createElement("tr");
    if(reading.value>=spectate.threshold && spectate.threshold>=0){
        tr.className = "highreading";
    }
    for(let i of rd){
        let td = document.createElement("td");
        td.innerHTML = i;
        tr.appendChild(td);
    }
    document.getElementById("readings").appendChild(tr);
}
/*function setThreshold(){
    //create a form popup to set the threshold
    let form = document.createElement("form");
    form.setAttribute("id", "thresholdform");
    form.setAttribute("onsubmit", "return false;");
    form.innerHTML = `
        <label for="threshold">Set your threshold:</label>
        <input type="number" id="thresholdinput" name="threshold" min="-1" step="any" required>
        <button type="submit" id="submitthresholdform">Set</button><button id="cancelthresholdform" class="cancel">Cancel</button><button id="removethreshold">Remove Threshold</button>
    `;
    form.classList.add("form");
    document.body.appendChild(form);
    document.getElementById("thresholdinput").value = data.threshold;
    form.onsubmit = function() {
        let newThreshold = parseFloat(document.getElementById("thresholdinput").value);
        if(newThreshold >= -1){
            window.parent.postMessage({setThreshold: newThreshold}, "*");
        }else{
            alert("Threshold must be a non-negative number or -1 to remove the threshold.");
        }
        document.body.removeChild(form);
        document.getElementById("content").style.display = "flex"; // Show the main content again
    };
    document.getElementById("cancelthresholdform").onclick = function() {
        document.body.removeChild(form);
        document.getElementById("content").style.display = "flex"; // Show the main content again
    }
    document.getElementById("removethreshold").style.marginTop = "60px"; // Adjust padding for the cancel button
    document.getElementById("removethreshold").onclick = function() {
        data.threshold = -1;
        document.getElementById("submitthresholdform").click(); // Trigger the form submission to update the threshold
    }
    document.getElementById("content").style.display = "none"; // Hide the main content while the form is open
}*/
function loadData() {
    document.getElementById("username").innerHTML = spectate.name;
    if(spectate.threshold<0){
        document.getElementById("thresholdinfo").innerHTML = "No threshold set";
        document.getElementById("threshold").innerHTML = "";
    }else{
        document.getElementById("thresholdinfo").innerHTML = "Current set threshold:";
        document.getElementById("threshold").innerHTML = spectate.threshold;
    }
    document.getElementById("readingcount").innerHTML = spectate.readings.length;
    document.getElementById("readings").innerHTML = ""; // Clear previous readings
    for(let reading of spectate.readings) {
        addToReadings(reading);
    }
}
window.onmessage = function(event) {
    if (event.data && Object.hasOwn(event.data, 'email')) {
        spectate = event.data; // Get the data from the parent
        loadData();
    }else if(event.data && event.data.error){
        document.getElementById("errorMessage").innerHTML = event.data.error; // Display error message
    }
}