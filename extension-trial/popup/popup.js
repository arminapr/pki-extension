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
        browser.runtime.onMessage.addListener((request) => {
            if (request.rootCA) { // Check if root CA exists in the request
                caInfo = request.rootCA;
                document.getElementById("rootCAInfo").textContent = caInfo;
                checkCA(url, caInfo);
            }
        });

        // if they click on the safe button, add the website to a list
        safe.addEventListener("click", function () {
            handleSiteAddition(url, "safe");
            notMarked.style.display = "none";
            markedSame.style.display = "block";
        });
        misMarked.addEventListener("click", function () {
            handleSiteAddition(url, "unsafe");
        });
        misClicked.addEventListener("click", () => {
            window.close();
        });

    });

    function handleSiteAddition(url, type) {
        browser.storage.local.get(type, (result) => {
            let sitesList = result[type] ? result[type] : {};
            sitesList[url] = caInfo;
            browser.storage.local.set({ [type]: sitesList });
        });
    }

    function checkCA(url, currentCaInfo) {
        browser.storage.local.get(["safe", "unsafe"], (result) => {
            let isSensitiveSite = result.safe && result.safe[url];
            let isUnsafeSite = result.unsafe && result.unsafe[url];
            let previousCaInfo = isSensitiveSite ? result.safe[url] : (isUnsafeSite ? result.unsafe[url] : null);

            if (isSensitiveSite || isUnsafeSite) {
                if (previousCaInfo === currentCaInfo) {
                    markedSame.style.display = "block";
                    document.getElementById("notice").textContent = "SAME";
                } else {
                    markedDiff.style.display = "block";
                    document.getElementById("notice").textContent = "DIFF";
                }
            } else {
                notMarked.style.display = "block";
                document.getElementById("notice").textContent = "NOPE";
            }
        });
    }
});