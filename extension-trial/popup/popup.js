// Global variable for CA info
let caInfo;

document.addEventListener("DOMContentLoaded", () => {
    const buttons = {
        visit: document.getElementById("visit"),
        safe: document.getElementById("safe"),
        misMarked: document.getElementById("misMarked"),
        settings: document.getElementById("settingButton"),
        conTrust: document.getElementById("conTrust"),
        stopTrust: document.getElementById("stopTrust")
    };

    const siteStatusDivs = {
        favicon: document.getElementById("faviconImage"),
        website: document.getElementById("websiteUrl"),
        rootCAElem: document.getElementById("rootCA"),
        rootCA: document.getElementById("rootCAInfo"),
        pkInfo: document.getElementById("pkInfo"),
        notice: document.getElementById("notice"),
        unsecure: document.getElementById("unsecure"),
        notMarked: document.getElementById("notMarked"),
        markedSame: document.getElementById("markedSameCert"),
        markedDiff: document.getElementById("markedDiffCert"),
        markedUnsafe: document.getElementById("markedUnsafe"),
        nonSens: document.getElementById("markedNonSensitive"),
        untrustText: document.getElementById("untrustText"),
        trustText: document.getElementById("trustText"),
        settings: document.getElementById("settings"),
        safeList: document.getElementById("safeList"),
        unsafeList: document.getElementById("unsafeList"),
        buttons: document.getElementById("buttons"),
        addDistrust: document.getElementById("addDistrust"),
        addTrust: document.getElementById("addTrust")
    };
    
    var faviconImage = document.getElementById("faviconImage"); //Favicon (Logo)
    var websiteUrlElement = document.getElementById("websiteUrl"); //URL

    // unblock the page and let the user use the website
    //document.getElementById('unblock').addEventListener('click', unblockWebsite);
    unblockWebsite("message");

    // get the information on the extension
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = tabs[0].url;
        console.log("url: " + url);
        const favicon = tabs[0].favIconUrl;
        websiteUrlElement.textContent = url;
        faviconImage.src = favicon;
        browser.runtime.sendMessage({ websiteUrl: url });

        // Send message when popup is opened
        browser.runtime.sendMessage({ data: "Trigger" });

        // Receive message from background.js for CA Info and update html
        browser.runtime.onMessage.addListener((request) => {
            if (request.rootCA) {
                // Check if root CA exists in the request
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
        });
        // if they click on the safe button, add the website to the safe list
        buttons.safe.addEventListener("click", function () {
            handleSiteAddition(url, "safe");
        });

        // if they click on the mismarked button, add the website to the unsafe list
        buttons.misMarked.addEventListener("click", function () {
            handleSiteAddition(url, "unsafe");
        });

        buttons.settings.addEventListener("click", () => {
            resetText();
            siteStatusDivs.settings.style.display = "block";
            const buttons = {
                seeSafeList: document.getElementById("seeSafeList"),
                seeUnsafeList: document.getElementById("seeUnsafeList")
            }
            buttons.seeSafeList.addEventListener("click", () => {
                showList("safe");
            });
            buttons.seeUnsafeList.addEventListener("click", () => {
                showList("unsafe");
            });
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
        unblockWebsite("message");
        browser.storage.local.get(type, (result) => {

            // check if lists exist, otherwise create new objects
            let safeList = result["safe"] ? result["safe"] : {};
            let unsafeList = result["unsafe"] ? result["unsafe"] : {};

            // check if URL exists in either list, and if so, remove it
            if (safeList[url]) {
                delete safeList[url];
            }
            if (unsafeList[url]) {
                delete unsafeList[url];
            }

            // add website and caInfo to the appropriate list
            if (type === "safe") {
                safeList[url] = caInfo;
            } else if (type === "unsafe") {
                unsafeList[url] = caInfo;
            }

            //save lists back to storage
            browser.storage.local.set({
                "safe": safeList,
                "unsafe": unsafeList
            });
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
     * Responsible for deleting sites from list
     * Retrieve current list from storage --> delete given url --> save list back to storage
     * @param {string} url
     * @param {string} type
     */
    function handleSiteRemoval(url, type) {
        browser.storage.local.get(type, (result) => {
            //get current list of storage
            let sitesList = result[type];
            delete sitesList[url]; //delete a url and its CA info from list
            browser.storage.local.set({ [type]: sitesList }); //save list to storage
        });
    }

    /**
     * Responsible for comparing current caInfo with stored caInfo
     * @param {string} url
     * @param {string} currentCaInfo
     */
    function checkCA(url, currentCaInfo) {
        browser.storage.local.get(["safe", "unsafe"], (result) => {
            //Get current list of storage
            //Check if the current website exists in either of the lists
            let isSensitiveSite = result.safe && result.safe[url];
            let isUnsafeSite = result.unsafe && result.unsafe[url];

            let previousCaInfo = isSensitiveSite
                ? result.safe[url]
                : isUnsafeSite
                    ? result.unsafe[url]
                    : null; // If the website is found, get the stored CA info for that website

            if (isSensitiveSite) {
                siteStatusDivs.notMarked.style.display = "none";
                if (previousCaInfo === currentCaInfo) {
                    // If the stored CA info matches the current CA info, display the "same CA" message
                    siteStatusDivs.markedDiff.style.display = "none";
                    siteStatusDivs.markedSame.style.display = "block";
                    document.getElementById("notice").textContent = "same certificate";
                    setTimeout(() => {
                        // Close window after 3 seconds
                        window.close();
                    }, 3000);
                } else {
                    // If the stored CA info does not match the current CA info, display the "different CA" message
                    siteStatusDivs.markedSame.style.display = "none";
                    siteStatusDivs.markedDiff.style.display = "block";
                    document.getElementById("notice").textContent =
                        "different certificate";
                    buttons.conTrust.addEventListener("click", function () {
                        // If user wants to continue to trust, update CA info but keep url on safe list
                        handleSiteAddition(url, "safe");
                        siteStatusDivs.markedDiff.style.display = "none";
                    });
                    buttons.stopTrust.addEventListener("click", function () {
                        // If user does not want to trust, remove url from safe list and add it to unsafe list
                        handleSiteRemoval(url, "safe");
                        handleSiteAddition(url, "unsafe");
                        siteStatusDivs.markedDiff.style.display = "none";
                    });
                }
            } else if (isUnsafeSite) {
                //if site is unsafe, users must click button to accept the risk of the site
                siteStatusDivs.notMarked.style.display = "none";
                siteStatusDivs.markedUnsafe.style.display = "block";
                let buttons = {
                    accept: document.getElementById("accept")
                };
                buttons.accept.addEventListener("click", function () {
                    unblockWebsite("force-unblock");
                    window.close();
                });
            } else {
                document.getElementById("test4").textContent = "TEST4";
                // If the website does not exist in either of the lists, display the "not marked" message
                siteStatusDivs.notMarked.style.display = "block";
                document.getElementById("notice").textContent = "no certificate saved";
            }
        });
    }

    // present the list of safe/unsafe websites to the user
    function showList(type) {
        browser.storage.local.get(type, (result) => {
            // Get the list of urls
            let sitesList = result[type];
            // If there is none, tell user
            if (sitesList === undefined || Object.keys(sitesList).length === 0) {
                document.getElementById("buttons").innerHTML = "<h3>No websites on this list. Please add some sites then check again!</h3>";
            } else {
                document.getElementById("buttons").innerHTML += "<h3>Click on a website to remove it from the list.</h3>";
                // Reset button list
                document.getElementById("buttons").innerHTML = "";
                // Get all the urls on the list
                urls = Object.keys(sitesList);
                const urlButtons = {};
                // Add each url to the html
                urls.forEach((url) => {
                    // Create button
                    document.getElementById("buttons").innerHTML += '<button id= "' + url + '">' + url + '</button>';
                    urlButtons[url] = document.getElementById(url);
                    // Add event listener for button
                    urlButtons[url].addEventListener("click", () => {
                        // Remove url from list and reload list
                        delete sitesList[url];
                        browser.storage.local.set({ [type]: sitesList });
                        showList(type);
                    });
                });
            }
            resetText();
            // Display list
            if (type === "safe") {
                siteStatusDivs.safeList.style.display = "block";
                addWebsite(document.getElementById("addTrusted"));
            } else {
                siteStatusDivs.unsafeList.style.display = "block";
                // Give user to option to manually add site to distrusted list
                addWebsite(document.getElementById("addDistrusted"));
            }
            siteStatusDivs.buttons.style.display = "block";
        });
    }


    // removes all the status
    function resetText() {
        siteStatusDivs.favicon.style.display = "none";
        siteStatusDivs.website.style.display = "none";
        siteStatusDivs.rootCA.style.display = "none";
        siteStatusDivs.rootCAElem.style.display = "none";
        siteStatusDivs.pkInfo.style.display = "none";
        siteStatusDivs.notice.style.display = "none";
        siteStatusDivs.unsecure.style.display = "none";
        siteStatusDivs.notMarked.style.display = "none";
        siteStatusDivs.markedSame.style.display = "none";
        siteStatusDivs.markedDiff.style.display = "none";
        siteStatusDivs.nonSens.style.display = "none";
        siteStatusDivs.untrustText.style.display = "none";
        siteStatusDivs.trustText.style.display = "none";
        siteStatusDivs.settings.style.display = "none";
        siteStatusDivs.safeList.style.display = "none";
        siteStatusDivs.unsafeList.style.display = "none";
        siteStatusDivs.buttons.style.display = "none";
        siteStatusDivs.addTrust.style.display = "none";
        siteStatusDivs.addDistrust.style.display = "none";
    }

    // unblock the website for the user
    function unblockWebsite(message) {
        browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
            let activeTab = tabs[0];
            console.log("Sending message from popup for tab ID: ", activeTab.id);
            if (message==="force-unblock"){
                browser.runtime.sendMessage({ tabId: activeTab.id, message: "force-unblock" });
            }
            browser.runtime.sendMessage({ tabId: activeTab.id });
            //window.close();
        });
    }

    // add websites manually to trusted/untrusted lists
    function addWebsite(button) {
        button.addEventListener("click", () => {
            resetText();
            if (button === document.getElementById("addTrusted")) {
                siteStatusDivs.addTrust.style.display = "block";
                // If they want to, display html form
                const formTrust = document.getElementById("formTrust");
                // When the form is submitted, add the given input to the trusted list
                formTrust.addEventListener("submit", () => {
                    var url = document.getElementById("siteNameTrust").value;
                    handleSiteAddition(url, "safe");
                });
            } else {
                siteStatusDivs.addDistrust.style.display = "block";
                // If they want to, display html form
                const formDistrust = document.getElementById("formDistrust");
                // When the form is submitted, add the given input to the distrusted list
                formDistrust.addEventListener("submit", () => {
                    var url = document.getElementById("siteNameDistrust").value;
                    handleSiteAddition(url, "unsafe");
                });
            }

        });
    }

    // Test the user randomly on certain visits
    function randomTesting() {
        var randomNumber = Math.random() * 1000;
        if (randomNumber % 25 === 0) {
            var urlID = document.getElementById("websiteUrl");
            var urlContent = urlID.textContent;
            var randomIndex = Math.random() * urlContent.length - 1;
            const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
            var randomLetterNum = Math.floor(Math.random() * 27);
            var randomLetter = alphabet[randomLetterNum];
            // to see which letter it's being changed to
            console.log("random index: " + randomIndex);
            console.log("random letter: " + randomLetter);
            urlID.textContent = urlContent.substring(0, randomIndex) + randomLetter + urlContent.substring(randomIndex + 1);
            siteStatusDivs.notMarked.style.display = "none";
            siteStatusDivs.markedSame.style.display = "none";
            siteStatusDivs.markedDiff.style.display = "block";
            buttons.conTrust.addEventListener('click', () => {
                if (urlID.textContent !== urlContent) {
                    // reduce points
                } else {
                    // add points
                }
            });
            buttons.stopTrust.addEventListener('click', () => {
                if (urlID.textContent !== urlContent) {
                    // add points
                } else {
                    // reduce points
                }
            });
            // TODO: change the domain name and ask the user if they think this is a safe website
            // pretend it's their first visit
            // have a point-based system, if they get it right give them 10 points, if wrong, reduce 5 points
            // put logos for each point range
        }
    }

    // updating the avatar based on the points that the user has
    function updateAvatar() {
        browser.storage.local.get("avatar", (result) => {
            var avatar = result.avatar;
            document.getElementById("avatar").src = avatar;
        });
    }
});
