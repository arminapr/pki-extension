document.addEventListener("DOMContentLoaded", () => {
    //when the website has not been marked yet
    var notMarked = document.getElementById("notMarked");
    var safe = document.getElementById("safe");
    var misMarked = document.getElementById("misMarked");
    var misClicked = document.getElementById("misClicked");

    //Marked safe
    var markedSame = document.getElementById("markedSameCert"); //NO Cert Change
    var markedDiff = document.getElementById("markedDiffCert"); //Cert Change

    var faviconImage = document.getElementById('faviconImage'); //Favicon (Logo)
    var websiteUrlElement = document.getElementById('websiteUrl'); //URL

    var test = document.getElementById('test');
    var test1 = document.getElementById('test1');
    var test2 = document.getElementById('test2');
    var test3 = document.getElementById('test3');
    var test4 = document.getElementById('test4');

    var url;
    var rootCAInfoElement;

    /**
     * Tab Info, Favicon, URL, and MarkedSafe
     */
    browser.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var currentTab = tabs[0];
        url = currentTab.url;

        var hasClickedYes = localStorage.getItem(url) === 'yes';
        var hasClickedNo = localStorage.getItem(url) === 'no';
        
        if (hasClickedYes){
            test.style.display = 'block';
            checkCA(url); // will check CA 
        }
        if (hasClickedNo){
            blockSite(); //will block interaction to the site
        }
        
        //Display the website URL
        websiteUrlElement.textContent = url;

        // Get the favicon URL and set the HTML img content
        var faviconUrl = currentTab.favIconUrl;
        faviconImage.src = faviconUrl;
    });


    // Receive message from background.js for CA Info and update html
    browser.runtime.onMessage.addListener(
        (request, sender, sendResponse) => {
            if (request.rootCA){ // checking if root CA exists in the requesr
                const rootCAInfoElement = document.getElementById("rootCAInfo");
                rootCAInfoElement.textContent = request.rootCA;
            }
        });

    //Event Listener for Initial Addition of Website
    safe.addEventListener('click', function() {
        markWebsiteSensitive();
        markedSame.style.display = "block";
    });

    //Event Listener for Block Website
    misMarked.addEventListener('click', function(){
        markWebsiteNotSecure();
        markedSame.style.display = "block";
    });

    function markWebsiteSensitive(){
        localStorage.setItem(url, 'yes');
        localStorage.setItem(url + '-CA', rootCAInfoElement.textContent);
    }

    function markWebsiteNotSecure(){
        localStorage.setItem(url, 'no');
    }

    function checkCA(url){
        var CAthen = localStorage.getItem(url + '-CA');
        test1.style.display = "block";
        browser.runtime.onMessage.addListener(
            (request, sender, sendResponse) => {
                if (request.rootCA){ // checking if root CA exists in the requesr
                    var CAnow = request.rootCA;
                    test2.style.display = "block";
                }
            });
        test3.style.display = "block";
        test4.style.display = "block";
        test3.textContent = "A" + localStorage.getItem(url + '-CA');;
        test4.textContent = "B" + CAnow;

        if (CAthen != CAnow){
            //test3.style.display = "block";
            markedDiff.style.display = "block";
        }
        else{
            //test4.style.display = "block";
            markedSame.style.display = "block";
            notMarked.style.display = "none";
        }
        
    }
    function blockSite() {
        // TBD
      }
})


function blockSite(){
//TBD
}