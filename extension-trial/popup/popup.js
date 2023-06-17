document.addEventListener("DOMContentLoaded", () => {
    const notMarked = document.getElementById("notMarked");
    const safe = document.getElementById("safe");
    const misMarked = document.getElementById("misMarked");
    const misClicked = document.getElementById("misClicked");
    const trustText = document.getElementById("trustText");
    const untrustText = document.getElementById("untrustText");
    const markedSame = document.getElementById("markedSameCert");
    const markedDiff = document.getElementById("markedDiffCert");
    const nonSens = document.getElementById("markedNonSensitive");
    const faviconImage = document.getElementById("faviconImage"); //Favicon (Logo)
    const websiteUrlElement = document.getElementById("websiteUrl"); //URL
    // retreieves the list of safe and unsafe websites from the local storage
    const safeWebsites = localStorage.getItem("safeList");
    const unsafeWebsites = localStorage.getItem("unsafeList");
    // if they exist, retrieve them, if not make an empty array
    const safeList = safeWebsites ? JSON.parse(safeWebsites) : [];
    const unsafeList = unsafeWebsites ? JSON.parse(unsafeWebsites) : [];

    function applyTo(func) {
        browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const currentTab = tabs[0];
            const url = currentTab.url;
            func(url);
        });
    }

    // add a domain to the safe list
    function addSafeWebsite(url) {
        safeList.push(url);
        notMarked.style.display="none";
        trustText.style.display="block";
    }

    // add a domain to the unsafe list
    function addUnsafeWebsite(url) {
        unsafeList.push(url);
        notMarked.style.display="none";
        untrustText.style.display="block";
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
            if (request.rootCA) { // checking if root CA exists in the requesr
                const rootCAInfoElement = document.getElementById("rootCAInfo");
                rootCAInfoElement.textContent = request.rootCA;
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
        setTimeout(() => {
            window.close(); // I don't think this works
        }, 100)
    });
})

// we can't set this in checkChange because it would update every time
var prevCA;
if (!prevCA) {
    prevCA = "Distrust"; // dummy value
}

/* function checkChange(url) {
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