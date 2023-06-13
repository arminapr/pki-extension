document.addEventListener("DOMContentLoaded", () => {
    var nonSens = document.getElementById("nonSensitive");
    var sens = document.getElementById("sensitive");

    // call the functions to mark the website as either sensitive or not sensitive
    nonSens.addEventListener("click", () => {
        markWebsiteNonSensitive()});
    sens.addEventListener("click", () => {
        markWebsiteSensitive()});

    function markWebsiteNonSensitive() {
        // write this function
        var imageSrc = '../icons/sample-pic.png';
        var image = document.createElement('img');
        image.src = imageSrc;
        nonSens.appendChild(image);
    }

    function markWebsiteSensitive() {
        // write this function
        var sensitiveQ = document.getElementById("SensitiveQuestion");
        var secureQ = document.getElementById("SecurityQuestion");
        var trustQ = document.getElementById("TrustQuestion");

        sensitiveQ.style.display = "none";
        secureQ.style.display = "block";
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