// Listen for messages
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "blockWebsite") {
        blockWebsite();
    }
});

function blockWebsite() {
    // Create overlay
    let overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '9999';

    // Create button
    let button = document.createElement('button');
    button.innerText = 'WEBSITE BLOCKED. CLICK ON EXTENSION';
    button.style.position = 'absolute';
    button.style.top = '50%';
    button.style.left = '50%';
    button.style.transform = 'translate(-50%, -50%)';
    button.style.fontSize = '20px';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = 'blue';
    button.style.color = 'white';

    // Append button to overlay
    overlay.appendChild(button);

    // Append overlay to body
    document.body.appendChild(overlay);
}
