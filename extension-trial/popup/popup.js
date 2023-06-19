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
    // extracting the list of safe and unsafe websites from local storage
    const safeWebsites = localStorage.getItem("safeList");
    const unsafeWebsites = localStorage.getItem("unsafeList");
    // if they exist in local storage, retrieve them; otherwise, make a new list
    const safeList = safeWebsites ? JSON.parse(safeWebsites) : [];
    const unsafeList = unsafeWebsites ? JSON.parse(unsafeWebsites) : [];

    // get the information on the extension
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = tabs[0].url;
        const favicon = tabs[0].favIconUrl;
        websiteUrlElement.textContent = url;
        faviconImage.src = favicon;
        // Receive message from background.js for CA Info and update html
        browser.runtime.onMessage.addListener(
            (request, sender, sendResponse) => {
                if (request.rootCA) { // checking if root CA exists in the request
                    caInfo = request.rootCA;
                    const rootCAInfoElement = document.getElementById("rootCAInfo");
                    rootCAInfoElement.textContent = caInfo;
                    checkCA(url);
                }
            }
        );

        // if they click on the safe button, add the website to a list
        safe.addEventListener("click", function () {
            addToSensitive(url);
            notMarked.style.display = "none";
            markedSame.style.display = "block";
        });
        misMarked.addEventListener("click", function () {
            addToBlock(url);
        });
        misClicked.addEventListener("click", () => {
            window.close();
        });

    });

    /**
    // update the website information on the extension
    function updateInfo(tab) {
        /**
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
             
        }
    }
    */

    // Retrieve the stored information for the current website
    function retrieveStoredInfo(url) {
        return new Promise((resolve) => {
            browser.storage.local.get(url).then((result) => {
                if (result[url]) {
                    const [storedCAInfo, isSensitive] = result[url];
                    resolve({ storedCAInfo, isSensitive });
                } else {
                    resolve(null);
                }
            });
        });
    }

    // Update the popup based on the stored information and CA info comparison
    function updatePopup(url, storedCAInfo, isSensitive) {
        const notice = document.getElementById("notice");

        if (isSensitive) {
            notice.textContent = "This website has been marked sensitive. ";
        } else {
            notice.textContent = "This website has NOT been marked sensitive. ";
        }

        //Compare CA Info
        if (storedCAInfo && storedCAInfo !== caInfo) {
            notice.textContent += "CA Info Changed";
        } else {
            notice.textContent += "CA Info NOT Changed";
        }
    }

    // Get the current tab URL, retrieve stored information, and update the popup
    function tabUpdate() {
        const queryInfo = { active: true, currentWindow: true };

        browser.tabs.query(queryInfo).then((tabs) => {
            const currentTab = tabs[0];
            const currentUrl = currentTab.url;

            retrieveStoredInfo(currentUrl).then((storedInfo) => {
                if (storedInfo) {
                    const { storedCAInfo, isSensitive } = storedInfo;
                    updatePopup(currentUrl, storedCAInfo, isSensitive);
                } else {
                    updatePopup(currentUrl, null, false);
                }
            });
        });
    }

    browser.tabs.onActivated.addListener(tabUpdate); //event listener for tab change

    tabUpdate(); //initial function call on popup load

    //save caInfo and mark sensitive
    function addToSensitive(url) {
        browser.storage.local.set({ [url]: [caInfo, true] });
    }

    //save caInfo and block
    function addToBlock(url) {
        browser.storage.local.set({ [url]: [caInfo, false] });
    }

    //Check if CA Info has changed 
    function checkCA(url) {
        retrieveStoredInfo(url).then((storedInfo) => {
            if (storedInfo && storedInfo.storedCAInfo !== caInfo) {
                browser.storage.local.set({ [url]: [caInfo, storedInfo.isSensitive] });
            }
        });
    }
});


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