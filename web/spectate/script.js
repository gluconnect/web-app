var spectate;
let highCount = 0; // Initialize high count for readings above the threshold
let showLastRead = true; // Default to showing last read readings
function addToReadings(reading, isAfterLastRead = true) { // Add a reading to the table, with an optional filter for last read time
    rd = [(new Date(reading.time)).toLocaleString(), reading.meal, reading.value, reading.measure_method, reading.comment];
    let tr = document.createElement("tr");
    if(reading.value>=spectate.threshold && spectate.threshold>=0){
        tr.className = "highreading";
        highCount++; // Increment high count if the reading is above the threshold
    }
    if(!isAfterLastRead) {
        tr.classList.add("read"); // Add a class for read readings
    }

    for(let i of rd){
        let td = document.createElement("td");
        td.innerHTML = i;
        tr.appendChild(td);
    }
    document.getElementById("readings").appendChild(tr);
}
function toggleShowRead(){
    showLastRead = !showLastRead; // Toggle the state
    document.getElementById("toggleLastRead").innerHTML = showLastRead ? "Hide Viewed Readings" : "Show Viewed Readings";
    addReadings(); // Refresh the readings to apply the new filter
}

function addReadings(){
    highCount = 0; // Reset high count for default sorting
    document.getElementById("readings").innerHTML = ""; // Clear previous readings
    for(let reading of spectate.readings) {
        if(!spectate.lastRead)
            addToReadings(reading); // sort by time (most recent first)
        else if(showLastRead) { // Only add readings after the last read time   
            addToReadings(reading, new Date(reading.time) >= new Date(spectate.lastRead)); // Add to readings if it's after the last read time
        }else if(new Date(reading.time) >= new Date(spectate.lastRead)){
            addToReadings(reading); // reading is read
        }
    }
    let elem = document.getElementById("highcount");
    if(highCount > 0 && spectate.threshold >= 0){
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
    document.getElementById("username").innerHTML = spectate.name;
    if(spectate.threshold<0){
        document.getElementById("thresholdinfo").innerHTML = "No threshold set";
        document.getElementById("threshold").innerHTML = "";
    }else{
        document.getElementById("thresholdinfo").innerHTML = "Current set threshold:";
        document.getElementById("threshold").innerHTML = spectate.threshold;
    }
    document.getElementById("readingcount").innerHTML = spectate.readings.length;
    if(spectate.lastRead){
        document.getElementById("lastRead").innerHTML = (new Date(spectate.lastRead)).toLocaleString();
        document.getElementById("lastRead").parentElement.style.display = "block"; // Show the last read time
    }
    else document.getElementById("lastRead").parentElement.innerHTML = "none";
    addReadings();
}
window.onmessage = function(event) {
    if (event.data && Object.hasOwn(event.data, 'email')) {
        spectate = event.data; // Get the data from the parent
        loadData();
    }else if(event.data && event.data.error){
        document.getElementById("errorMessage").innerHTML = event.data.error; // Display error message
    }
}