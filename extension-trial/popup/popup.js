// Global variable for CA info
let caInfo;
let evCert;
let timeout;
let webDomain;

document.addEventListener("DOMContentLoaded", () => {
    const buttons = {
        visit: document.getElementById("visit"),
        safe: document.getElementById("safe"),
        misMarked: document.getElementById("misMarked"),
        continueUntrust: document.getElementById("continueUntrust"),
        continueTrust: document.getElementById("continueTrust"),
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
        addUntrust: document.getElementById("addUntrust"),
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
        addTrust: document.getElementById("addTrust"),
        manuallyTrusted: document.getElementById("manuallyTrusted"),
        changedEV: document.getElementById("changedEV")
    };

    var faviconImage = document.getElementById("faviconImage"); //Favicon (Logo)
    var websiteUrlElement = document.getElementById("websiteUrl"); //URL

    // unblock the page and let the user use the website
    //document.getElementById('unblock').addEventListener('click', unblockWebsite);
    unblockWebsite("message");

    // get the information on the extension
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        console.log("at the top");
        const url = tabs[0].url;
        console.log("url: " + url);
        const urlObj = new URL(url);
        webDomain = urlObj.hostname;
        const favicon = tabs[0].favIconUrl;
        websiteUrlElement.textContent = webDomain;
        faviconImage.src = favicon;
        browser.runtime.sendMessage({ websiteUrl: url });

        // Send message when popup is opened
        browser.runtime.sendMessage({ data: "Trigger" });

        // Receive message from background.js for CA Info and update html
        browser.runtime.onMessage.addListener((request) => {
            if (request.rootCA) {
                // Check if root CA exists in the request
                caInfo = request.rootCA;
                document.getElementById("rootCAInfo").textContent = caInfo + " ";
                // Add a checkmark if site has an EV certificate
                if (evCert === true) {
                    document.getElementById("rootCAInfo").innerHTML += '<img src="../icons/checkmark.png"  style="width:20px;height:20px;" alt="Checkmark icon" />';
                }
                checkCA(webDomain, caInfo, evCert);
            }
            if (request.evStatus != undefined) {
                evCert = request.evStatus;
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
            handleSiteAddition(domain, "safe");
        });

        // if they click on the mismarked button, prompt them the question of which list they want to add it to
        buttons.misMarked.addEventListener("click", function () {
            siteStatusDivs.notMarked.style.display = "none";
            siteStatusDivs.addUntrust.style.display = "block";
        });

        // add the websites to the respective lists
        buttons.continueUntrust.addEventListener("click", function () {
            handleSiteAddition(domain, "unsafe");
        })
        buttons.continueTrust.addEventListener("click", function () {
            handleSiteAddition(domain, "safe");
        })

        buttons.settings.addEventListener("click", () => {
            resetText();
            clearTimeout(timeout);
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
        randomTesting(webDomain);
    });

    /**
     * Responsible for adding sites to list
     * Retrieve current list from storage --> add new website --> save list back to storage
     * Also display message for safe site
     * @param {string} domain
     * @param {string} type
     */
    function handleSiteAddition(domain, type) {
        browser.storage.local.get(type, (result) => {

            // check if lists exist, otherwise create new objects
            let safeList = result["safe"] ? result["safe"] : {};
            let unsafeList = result["unsafe"] ? result["unsafe"] : {};

            // check if URL exists in either list, and if so, remove it
            if (safeList[domain]) {
                delete safeList[domain];
            }
            if (unsafeList[domain]) {
                delete unsafeList[domain];
            }

            // add website and caInfo to the appropriate list
            if (type === "safe") {
                safeList[domain] = [caInfo, evCert];
                console.log(safeList[domain]);
            } else if (type === "unsafe") {
                unsafeList[domain] = [caInfo, evCert];
                console.log(unsafeList[domain]);
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
     * @param {string} domain
     * @param {string} type
     */
    function handleSiteRemoval(domain, type) {
        browser.storage.local.get(type, (result) => {
            //get current list of storage
            let sitesList = result[type];
            delete sitesList[domain]; //delete a url and its CA info from list
            browser.storage.local.set({ [type]: sitesList }); //save list to storage
        });
    }

    /**
     * Responsible for comparing current caInfo with stored caInfo
     * @param {string} domain
     * @param {string} currentCaInfo
     */
    function checkCA(domain, currentCaInfo, currentEvCert) {
        browser.storage.local.get(["safe", "unsafe"], (result) => {
            //Get current list of storage
            //Check if the current website exists in either of the lists
            let isSensitiveSite = result.safe && result.safe[domain];
            let isUnsafeSite = result.unsafe && result.unsafe[domain];

            let previousCaInfo = isSensitiveSite
                ? result.safe[domain][0]
                : isUnsafeSite
                    ? result.unsafe[domain][0]
                    : null; // If the website is found, get the stored CA info for that website

            let previousEvCert = isSensitiveSite
                ? result.safe[domain][1]
                : isUnsafeSite
                    ? result.unsafe[domain][1]
                    : null; // If the website is found, get the stored CA info for that website


            if (isSensitiveSite) {
                siteStatusDivs.notMarked.style.display = "none";
                let urlContent = siteStatusDivs.website.textContent;
                console.log("content: " + urlContent);
                if (previousCaInfo === currentCaInfo && domain === urlContent) {
                    // If the stored CA info matches the current CA info, display the "same CA" message
                    siteStatusDivs.markedDiff.style.display = "none";
                    siteStatusDivs.markedSame.style.display = "block";
                    document.getElementById("notice").textContent = "same information";
                    if (timeout === undefined) {
                        timeout = setTimeout(() => {
                            // Close window after 3 seconds
                            window.close();
                            timeout = undefined;
                        }, 3000);
                    }
                    // If user adds site manually, no CA info is stored so user must confirm their trust in the site upon first visit
                } else if (previousCaInfo === "NEWLY ADDED") {
                    siteStatusDivs.manuallyTrusted.style.display = "block";
                    const buttons = {
                        confirmTrusted: document.getElementById("confirmTrusted"),
                        cancelTrusted: document.getElementById("cancelTrusted")
                    }
                    buttons.confirmTrusted.addEventListener("click", function () {
                        handleSiteAddition(url, "safe");
                        window.close();
                    });
                    buttons.cancelTrusted.addEventListener("click", function () {
                        handleSiteRemoval(url, "safe");
                        window.close();
                    });
                } else {
                    // If the stored CA info does not match the current CA info, display the "different CA" message
                    siteStatusDivs.markedSame.style.display = "none";
                    siteStatusDivs.markedDiff.style.display = "block";
                    document.getElementById("notice").textContent =
                        "different information";
                    // if cert is downgraded from EV, show extra warning
                    if (previousEvCert === true && currentEvCert === false) {
                        siteStatusDivs.changedEV.style.display = "block";
                    }
                    buttons.conTrust.addEventListener("click", function () {
                        // If user wants to continue to trust, update CA info but keep url on safe list
                        handleSiteAddition(domain, "safe");
                        siteStatusDivs.markedDiff.style.display = "none";
                        updatePoints(true, domain);
                    });
                    buttons.stopTrust.addEventListener("click", function () {
                        // If user does not want to trust, remove url from safe list and add it to unsafe list
                        handleSiteRemoval(domain, "safe");
                        handleSiteAddition(domain, "unsafe");
                        siteStatusDivs.markedDiff.style.display = "none";
                        updatePoints(false, domain);
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
                // document.getElementById("test4").textContent = "TEST4";
                // If the website does not exist in either of the lists, display the "not marked" message
                siteStatusDivs.notMarked.style.display = "block";
                document.getElementById("notice").textContent = "Unsaved site";
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
                // Reset button list
                document.getElementById("buttons").innerHTML = "<h3>Click on a website to remove it from the " + type + " list.</h3>";
                // Get all the urls on the list
                urls = Object.keys(sitesList);
                // Add each url to the html
                urls.forEach((url) => {
                    // Create button
                    var button = document.createElement("button");
                    button.innerText = url;
                    // Add event listener for button
                    button.addEventListener("click", () => {
                        // Remove url from list and reload list
                        delete sitesList[url];
                        browser.storage.local.set({ [type]: sitesList });
                        showList(type);
                    });
                    // Add button to html
                    document.getElementById("buttons").appendChild(button);
                });
            }
            resetText();
            if (type === "safe") {
                // Give user to option to manually add site to trusted list
                siteStatusDivs.safeList.style.display = "block";
                addWebsite(document.getElementById("addTrusted"));
            } else {
                // Give user to option to manually add site to distrusted list
                siteStatusDivs.unsafeList.style.display = "block";
                addWebsite(document.getElementById("addDistrusted"));
            }
            // Display list
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
        siteStatusDivs.addUntrust.style.display = "none";
        siteStatusDivs.markedSame.style.display = "none";
        siteStatusDivs.markedDiff.style.display = "none";
        siteStatusDivs.markedUnsafe.style.display = "none";
        siteStatusDivs.nonSens.style.display = "none";
        siteStatusDivs.untrustText.style.display = "none";
        siteStatusDivs.trustText.style.display = "none";
        siteStatusDivs.settings.style.display = "none";
        siteStatusDivs.safeList.style.display = "none";
        siteStatusDivs.unsafeList.style.display = "none";
        siteStatusDivs.buttons.style.display = "none";
        siteStatusDivs.addTrust.style.display = "none";
        siteStatusDivs.addDistrust.style.display = "none";
        siteStatusDivs.manuallyTrusted.style.display = "none";
        siteStatusDivs.changedEV.style.display = "none";
    }

    // unblock the website for the user
    function unblockWebsite(message) {
        browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
            let activeTab = tabs[0];
            console.log("Sending message from popup for tab ID: ", activeTab.id);
            if (message === "force-unblock") {
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
                    caInfo = "NEWLY ADDED";
                    const urlObj = new URL(document.getElementById("siteNameTrust").value);
                    const domain = urlObj.hostname;
                    handleSiteAddition(domain, "safe");
                    showList("safe");
                });
            } else {
                siteStatusDivs.addDistrust.style.display = "block";
                // If they want to, display html form
                const formDistrust = document.getElementById("formDistrust");
                // When the form is submitted, add the given input to the distrusted list
                formDistrust.addEventListener("submit", () => {
                    const urlObj = new URL(document.getElementById("siteNameDistrust").value);
                    const domain = urlObj.hostname;
                    handleSiteAddition(domain, "unsafe");
                });
            }
        });
    }

    // Test the user randomly on certain visits
    function randomTesting(domain) {
        browser.storage.local.get("safe", (lists) => {
            let safelist = lists["safe"];
            console.log(safelist);
            if (domain in safelist) {
                console.log("it is");
                browser.storage.local.get("points", (result) => {
                    let points = result.points ? result.points : 0;
                    // code below commented because it needs to be written in the html content first
                    document.getElementById("pointValue").textContent = points;
                    var randomNumber = Math.random() * 1000;
                    // if (randomNumber % 10 === 0) {
                        console.log("random test activated");
                        var urlID = document.getElementById("websiteUrl");
                        var urlContent = urlID.textContent;
                        var randomIndex = Math.random() * urlContent.length - 1;
                        const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
                        var randomLetterNum = Math.floor(Math.random() * 27);
                        var randomLetter = alphabet[randomLetterNum];
                        // to see which letter it's being changed to
                        console.log("random index: " + randomIndex);
                        console.log("random letter: " + randomLetter);
                        // change the url on the extension
                        urlID.textContent = urlContent.substring(0, randomIndex) + randomLetter + urlContent.substring(randomIndex + 1);
                        // tell the user some information has changed and ask if they still trust the website
                        console.log("points: " + points);
                    // }
                });
            }
        })
    }

    // updating the avatar based on the points that the user has
    function updateAvatar(points) {
        var avatarSrc;
        // change the avatar based on the point
        switch (points) {
            case (points < 50):
                avatarSrc = "../icons/goldfish.png";
                break;
            case (points < 100):
                avatarSrc = "../icons/sardine.png";
                break;
            case (points < 200):
                avatarSrc = "../icons/salmon.png";
                break;
            case (points >= 200):
                avatarSrc = "../icons/whale.png";
                break;
        }
        document.getElementById("avatarPic").src = avatarSrc;
    }

    // update the points as needed
    function updatePoints(type) {
        browser.storage.local.get("points", (result) => {
            let points = result.points ? result.points : 0;
            var urlID = document.getElementById("websiteUrl");
            var urlContent = urlID.textContent;
            if (type === true) {
                console.log("initial: " + points);
                if (urlContent !== webDomain) {
                    // reduce points
                    points -= 5;
                } else {
                    // add points
                    points += 10;
                }
            } else if (type === false) {
                if (urlContent !== webDomain) {
                    // add points
                    points += 10;
                } else {
                    // reduce points
                    points -= 5;
                }
            }
            console.log("points: " + points);
            browser.storage.local.set({ points: points });
            // update the user avatar
            updateAvatar(points);
        });
    }
});