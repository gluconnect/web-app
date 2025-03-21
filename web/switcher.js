var data = {
};
let frame = document.getElementById("content");
function go(page){
    frame.src = page+"/"+page+".html";
    if(page==="login"){
        document.getElementById("nav").style.display = "none"; // Hide the navigation bar on the login page
    }else{
        document.getElementById("nav").style.display = "flex"; // Show the navigation bar on other pages
    }
}
async function loadEverything(){
    data.threshold = await (await fetch("/get_threshold",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass })
    })).text();
    data.readings = await (await fetch("/get_readings",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: data.creds.email, password: data.creds.pass })
    })).json();
    data.readings = data.readings.reverse(); // Reverse the readings to show the most recent first
}
window.onmessage = async function(event) {
    if (Object.hasOwn(event.data, 'email')){ // login
        data.creds = event.data;
        data.name = event.data.name;
        await loadEverything();
        go("home");
        frame.onload = ()=>{frame.contentWindow.postMessage(data, "*");}
    }else if(event.data==='logout'){ // logout
        data = {};
        go("login");
    }else if(Object.hasOwn(event.data, 'setThreshold')){ // set threshold
        let res = await fetch("/change_threshold",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, threshold: event.data.setThreshold })
        });
        if(res.status === 200){
            data.threshold = event.data.setThreshold;
            frame.contentWindow.postMessage(data, "*");
        }else{
            frame.contentWindow.postMessage({error: "Failed to set threshold"}, "*"); // Notify the frame of the error
        }
    }else if(Object.hasOwn(event.data, 'newReading')){ // add new reading
        let res = await fetch("/add_reading",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, reading: event.data.newReading })
        });
        if(res.status === 200){
            data.readings.unshift(event.data.newReading); // Add the new reading to the front of the list
            frame.contentWindow.postMessage(data, "*");
        }else{
            frame.contentWindow.postMessage({error: "Failed to add reading"}, "*"); // Notify the frame of the error
        }
    }else if(event.data === "deleteAccount"){ // delete account
        let res = await fetch("/delete",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: data.creds.email, password: data.creds.pass })
        });
        if(res.status === 200){
            data = {};
            go("login"); // Redirect to login after deletion
        }else{
            frame.contentWindow.postMessage({error: "Failed to delete account"}, "*"); // Notify the frame of the error
        }
    }else if(Object.hasOwn(event.data, "changeName")){
        data.name = event.data.changeName;
        let res = await fetch("/change_name",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, newname: data.name })
        });
        if(res.status !== 200){
            frame.contentWindow.postMessage({error: "Failed to change name"}, "*"); // Notify the frame of the error
        }else{
            data.name = event.data.changeName; // Update the name in the data object
            frame.contentWindow.postMessage(data, "*"); // Notify the frame of the change
            frame.contentWindow.postMessage({success: "Name changed successfully"}, "*"); // Notify the frame of the success
        }
    }else if(Object.hasOwn(event.data, "changeEmail")){
        data.creds.email = event.data.changeEmail;
        let res = await fetch("/change_email",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, newemail: data.creds.email })
        });
        if(res.status !== 200){
            frame.contentWindow.postMessage({error: "Failed to change email"}, "*"); // Notify the frame of the error
        }else{
            data.creds.email = event.data.changeEmail; // Update the email in the data object
            frame.contentWindow.postMessage(data, "*"); // Notify the frame of the change
            frame.contentWindow.postMessage({success: "Email changed successfully"}, "*"); // Notify the frame of the success
        }
    }else if(Object.hasOwn(event.data, "changePassword")){
        let res = await fetch("/change_password",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: data.creds.email, password: data.creds.pass, newpassword: event.data.changePassword })
        });
        if(res.status !== 200){
            frame.contentWindow.postMessage({error: "Failed to change password"}, "*"); // Notify the frame of the error
        }else{
            data.creds.pass = event.data.changePassword; // Update the password in the data object
            frame.contentWindow.postMessage(data, "*"); // Notify the frame of the change
            frame.contentWindow.postMessage({success: "Password changed successfully"}, "*"); // Notify the frame of the success
        }
    }
}
go("login"); // Start with the login page