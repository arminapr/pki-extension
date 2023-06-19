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

    var safeWebsites = localStorage.getItem("safeList");
    if (safeWebsites) {
        var safeList = JSON.parse(storedList);
    } else {
        var safeList = [];
    }

    // update the website information on the extension
    function updateInfo(tab) {
        const url = tab.url;
        if (safeList.includes(url)) {
            notMarked.style.display = "none";
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
        faviconImage.src = tab.favIconUrl;
    }

    // get the information on the extension
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        updateInfo(tabs[0]);
    });


    // Receive message from background.js for CA Info and update html
    browser.runtime.onMessage.addListener(
        (request, sender, sendResponse) => {
            if (request.rootCA){ // checking if root CA exists in the request
                caInfo = request.rootCA;
                const rootCAInfoElement = document.getElementById("rootCAInfo");
                rootCAInfoElement.textContent = caInfo;
            }
        }
    );


    // if they click on the safe button, add the website to a list
    safe.addEventListener("click", () => {
        applyTo(addSafeWebsite);
    });
    misMarked.addEventListener("click", () => {
        applyTo(addUnsafeWebsite);
    });
    misClicked.addEventListener("click", () => {
        window.close();
    });
})

function addToSensitive(url){
    browser.storage.local.set({ [url]: [caInfo, true] });
}

function addToBlock(url){
    browser.storage.local.set({ [url]: [caInfo, false] });
}


/**
// we can't set this in checkChange because it would update every time
var prevCA;
if (!prevCA) {
    prevCA = "Distrust"; // dummy value
}
*/

/** function checkChange(url) {
    const currCA = "Entrust"; // dummy value
    // check if the current CA is the same as the previous one
    if (currCA != prevCA) {
        var shouldTrust = window.confirm('The digital certificate has changed. Do you still trust this website?');

        if (shouldTrust) {
            prevCA = currCA;
        } else {
            // markWebsiteNotSecure();
        }
    }
} */