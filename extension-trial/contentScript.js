var blockerDiv = document.createElement('div');
blockerDiv.id = 'myBlockerDiv';
blockerDiv.style.position = 'fixed';
blockerDiv.style.left = '0';
blockerDiv.style.top = '0';
blockerDiv.style.width = '100%';
blockerDiv.style.height = '100%';
blockerDiv.style.zIndex = '10000';
blockerDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';

var blockerMessage = document.createElement('h1');
blockerMessage.style.color = 'white';
blockerMessage.innerHTML = 'This site is blocked by the extension.';
blockerDiv.appendChild(blockerMessage);

document.body.appendChild(blockerDiv);
