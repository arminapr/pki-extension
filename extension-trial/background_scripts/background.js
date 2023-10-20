("use strict");

// declare an empty root
var rootCA;
// declare whether certificate is EV
var evStatus;
var waitingTabs = {};

let visitedSites = {}; // Initialize an empty object to store visited sites
let tabPasswordStatus = {}; // Store tab password field status

browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {
        // Reset rootCA when the page is refreshed
        rootCA = undefined;
    }
    browser.tabs.query({ active: true, currentWindow: true })
        .then((tabs) => {
            const url = tabs[0].url; //getURL
            const urlObj = new URL(url);
            const domain = urlObj.hostname;

            console.log("tab ID in onUpdated: ", tabId);
            browser.storage.local.get(["safe", "unsafe"], (result) => {
                let isSensitiveSite = result.safe && result.safe[domain];
                let isUnsafeSite = result.unsafe && result.unsafe[domain];

                // Block the site only if it hasn't been visited in the current session
                if (!visitedSites[domain]) {
                    if (isSensitiveSite && tabPasswordStatus[tabId]) {
                        browser.tabs.executeScript(tabs[0].id, { file: 'contentScript.js' }); 
                        waitingTabs[tabId] = true; 
                    }
                    // Add the site to the list of visited sites
                    visitedSites[domain] = true;
                }
                if (isUnsafeSite && tabPasswordStatus[tabId]) {
                    browser.tabs.executeScript(tabs[0].id, { file: 'contentScript.js' });
                }
            });
        });
});

// extracts the certificate chain and sends it to the popup.js
async function sendRootCAName(details) {
    try {
        // get security info
        const securityInfo = await browser.webRequest.getSecurityInfo(
            details.requestId,
            { certificateChain: true }
        );
        // get certificate subject info
        const subjectInfo = securityInfo.certificates[0].subject;
        // check if certificate has "businessCategory" value (only found in EV certs)
        if (subjectInfo.includes("businessCategory=")) {
            evStatus = true;
        }
        else {
            evStatus = false;
        }
        if (securityInfo.state === "insecure" || securityInfo.state === "broken") {
            browser.runtime.sendMessage({ message: "no" });
        }
        // get the root certificate authority of the domain
        else if (
            !securityInfo.isUntrusted &&
            securityInfo.certificates.length > 0
        ) {
            // only continuing to get the certificate authority if it is currently undefined
            // this is an addition to ensure that the CA of site resources are not mistakenly presented
            if (typeof rootCA === "undefined") {
                // Received message from popup.js, extension page is opened
                var domain = securityInfo.certificates[0].subject;
                var root = securityInfo.certificates[0].issuer; //"subject" property from CertificateInfo Object
                browser.runtime.onMessage.addListener((message) => {
                    if (message.websiteUrl) {
                        console.log("url: " + message.websiteUrl);
                        console.log("domain: " + domain);
                        const url = message.websiteUrl;
                        let domainIndex = domain.indexOf('.');
                        let domainSub = domain.substring(domainIndex + 1);
                        let urlIndex = url.indexOf('.');
                        let urlSub = url.substring(urlIndex + 1);
                        let ind1 = domainSub.indexOf('.');
                        let ind2 = urlSub.indexOf('.');
                        if (domainSub.substring(0, ind1) === urlSub.substring(0, ind2)) {
                            rootCA = root.substring(3, root.indexOf(",")); //substring to only include the root CA name (comma seperated list)

                            const publicKeyDigest = securityInfo.certificates[0].subjectPublicKeyInfoDigest;
                            console.log(publicKeyDigest);
                        }
                    }
                })
            }
        }
        /**
        browser.runtime.onMessage.addListener((request) => {
            // Send root data to popup.js
            browser.runtime.sendMessage({ rootCA });
            browser.runtime.sendMessage({ evStatus });
        });
        */
    } catch (error) {
        console.error(error);
    }
}

// request the CA name
browser.webRequest.onHeadersReceived.addListener(
    sendRootCAName,
    { urls: ["<all_urls>"] },
    ["blocking"]
);

// Listen for tab switch events
browser.tabs.onActivated.addListener(activeInfo => {
    // Reset rootCA when the tab is changed
    rootCA = undefined;
    evStatus = undefined;
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    browser.runtime.sendMessage({ rootCA });
    browser.runtime.sendMessage({ evStatus });
    if (request.hasPassword){
        tabPasswordStatus[sender.tab.id] = true;
        console.log('Has Password: Background.js');
    }
    if (request.action === 'getPasswordStatus'){
        sendResponse({ hasPassword: !!tabPasswordStatus[sender.tab.id] });
    }
    if (request.message==="force-unblock"){
        browser.tabs.executeScript(request.tabId, {
            code: 'var blockerDiv = document.getElementById("myBlockerDiv"); if (blockerDiv) { blockerDiv.parentNode.removeChild(blockerDiv); }'
        });
    }
    if (waitingTabs[request.tabId]) {
        browser.tabs.executeScript(request.tabId, {
            code: 'var blockerDiv = document.getElementById("myBlockerDiv"); if (blockerDiv) { blockerDiv.parentNode.removeChild(blockerDiv); }'
        });
        delete waitingTabs[request.tabId];
    }
});