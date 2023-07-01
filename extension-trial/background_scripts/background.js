("use strict");
/* write a function that would take a click on the extension and unblock
    the page */

// declare an empty root
var rootCA;

// extracts the certificate chain and sends it to the popup.js
async function sendRootCAName(details) {
    try {
        // get security info
        const securityInfo = await browser.webRequest.getSecurityInfo(
            details.requestId,
            { certificateChain: true }
        );
        if (securityInfo.state === "insecure" || securityInfo.state === "broken") {
            browser.runtime.sendMessage({ message: "no" });
        }
        // get the root certificate authority of the domain
        else if (
            !securityInfo.isUntrusted &&
            securityInfo.certificates.length > 0
        ) {
            if (typeof rootCA === "undefined") {
                // Received message from popup.js, extension page is opened
                var domain = securityInfo.certificates[0].subject;
                var root = securityInfo.certificates[0].issuer; //"subject" property from CertificateInfo Object
                console.log("domain: " + domain);
                browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    // there are more domains that we need to filter
                    if (domain.charAt(3) != '*' || tabs[0].url === "https://www.google.com/" || domain === "CN=*.godaddysites.com" || domain === "CN=*.dw.com,O=Deutsche Welle,L=Bonn,ST=Nordrhein-Westfalen,C=DE") {
                        rootCA = root.substring(3, root.indexOf(",")); //substring to only include the root CA name (comma seperated list)

                        const publicKeyDigest = securityInfo.certificates[0].subjectPublicKeyInfoDigest;
                        console.log(publicKeyDigest);
                    }
                })
            }
        }
        browser.runtime.onMessage.addListener((request) => {
            // Send root data to popup.js
            browser.runtime.sendMessage({ rootCA });
        });
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

// Listen for tab update events
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        // Reset rootCA when the page is refreshed
        rootCA = undefined;
    }
});

// Listen for tab switch events
browser.tabs.onActivated.addListener(activeInfo => {
    // Reset rootCA when the tab is changed
    rootCA = undefined;
});