async function login(username, password, url){
    let res;
    try{res = await fetch(url+"/verify", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: username, password: password })
    });}catch(e){
        error("Server not reachable. Please try again later"); // Notify the user if the server is not reachable
        return;
    }
    // If response is 200, log in is successful
    console.log(url);
    if(res.status === 200){
        await setCreds({ email: username, pass: password, name: await res.text(), server: url});
        window.location.href = "../home/index.html"; // Redirect to home page
    } else {
        error("Invalid username or password. Please try again.");
    }
}