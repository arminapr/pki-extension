# PKI Extension

[Name TBD]   

## General Description

Helps to keep users information secure by monitoring the certificate information websites that the users enter sensitive infomation into and warning users about websites that they have previously deemed unsafe.

## Extension Flow

<img width="749" alt="Screenshot 2023-08-03 at 1 33 53 AM" src="https://github.com/arminapr/pki-extension/assets/118499953/1f788a96-af0e-4324-bb22-ee31aaf1a31a">

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

(TODO)

### Extended Validation Certificates
When a website has an extended validation (EV) certificate, there is a checkmark that is displayed next to the root domain in the extension. If a website changes from an EV certificate to an organization or domain certificate (which both require less information and are easier to fake), there is a warning message given to the user.

## Next Steps

- Revamp visuals
- Revamp text
- Connect to database to collect results
- Complete necessary steps to get extension added to FireFox extension store

## Known Issues

- Exception thrown when user adds a site manually to either list, has to do with dead objects.

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

## Helpful Resources

- [submitting extension to be added to FireFix store](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/)
- [diagram of extension (not up-to-date)](https://excalidraw.com/#room=76f1120b127f55a2ae25,gcjqMcJaHTqGeiAoBSeptA)
- [link for the source of the checkmark image](https://www.freeimages.com/clipart/circle-checkmark-clip-art-5333016)
