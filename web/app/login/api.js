async function login(username, password, url){
    let res = await fetch(url+"/verify", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: username, password: password })
    });
    // If response is 200, log in is successful
    if(res.status === 200){
        await setCreds({ email: username, pass: password, name: await res.text(), server: url});
        window.location.href = "../home/index.html"; // Redirect to home page
    } else {
        error("Invalid username or password. Please try again.");
    }
}