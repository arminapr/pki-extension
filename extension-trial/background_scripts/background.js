// this will handle the case if the CA information has changed
var blocked = true;

browser.browserAction.onClicked.addListener(reloadPage);

function reloadPage() {
  if (blocked) {
    blocked = false;
    browser.tabs.reload();
  } else {
    blocked = true;
    browser.tabs.update({ url: "about:blank" });
  }
}