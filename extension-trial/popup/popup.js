// Global variable for CA info
let caInfo;

document.addEventListener("DOMContentLoaded", () => {
    const buttons = {
        safe: document.getElementById("safe"),
        misMarked: document.getElementById("misMarked"),
        misClicked: document.getElementById("misClicked")
    };

    const siteStatusDivs = {
        notMarked: document.getElementById("notMarked"),
        markedSame: document.getElementById("markedSameCert"),
        markedDiff: document.getElementById("markedDiffCert"),
        nonSens: document.getElementById("markedNonSensitive"),
        untrustText: document.getElementById("untrustText"),
        trustText: document.getElementById("trustText")
    };

    var faviconImage = document.getElementById('faviconImage'); //Favicon (Logo)
    var websiteUrlElement = document.getElementById('websiteUrl'); //URL

    // get the information on the extension
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = tabs[0].url;
        const favicon = tabs[0].favIconUrl;
        websiteUrlElement.textContent = url;
        faviconImage.src = favicon;

        // Receive message from background.js for CA Info and update html
        browser.runtime.onMessage.addListener((request) => {
            if (request.rootCA) { // Check if root CA exists in the request
                caInfo = request.rootCA;
                document.getElementById("rootCAInfo").textContent = caInfo;
                checkCA(url, caInfo);
            }
        });

        // if they click on the safe button, add the website to a list
        buttons.safe.addEventListener("click", function () {
            handleSiteAddition(url, "safe");
        });
        buttons.misMarked.addEventListener("click", function () {
            handleSiteAddition(url, "unsafe");
        });
        buttons.misClicked.addEventListener("click", () => {
            window.close();
        });

    });

    /**
     * Responsible for adding sites to list
     * Retrieve current list from storage --> add new website --> save list back to storage
     * Also display message for safe site
     * @param {string} url 
     * @param {string} type 
     */
    function handleSiteAddition(url, type) {
        browser.storage.local.get(type, (result) => { //get current list of storage
            let sitesList = result[type] ? result[type] : {}; //If list exists, use it. Otherwise, create new object
            sitesList[url] = caInfo; //add website and caInfo to list
            browser.storage.local.set({ [type]: sitesList }); //save list to storage
        });
        siteStatusDivs.notMarked.style.display = "none";
        if (type === "safe") {
            siteStatusDivs.trustText.style.display = "block";
        } else if (type === "unsafe") {
            siteStatusDivs.untrustText.style.display = "block";
        }
    }

    /**
     * Responsible for comparing current caInfo with stored caInfo
     * @param {string} url 
     * @param {string} currentCaInfo 
     */
    function checkCA(url, currentCaInfo) {
        browser.storage.local.get(["safe", "unsafe"], (result) => { //Get current list of storage
            //Check if the current website exists in either of the lists
            let isSensitiveSite = result.safe && result.safe[url];
            let isUnsafeSite = result.unsafe && result.unsafe[url];

            let previousCaInfo = isSensitiveSite ? result.safe[url] : (isUnsafeSite ? result.unsafe[url] : null); // If the website is found, get the stored CA info for that website

            if (isSensitiveSite || isUnsafeSite) {
                if (previousCaInfo === currentCaInfo) { // If the stored CA info matches the current CA info, display the "same CA" message
                    siteStatusDivs.markedSame.style.display = "block";
                    document.getElementById("notice").textContent = "same certificate";
                } else { // If the stored CA info does not match the current CA info, display the "different CA" message
                    siteStatusDivs.markedDiff.style.display = "block";
                    document.getElementById("notice").textContent = "different certificate";
                }
            } else { // If the website does not exist in either of the lists, display the "not marked" message
                siteStatusDivs.notMarked.style.display = "block";
                document.getElementById("notice").textContent = "no certificate saved";
            }
        });
    }
});