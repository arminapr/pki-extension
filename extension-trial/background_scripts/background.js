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
      //if Root Info exists
      const root = securityInfo.certificates;
      let rootCA = "";
      for (let i = 0; i < securityInfo.certificates.length; i++) {
        let issuer = securityInfo.certificates[i].issuer;
        rootCA = rootCA + issuer.substring(3, issuer.indexOf(",")) + " | ";
      }
      // const root = securityInfo.certificates[securityInfo.certificates.length - 1].issuer; //"subject" property from CertificateInfo Object
      // let rootCA = root.substring(3, root.indexOf(",")); //substring to only include the root CA name (comma seperated list)

      console.log("Sender 1");

      // Received message from popup.js, extension page is opened
      browser.runtime.onMessage.addListener((request) => {
        // Send root data to popup.js
        console.log("Sender 2");
        browser.runtime.sendMessage({ rootCA });
      });
    }
  } catch (error) {
    console.error(error);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

browser.webRequest.onHeadersReceived.addListener(
  sendRootCAName,
  { urls: ["<all_urls>"] },
  ["blocking"]
);
