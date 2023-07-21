//extra


    /**
     * 
    // update the website information on the extension
    function updateInfo(tab) {
        /**
        if (safeList.includes(url)) {
            notMarked.style.display = "none";
            // TODO: add a conditional comparing the details of the certificates and if they are the same
            /*
             * if (prev certificate component != current) {
             *     markedSame.style.display = "block";
             * }
             * else {
             *     markedDiff.style.display = "block";
             * }
             
        }
    }
    */
       // extracting the list of safe and unsafe websites from local storage
       //const safeWebsites = localStorage.getItem("safeList");
       //const unsafeWebsites = localStorage.getItem("unsafeList");
       // if they exist in local storage, retrieve them; otherwise, make a new list
       //const safeList = safeWebsites ? JSON.parse(safeWebsites) : [];
       //const unsafeList = unsafeWebsites ? JSON.parse(unsafeWebsites) : [];
/**
    // Retrieve the stored information for the current website
    function retrieveStoredInfo(url) {
        return new Promise((resolve) => {
            browser.storage.local.get(url).then((result) => {
                if (result[url]) {
                    const [storedCAInfo, isSensitive] = result[url];
                    resolve({ storedCAInfo, isSensitive });
                } else {
                    resolve(null);
                }
            });
        });
    }

    // Update the popup based on the stored information and CA info comparison
    function updatePopup(url, storedCAInfo, isSensitive) {
        const notice = document.getElementById("notice");

        if (isSensitive) {
            notice.textContent = "This website has been marked sensitive. ";
        } else {
            notice.textContent = "This website has NOT been marked sensitive. ";
        }

        //Compare CA Info
        if (storedCAInfo && storedCAInfo !== caInfo) {
            notice.textContent += "CA Info Changed";
        } else {
            notice.textContent += "CA Info NOT Changed";
        }
    }

    // Get the current tab URL, retrieve stored information, and update the popup
    function tabUpdate() {
        const queryInfo = { active: true, currentWindow: true };

        browser.tabs.query(queryInfo).then((tabs) => {
            const currentTab = tabs[0];
            const currentUrl = currentTab.url;

            retrieveStoredInfo(currentUrl).then((storedInfo) => {
                if (storedInfo) {
                    const { storedCAInfo, isSensitive } = storedInfo;
                    updatePopup(currentUrl, storedCAInfo, isSensitive);
                } else {
                    updatePopup(currentUrl, null, false);
                }
            });
        });
    }

    browser.tabs.onActivated.addListener(tabUpdate); //event listener for tab change

    tabUpdate(); //initial function call on popup load

    //save caInfo and mark sensitive
    function addToSensitive(url) {
        browser.storage.local.set({ [url]: [caInfo, true] });
    }

    //save caInfo and block
    function addToBlock(url) {
        browser.storage.local.set({ [url]: [caInfo, false] });
    }

    //Check if CA Info has changed 
    function checkCA(url) {
        retrieveStoredInfo(url).then((storedInfo) => {
            if (storedInfo && storedInfo.storedCAInfo !== caInfo) {
                markedDiff.style.display = "block"; // telling the user the CA has changed
                browser.storage.local.set({ [url]: [caInfo, storedInfo.isSensitive] });
            }
        });
    }
});


/**
// we can't set this in checkChange because it would update every time
var prevCA;
if (!prevCA) {
    prevCA = "Distrust"; // dummy value
}
*/

/** function checkChange(url) {
    const currCA = "Entrust"; // dummy value
    // check if the current CA is the same as the previous one
    if (currCA != prevCA) {
        var shouldTrust = window.confirm('The digital certificate has changed. Do you still trust this website?');

        if (shouldTrust) {
            prevCA = currCA;
        } else {
            // markWebsiteNotSecure();
        }
    }
} */

// for background.js
/* const root = securityInfo.certificates;
      let rootCA = "";
      for (let i = 0; i < securityInfo.certificates.length; i++) {
        let issuer = securityInfo.certificates[i].issuer;
        rootCA = rootCA + issuer.substring(3, issuer.indexOf(",")) + " | ";
      } */


      // commented out from popup.js in randomTesting() function 
      /* buttons.conTrust.addEventListener('click', () => {
        if (urlID.textContent !== urlContent) {
            // reduce points
            points -= 5;
            browser.storage.local.set({ points: points });
        } else {
            // add points
            points += 10;
            browser.storage.local.set({ points: points });
        }
    });
    buttons.stopTrust.addEventListener('click', () => {
        if (urlID.textContent !== urlContent) {
            // add points
            points += 10;
            browser.storage.local.set({ points: points });
        } else {
            // reduce points
            points -= 5;
            browser.storage.local.set({ points: points });
        }
    }); */