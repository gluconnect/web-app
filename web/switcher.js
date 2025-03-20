var data = {
};
let frame = document.getElementById("content");
function go(page){
    frame.src = page+"/"+page+".html";
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
    if (Object.hasOwn(event.data, 'email')){
        data.creds = event.data;
        data.name = event.data.name;
        await loadEverything();
        go("home");
        frame.onload = ()=>{frame.contentWindow.postMessage(data, "*");}
    }else if(Object.hasOwn(event.data, 'setThreshold')){
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
    }
}