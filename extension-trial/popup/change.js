document.addEventListener("DOMContentLoaded", () => {
    var nonSens = document.getElementById("nonSensitive");
    var sens = document.getElementById("sensitive");
    var sensitiveQ = document.getElementById("SensitiveQuestion");
    var secureQ = document.getElementById("SecurityQuestion");
    var trustQ = document.getElementById("TrustQuestion");
    var nonSecure = document.getElementById("notSecure");
    var secure = document.getElementById("secure");
    var nonSecureText = document.getElementById("nonSecureText");
    var secureText = document.getElementById("secureText");

    // call the functions to mark the website as either sensitive or not sensitive
    nonSens.addEventListener("click", () => {
        markWebsiteNonSensitive()});
    sens.addEventListener("click", () => {
        markWebsiteSensitive()});
    nonSecure.addEventListener("click", () => {
        markWebsiteNonSecure()}); // have to write this function
    secure.addEventListener("click", () => {
        markWebsiteSecure()}); // have to write this function

    // this is a dummy function right now
    function markWebsiteNonSensitive() {
        // write this function
        var imageSrc = '../icons/sample-pic.png';
        var image = document.createElement('img');
        image.src = imageSrc;
        nonSens.appendChild(image);
    }

    // changes the question and asks whether the website is secure
    function markWebsiteSensitive() {
        sensitiveQ.style.display = "none";
        secureQ.style.display = "block";
    }

    // changes the question to ask why the website is not secure
    function markWebsiteNonSecure() {
        secureQ.style.display = "none";
        trustQ.style.display = "block";
    }

    function markWebsiteSecure() {
        secureQ.style.display = "none";
        secureText.style.display = "block";
    }
})

// we can't set this in checkChange because it would update every time
var prevCA; 
if (!prevCA) {
    prevCA = "Distrust"; // dummy value
}

function checkChange(url) {
    const currCA = "Entrust"; // dummy value
    // check if the current CA is the same as the previous one
    if (currCA != prevCA) {
        var shouldTrust = window.confirm('The digital certificate has changed. Do you still trust this website?');

        if (shouldTrust) {
            prevCA = currCA;
        } else {
            markWebsiteNotSecure();
        }
    }
}