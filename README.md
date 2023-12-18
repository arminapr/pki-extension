# PKI Extension

[Name TBD]   

## General Description

Helps to keep users information secure by monitoring the certificate information websites that the users enter sensitive infomation into and warning users about websites that they have previously deemed unsafe.

## Extension Flow

<img width="1121" alt="Screenshot 2023-12-18 at 1 21 31 PM" src="https://github.com/arminapr/pki-extension/assets/115113212/4b7ae06e-addb-4157-b323-956fc233ceef">

![flow-2](https://github.com/arminapr/pki-extension/assets/118499953/e565323e-8a89-4b71-9e08-95dc22774c47)

## Technologies Used
HTML, CSS, JavaScript

### Files
#### 1. popup.html- 
Content of the extension popup
#### 2. popup.css- 
Styling of the extension popup
#### 3. popup.js- 
Most functions related to the extension (like adding/removing sites from sensitive/unsafe lists, etc).
#### 4. background.js- 
Mostly used to communicate back and forth with popup.js to provide crucial information like CA (certificate authority) info, blocking websites, etc. Some functions that cannot be performed by popup.js (or are too complicated to implement) are performed here. 
#### 5. contentScript.js- 
It has CSS styling that is injected to a webpage (by background.js). This CSS styling “blocks” the website by creating an overlay over the website (i.e. users will be clicking the overlay instead of the website, getting no response). 


## Main Features

### Sensitive Sites
When users visit a website where they are entering sensitive information, like a banking website, they can mark the site as sensitive. The next time that they visit the website, must click on the extension to make sure that they are on the correct website and the websites' certificate is unchanged. The website will be blocked until they click on the extension.

### Unsafe Sites
When the user visits a site that they suspect is unsafe, due to phishing or some other reason, they mark it as unsafe. Upon subsequent visits to the site, the page will be blocked until the user clicks on the extension and then confirms their acknowledgement of the risks of accessing an unsafe site.

### Settings
The settings includes the following features (more to be added):
- View list of sensitive sites
    - Remove sites from list
    - Manually add site by url
- View list of unsafe sites
    - Remove sites from list
    - Manually add site by url

### Points System
The user will be randomly tested while they are using the extension. To do this testing, we change one of the characters in the domain name of the website and ask the user if they still trust the website. If they answer correctly, 10 points will be added. If they answer incorrectly, 5 points will be reduced. The message of the game is still in the making.

### Extended Validation Certificates
When a website has an extended validation (EV) certificate, there is a checkmark that is displayed next to the root domain in the extension. If a website changes from an EV certificate to an organization or domain certificate (which both require less information and are easier to fake), there is a warning message given to the user.

## Next Steps

- Revamp visuals
- Revamp text
- Connect to database to collect results
- Complete necessary steps to get extension added to Firefox extension store

## Known Issues

- TypeError exception thrown in popup.js on line 388, message "can't access dead object"

## Download Instructions
1. Download project from GitHub repository
2. Open firefox browser and type [about:debugging] (about:debugging) into the address bar
3. On the left side, click on "This Firefox"
4. Under "Temporary Instructions" click "Load Temporary Add-on..."
5. Navigate to the project folder and open "pki-extension/extension-trial/manifest.json"  
6. Extension has been loaded!

### To Use
To use the extension, click on the puzzle piece in the Firefix toolbar (upper right side), and click on PKI-extension. Optionally, you can right click on the extension and "pin to toolbar" so that it appear next to the puzzle piece.

### To Debug
In the about:debugging page, next to the extension name, click the "Inspect" button. Keeping the Inspect tab open as you use the extension allows you to view all errors and logs, as well as set up breakpoints to watch the code run line by line. 

##Firefox Developers Edition-
1. Download and install Firefox Developer Edition on your device.
2. Go to about:config and change xpinstall.signatures.required to false.
![Screenshot 2023-11-17 at 9 47 51 AM](https://github.com/arminapr/pki-extension/assets/118499953/523ce3a4-0dee-4460-8f21-fb4105419ee5)
3. Compress the extension files into a .zip file (make sure manifest.json is at the root).
4. Go to about:addons, and choose the Install Add-on from file option, choose the .zip file created in the previous step.
![Screenshot 2023-11-17 at 9 50 54 AM](https://github.com/arminapr/pki-extension/assets/118499953/ca65f515-ea4f-4ce8-80b0-6583876f17bc)
5. The extension is now installed permanently on the developer edition browser and can be accessed through the toolbar.


## Helpful Resources

- [submitting extension to be added to Firefox store](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/)
- [diagram of extension (not up-to-date)](https://excalidraw.com/#room=76f1120b127f55a2ae25,gcjqMcJaHTqGeiAoBSeptA)
- [link for the source of the checkmark image](https://www.freeimages.com/clipart/circle-checkmark-clip-art-5333016)
- [basic information about creating a Firefox extension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension)
- [examples of simple Firefox extensions](https://github.com/mdn/webextensions-examples)
