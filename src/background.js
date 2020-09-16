const PREFS = {
  isON: true,
  overlayColor: 'rgba(30, 0, 0, .9)',
  lightbox: {
    width: 800,
    height: 800,
  },
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if (request.type == 'getPrefs') {
    getPrefs().then(sendResponse);
  } else if (request.type == 'setPrefs') {
    chrome.storage.local.set({
      [`prefs:${request.host}`]: request.data
    });
  }
  return true
});

window.getPrefs = async function getPrefs() {
  return new Promise(resolve => {
    chrome.storage.local.get('prefs', res => {
      Object.assign(PREFS, res.prefs);
      resolve({...PREFS});
    });
  });
}

window.setPrefs = async function setPrefs(prefs) {
  return new Promise(async (resolve) => {
    chrome.storage.local.set({prefs}, async () => {
      resolve();
    });
  });
}

// chrome.tabs.executeScript(tabId, {file});
