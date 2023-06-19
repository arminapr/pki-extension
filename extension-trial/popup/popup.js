// Global variable for CA info
let caInfo;

document.addEventListener("DOMContentLoaded", () => {
    var notMarked = document.getElementById("notMarked");
    var safe = document.getElementById("safe");
    var misMarked = document.getElementById("misMarked");
    var misClicked = document.getElementById("misClicked");
    var markedSame = document.getElementById("markedSameCert");
    var markedDiff = document.getElementById("markedDiffCert");
    var nonSens = document.getElementById("markedNonSensitive");
    var faviconImage = document.getElementById('faviconImage'); //Favicon (Logo)
    var websiteUrlElement = document.getElementById('websiteUrl'); //URL
    const rootCAInfoElement = document.getElementById("rootCAInfo");
    var safeWebsites = localStorage.getItem("safeList");
    if (safeWebsites) {
        var safeList = JSON.parse(storedList);
    } else {
        var safeList = [];
    }
    
    /*
     * Tab Info, Favicon, and URL
     */
    browser.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var currentTab = tabs[0];
        var url = currentTab.url;
        if (safeList.includes(url)) {
            notMarked.style.display="none";
            // TODO: add a conditional comparing the details of the certificates and if they are the same
            /*
             * if (prev certificate component != current) {
             *     markedSame.style.display = "block";
             * }
             * else {
             *     markedDiff.style.display = "block";
             * }
             */
        }
        //Display the website URL
        websiteUrlElement.textContent = url;

        // Get the favicon URL and set the HTML img content
        var faviconUrl = currentTab.favIconUrl;
        faviconImage.src = faviconUrl;

        // if they click on the safe button, add the website to a list
        safe.addEventListener("click", () => {
            addSafeWebsite();
        })

        function addSafeWebsite() {
            safeList.push(url);
        }
    });

    
    
    

    // Receive message from background.js for CA Info and update html
    browser.runtime.onMessage.addListener(
        (request, sender, sendResponse) => {
            if (request.rootCA){ // checking if root CA exists in the requesr
                caInfo = request.rootCA;
                rootCAInfoElement.textContent = request.rootCA;
            }
        }
    );


    // Call the functions to mark the website as either sensitive or not sensitive
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