("use strict");
/* write a function that would take a click on the extension and unblock
    the page */

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
            // Received message from popup.js, extension page is opened
            browser.runtime.onMessage.addListener((request) => {
                for (let i = 0; i < 1; i++) {
                    //if Root Info exists
                    const root = securityInfo.certificates[0].issuer; //"subject" property from CertificateInfo Object
                    let rootCA = root.substring(3, root.indexOf(",")); //substring to only include the root CA name (comma seperated list)
                    const publicKeyDigest = securityInfo.certificates[0].subjectPublicKeyInfoDigest;
                    console.log(publicKeyDigest);
                    // Send root data to popup.js
                    browser.runtime.sendMessage({ rootCA });
                }
            });
        }
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
