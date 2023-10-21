# HSTS Checker: Chrome Extension

This Chrome extension helps you check the HTTP Strict Transport Security (HSTS) headers of websites you visit. It analyzes the security headers of web requests and provides visual indicators to help you understand the security level of the current website.

Hover over the plugin icon for **extra information** about the website's security status.

## Features ✨

**Real-time HSTS Analysis**: Analyzes HTTP and HTTPS responses in real-time to check for the presence and status of HSTS headers.

**Visual indicators**: Provides visual indicators to help you understand the security level in real-time.

## Installation 🚀

1. Download the extension files.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click on **Load unpacked** and select the extension folder.
5. Pin the extension in Chrome to keep the icon visible at all times.

## Usage 🔧

Once installed, the extension automatically checks the security headers of websites you visit, providing real-time feedback about the site's security status. Hover over the plugin icon for **extra details** about the website's security.

## Icon Legend 🗝️

- ✔️ **Secure**: HTTP or HTTPS header is present.
- 🔶 **Partially Secure**: HTTPS header is not present and HTTP request has not yet been analyzed.
- 🔴 **Not Secure**: Neither HTTP nor HTTPS header is present.

## Support 💬

For support, bug reports, and feature requests, please create an issue [here](https://github.com/kamilhajduk/hsts-chrome-extension/issues).
