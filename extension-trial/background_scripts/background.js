"use strict";
/* write a function that would take a click on the extension and unblock
    the page */

async function sendRootCAName(details){
    try{
        //get security info
        const securityInfo = await browser.webRequest.getSecurityInfo(
            details.requestId,
            { certificateChain: true }
        );

        if (
            (securityInfo.state === "secure" 
            || securityInfo.state === "weak") 
            && !securityInfo.isUntrusted 
            && securityInfo.certificates.length>0) { //if Root Info exists
                const root = securityInfo.certificates[0].issuer; //"subject" property from CertificateInfo Object
                let rootCA = root.substring(3,root.indexOf(",")); //substring to only include the root CA name (comma seperated list)
                browser.runtime.sendMessage({rootCA}); //send to popup.js
            }
    } catch (error){
        console.error(error);
    }
}

browser.webRequest.onHeadersReceived.addListener(
    sendRootCAName,
    { urls: ["<all_urls>"]},
    ["blocking"]
);
