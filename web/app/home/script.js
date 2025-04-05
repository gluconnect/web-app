var data;
let highCount = 0; // Initialize high count for threshold checking
function addToReadings(reading) {
    rd = [(new Date(reading.time)).toLocaleString(), reading.meal, reading.value, reading.measure_method, reading.comment];
    let tr = document.createElement("tr");
    if(reading.value>=data.threshold && data.threshold>=0){
        tr.className = "highreading";
        highCount++; // Increment high count if the reading is above the threshold
    }
    for(let i of rd){
        let td = document.createElement("td");
        td.innerHTML = i;
        tr.appendChild(td);
    }
    document.getElementById("readings").appendChild(tr);
}
function setThresholdForm(){
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
    if(data.threshold>=0)document.getElementById("thresholdinput").value = data.threshold;
    form.onsubmit = function() {
        let newThreshold = parseFloat(document.getElementById("thresholdinput").value);
        if(newThreshold >= -1){
            setThreshold(newThreshold);
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
}
function addReadingForm(){
    //create a form popup to add a reading
    let form = document.createElement("form");
    form.setAttribute("id", "readingform");
    //form.setAttribute("onsubmit", "return false;");
    form.innerHTML = `
        <h2>Add a Reading</h2>
        <label for="time">Time:</label>
        <input type="datetime-local" id="time" name="time" value="${new Date().toISOString().slice(0, 16)}" required>
        <label for="meal">Meal:</label>
        <select id="meal" name="meal" required>
            <option value="Before Meal">Before Meal</option>
            <option value="After Meal">After Meal</option>
        </select>
        <label for="value">Value:</label>
        <input type="number" id="value" name="value" required>
        <label for="method">Method:</label>
        <input type="text" id="method" name="method" value="blood sample" required>
        <label for="comment">Comments:</label>
        <input type="text" id="comment" name="comment">
        <button type="submit" id="submitreadingform">Add Reading</button><button id="cancelreadingform" class="cancel">Cancel</button>
    `;
    form.classList.add("form");
    document.body.appendChild(form);
    form.addEventListener("submit", (function(e) {
        e.preventDefault(); // Prevent default form submission
        let newReading = {
            meal: document.getElementById("meal").value,
            value: parseInt(document.getElementById("value").value),
            measure_method: document.getElementById("method").value,
            comment: document.getElementById("comment").value,
            time: new Date().toISOString()
        };
        this.newReading(newReading);
        document.body.removeChild(form);
        document.getElementById("content").style.display = "flex"; // Show the main content again
    }).bind(this));
    document.getElementById("cancelreadingform").onclick = function() {
        document.body.removeChild(form);
        document.getElementById("content").style.display = "flex"; // Show the main content again
    }
    document.getElementById("content").style.display = "none"; // Hide the main content while the form is open
}
function addReadings(){
    highCount = 0; // Reset high count for default sorting
    document.getElementById("readings").innerHTML = ""; // Clear previous readings
    for(let i = data.readings.length-1; i >= 0; i--) { // Add readings in reverse order to show the most recent first
        let reading = data.readings[i];
        addToReadings(reading); // sort by time (most recent first)
    }
    let elem = document.getElementById("highcount");
    if(highCount > 0 && data.threshold >= 0){
        elem.innerHTML = highCount;
        elem.parentElement.parentElement.style.display = "flex"; // Show the high count if there are high readings
    }else{
        elem.parentElement.parentElement.style.display = "none"; // Hide the high count if there are no high readings
    }
}
function resetSort(elem){ // optional element to avoid resetting the sort if we are calling from sort()
    document.getElementById("readingsLabels").querySelectorAll(".sortup, .sortdown").forEach(label => {
        if(elem!=null&&label!=elem||elem==null)label.classList.remove("sortup", "sortdown"); // Remove any existing sort classes
    });
}
function sort(attrIndex){
    if(attrIndex<0){ // default
        addReadings(); // Add the most recent readings to the top
        resetSort();
        return; // No need to sort if we are resetting to default sorting by time
    }
    let readings = document.getElementById("readings").children;
    let elem = document.getElementById("readingsLabels").children[attrIndex];
    let sortDirection = false; // descending by default
    if(elem.classList.contains("sortup")){
        elem.classList.remove("sortup");
        elem.classList.add("sortdown");
    } else if(elem.classList.contains("sortdown")){
        elem.classList.remove("sortdown");
        sort(-1); // If already sorted down, reset to default sorting (by time)
        return;
    }else{
        elem.classList.add("sortup"); // Set the current label to sort up
        sortDirection = true; // ascending
        resetSort(elem);
    }
    let sortedReadings = Array.from(readings).sort((a, b) => { // a and b are tr elements
        let aValue = a.children[attrIndex].innerHTML;
        let bValue = b.children[attrIndex].innerHTML;//each child is a td element, get the innerHTML of the td element at index attrIndex
        
        // Convert to date if the attribute is time
        if(attrIndex === 0) {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
            return sortDirection?(aValue - bValue):(bValue - aValue); // Compare dates
        }
        
        // Default comparison for other attributes
        return sortDirection?aValue.localeCompare(bValue, undefined, { numeric: true }): bValue.localeCompare(aValue, undefined, { numeric: true });
    });
    sortedReadings.forEach(reading => {
        document.getElementById("readings").appendChild(reading); // Append sorted reading back to the table
    });
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
    addReadings(); // Add the readings to the table
}
function updateData(){
    loadData();
    setData();
}
function showUpdateWarnings(){
    document.getElementById("updateWarningsPopup").style.removeProperty("display");
}
function error(msg){
    document.getElementById("errorMessage").innerHTML = msg; // Display error message
}
function success(msg){
    //document.getElementById("successMessage").innerHTML = msg; // Display success message
}