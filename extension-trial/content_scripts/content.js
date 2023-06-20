let blocked = true;

if (blocked) {
    // add something here that will block the page
}

browser.runtime.onMessage.addListener((msg) => {
    if (msg === "unblock") {
        blocked = false;
        window.location.reload();
    }
});