'use strict';

// Object to store headers for each tab and request
var headerStore = {};

// Event listener for web requests before redirect
chrome.webRequest.onBeforeRedirect.addListener(function(info) {
    // Check if the request should be logged
    if (!isRequestLoggable(info)) {
        return;
    }

    // Extract relevant information from the request
    let requestId = String(info.requestId);
    let tabId = String(info.tabId);
    let headers = info.responseHeaders;
    let url = new URL(info.url);
    let hsts = findHeader(headers);

    // Check if the tab is already in the header store, if not, create an entry for it
    if (!isDefined(headerStore[tabId])) {
        headerStore[tabId] = [];
    }

    // If the request is over HTTP, update the header store with the HSTS information
    if (url.protocol == 'http:') {
        headerStore[tabId][requestId] = {
            'http': {
                'enable': true,
                'hsts': hsts
            }
        };
    }
}, {
    urls: ['http://*/*', 'https://*/*'],
    types: ['main_frame']
}, ['responseHeaders']);

// Event listener for headers received in web requests
chrome.webRequest.onHeadersReceived.addListener(function(info) {
    // Check if the request should be logged
    if (!isRequestLoggable(info)) {
        return;
    }

    // Extract relevant information from the request
    let requestId = String(info.requestId);
    let tabId = String(info.tabId);
    let headers = info.responseHeaders;
    let url = new URL(info.url);
    let hsts = findHeader(headers);

    // Check if the tab and request is already in the header store, if not, create an entry for it
    if (!isDefined(headerStore[tabId]) || !isDefined(headerStore[tabId][requestId])) {
        headerStore[tabId] = [];
        headerStore[tabId][requestId] = {};
    }

    // If the request is over HTTPS, update the header store with the HSTS information
    if (url.protocol == 'https:') {
        let object = {
            'https': {
                'enable': true,
                'hsts': hsts
            }
        };

        if (isDefined(headerStore[tabId][requestId].http)) {
            object.http = headerStore[tabId][requestId].http;
        }
        headerStore[tabId][requestId] = object;
    } else if (url.protocol == 'http:') {
        // If the request is over HTTP, update the header store with the HSTS information
        headerStore[tabId][requestId] = {
            'http': {
                'enable': true,
                'hsts': hsts
            }
        };
    }
}, {
    urls: ['http://*/*', 'https://*/*'],
    types: ['main_frame']
}, ['responseHeaders']);

// Event listener for completed web requests
chrome.webRequest.onCompleted.addListener(function(info) {
    // Check if the request should be logged
    if (!isRequestLoggable(info)) {
        return;
    }

    // Extract relevant information from the request
    let requestId = String(info.requestId);
    let tabId = String(info.tabId);

    // Check if the request and tab exist in the header store
    if (!isDefined(headerStore[tabId]) || !isDefined(headerStore[tabId][requestId])) {
        return;
    }

    // Retrieve HSTS information for the request
    let httpHsts, httpsHsts;
    if (isDefined(headerStore[tabId][requestId].http)) {
        httpHsts = headerStore[tabId][requestId].http.hsts;
    }
    if (isDefined(headerStore[tabId][requestId].https)) {
        httpsHsts = headerStore[tabId][requestId].https.hsts;
    }

    // Check HSTS headers and update extension's title and icon
    checkHSTS(httpHsts, httpsHsts);

    // Remove the request from the header store to free up memory
    delete headerStore[tabId][requestId];
}, {
    urls: ['http://*/*', 'https://*/*'],
    types: ['main_frame']
});

// Event listener when a tab is activated
chrome.tabs.onActivated.addListener(function() {
    // Retrieve active tab and enable the extension's action
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        let tab = tabs.shift();
        chrome.action.enable(tab.id);
    });
});

// Event listener when a new tab is created
chrome.tabs.onCreated.addListener(function(tab) {
    // Enable the extension's action for the newly created tab
    chrome.action.enable(tab.id);
    // Initialize headerStore entry for the new tab and set initial title and icon
    headerStore[tab.id] = [];
    changeTitle('Empty');
    changeIcon('.');
});

// Event listener when a tab is updated
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // Check if the tab has completed loading and is not a special tab
    if (changeInfo.status === 'complete' && parseInt(tabId, 10) > 0) {
        // Enable the extension's action for the updated tab
        chrome.action.enable(tab.id);
    }
});

// Function to check the HSTS headers and update the extension's icon and title accordingly
function checkHSTS(httpHsts, httpsHsts) {
    // Check if both HTTP and HTTPS HSTS headers are present
    if (isDefined(httpHsts) && isDefined(httpsHsts)) {
        // Check if neither HTTP nor HTTPS HSTS headers are enabled
        if (!httpHsts.enable && !httpsHsts.enable) {
            changeTitle('Both HTTP and HTTPS HSTS headers not exist - Most dangerous');
            changeIcon('danger');
        }
        // Check if only HTTP HSTS header is enabled
        else if (httpHsts.enable && !httpsHsts.enable) {
            changeTitle('HTTP HSTS exists, but SSL redirect not used - Secure');
            changeIcon('success');
        }
        // Check if only HTTPS HSTS header is enabled
        else if (!httpHsts.enable && httpsHsts.enable) {
            changeTitle('HTTP HSTS not exists, but HTTPS does. Also SSL redirect is used - Secure');
            changeIcon('success');
        }
    }
    // Check if only HTTPS HSTS header is present
    if (!isDefined(httpHsts) && isDefined(httpsHsts)) {
        // Check if HTTPS HSTS header is enabled
        if (httpsHsts.enable) {
            changeTitle('HTTPS HSTS exists - Secure, but HTTP response needs to be verified');
            changeIcon('success');
        }
        // Check if HTTPS HSTS header is not enabled
        else {
            changeTitle('HTTPS HSTS not exist - Maybe danger, but HTTP response needs to be verified');
            changeIcon('warning');
        }
    }
    // Check if only HTTP HSTS header is present
    if (isDefined(httpHsts) && !isDefined(httpsHsts)) {
        // Check if HTTP HSTS header is enabled
        if (httpHsts.enable) {
            changeTitle('HTTP HSTS exists, but SSL redirect not used - Secure');
            changeIcon('success');
        }
        // Check if HTTP HSTS header is not enabled
        else {
            changeTitle('HTTP HSTS not exist and SSL redirect not used - Most dangerous');
            changeIcon('danger');
        }
    }
}

// Function to check if a request should be logged
function isRequestLoggable(info) {
    // Check if the tabId is valid, the URL is valid, and the request type is 'main_frame'
    return parseInt(info.tabId, 10) > 0 && isValidUrl(info.url) && info.type === 'main_frame';
}

// Function to validate a URL
function isValidUrl(url) {
    // Check if the URL is a valid string and does not match specific patterns
    return typeof url === 'string' &&
        url.indexOf('sourceid=chrome-instant') === -1 &&
        url.indexOf('async/newtab?async=') === -1 &&
        url.indexOf('chrome/newtab?') === -1 &&
        url.indexOf('https://ogs.google.com') !== 0;
}

// Function to check if an object is defined
function isDefined(object) {
    // Check if the object is not undefined
    return typeof object !== 'undefined';
}

// Function to change extension icon based on status
function changeIcon(status) {
    // Change the extension's icon based on the provided status
    chrome.action.setIcon({
        path: {
            19: 'icons/' + status + '/19.png',
            38: 'icons/' + status + '/38.png'
        }
    });
}

// Function to change extension title
function changeTitle(title) {
    // Change the extension's title to the provided value
    chrome.action.setTitle({
        title: title
    });
}

// Function to find HSTS header in response headers
function findHeader(headers) {
    // Initialize HSTS object with default values
    let hsts = {
        enable: false,
        value: ''
    };

    // Iterate through the response headers and find 'Strict-Transport-Security' header
    for (let index = 0; index < headers.length; ++index) {
        const header = headers[index];
        if (header.name.toLowerCase() === 'strict-transport-security') {
            // If 'Strict-Transport-Security' header is found, update HSTS object
            hsts.enable = true;
            hsts.value = header.value;
        }
    }

    return hsts;
}