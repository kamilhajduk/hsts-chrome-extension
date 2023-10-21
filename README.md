# Chrome Extension: HSTS Checker

This Chrome extension helps you check the HTTP Strict Transport Security (HSTS) headers of websites you visit. It analyzes the security headers of web requests and provides visual indicators to help you understand the security level of the current website.

Hover over the plugin icon for **extra information** about the website's security status.

## Features

**Real-time HSTS Analysis**: Analyzes HTTP and HTTPS responses in real-time to check for the presence and status of HSTS headers.

✔️ **Secure Connection**: Indicates a secure connection when both HTTP and HTTPS HSTS headers are present and enabled.

🔶 **Partially Secure**: Indicates partial security when either HTTP or HTTPS HSTS header is present and enabled or when an HTTP request has not yet been analyzed.

🔴 **Not Secure**: Warns when neither HTTP nor HTTPS HSTS headers are enabled, highlighting potential security risks.

## Installation

1. Download the extension files.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click on **Load unpacked** and select the extension folder.
5. Pin the extension in Chrome to keep the icon visible at all times.

## Usage

Once installed, the extension automatically checks the security headers of websites you visit, providing real-time feedback about the site's security status. Hover over the plugin icon for **extra details** about the website's security.

## Icon Legend

- ✔️ **Secure**: Both HTTP and HTTPS HSTS headers are enabled.
- 🔶 **Partially Secure**: Either HTTP or HTTPS HSTS header is enabled or when an HTTP request has not yet been analyzed.
- 🔴 **Not Secure**: Neither HTTP nor HTTPS HSTS headers are enabled.

## Support

For support, bug reports, and feature requests, please create an issue [here](https://github.com/kamilhajduk/hsts-chrome-extension/issues).
