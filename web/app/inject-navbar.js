function go(page){
    window.location.href = "../"+page+"/index.html"; // Redirect to the specified page
}
let navbar = document.createElement("footer");
navbar.id = "nav";
navbar.innerHTML = `
        <button id="home" onclick="go('home')">Home</button>
        <button id="refreshGlucoReadings" onclick="connectAndGetReadings()">Synchronize Readings</button>
        <button id="users" onclick="go('users')">Patients and Caretakers<br><span style="display: none;" class="warning"><span id="warningCount">0</span> Warning(s)!</span></button>
        <button id="settings" onclick="go('settings')">Settings</button>`;
document.body.appendChild(navbar);
let i = document.createElement("span")
i.id = "fetchReadingsNotification"
i.classList.add("popup");
document.body.prepend(i);