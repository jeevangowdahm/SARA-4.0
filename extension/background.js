/**
 * SARA Chrome Extension - Background Service Worker (Manifest V3)
 * Manages side panel access, messaging relays, and activeTab lifecycle.
 */

// Configure side panel behavior on installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('[SARA 3.0] Background Service Worker Installed.');
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err) => {
      console.warn('Could not set openPanelOnActionClick:', err);
    });
  }
});

// Relay messages if needed between side panel and active tabs
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'GET_ACTIVE_TAB_INFO') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        sendResponse({ tabId: tabs[0].id, url: tabs[0].url, title: tabs[0].title });
      } else {
        sendResponse({ error: 'No active tab found' });
      }
    });
    return true; // Keep channel open for async response
  }
});

