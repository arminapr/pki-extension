// Global variable for CA info
let caInfo;


document.addEventListener("DOMContentLoaded", () => {
    const buttons = {
        visit: document.getElementById("visit"),
        safe: document.getElementById("safe"),
        misMarked: document.getElementById("misMarked"),
        misClicked: document.getElementById("misClicked"),
        settings: document.getElementById("settings")
    };

    const siteStatusDivs = {
        unsecure: document.getElementById("unsecure"),
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
            if (request.secure) {
                if (request.secure === "no") {
                    siteStatusDivs.notMarked.style.display = "none";
                    siteStatusDivs.unsecure.style.display = "block";
                }
            }
        });


        buttons.visit.addEventListener("click", function () {
            window.close();
        })
        // if they click on the safe button, add the website to the safe list
        buttons.safe.addEventListener("click", function () {
            handleSiteAddition(url, "safe");
        });

        // if they click on the mismarked button, add the website to the unsafe list
        buttons.misMarked.addEventListener("click", function () {
            handleSiteAddition(url, "unsafe");
        });

        // if they click on the misclicked button, close the extension
        buttons.misClicked.addEventListener("click", () => {
            window.close();
        });

        buttons.settings.addEventListener("click", () => {
            resetText();
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
            siteStatusDivs.untrustText.style.display = "none";
            siteStatusDivs.trustText.style.display = "block";
        } else if (type === "unsafe") {
            siteStatusDivs.trustText.style.display = "none";
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
            let isUnsafeSite = result.unsafe && result.unsafe[url]; // TODO: do we need this?

            let previousCaInfo = isSensitiveSite
                ? result.safe[url]
                : (isUnsafeSite
                    ? result.unsafe[url]
                    : null); // If the website is found, get the stored CA info for that website

            if (isSensitiveSite || isUnsafeSite) {
                siteStatusDivs.notMarked.style.display = "none";
                if (previousCaInfo === currentCaInfo) { // If the stored CA info matches the current CA info, display the "same CA" message
                    siteStatusDivs.markedDiff.style.display = "none";
                    siteStatusDivs.markedSame.style.display = "block";
                    document.getElementById("notice").textContent = "same certificate";
                    setTimeout(() => {  // Close window after 3 seconds
                        window.close();
                    }, 3000);
                } else { // If the stored CA info does not match the current CA info, display the "different CA" message
                    siteStatusDivs.markedSame.style.display = "none";
                    siteStatusDivs.markedDiff.style.display = "block";
                    document.getElementById("notice").textContent = "different certificate";
                    let buttons = { // Lets the user choose whether to continue to trust this site
                        conTrust: document.getElementById("conTrust"),
                        stopTrust: document.getElementById("stopTrust")
                    };
                    buttons.conTrust.addEventListener("click", function () { // If user wants to continue to trust, update CA info but keep url on safe list
                        handleSiteAddition(url, "safe");
                    });
                    buttons.stopTrust.addEventListener("click", function () { // If user does not want to trust, remove url from safe list and add it to unsafe list
                        browser.storage.local.remove(url);
                        handleSiteAddition(url, "unsafe");
                    });
                }
            } else { // If the website does not exist in either of the lists, display the "not marked" message
                siteStatusDivs.notMarked.style.display = "block";
                document.getElementById("notice").textContent = "no certificate saved";
            }
        });
    }

    // removes all the status 
    function resetText() {
        for (const key in siteStatusDivs) {
            key.style.display = "none";
        }
        return;
    }
});